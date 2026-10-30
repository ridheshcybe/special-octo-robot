import os
import shutil
import tarfile
import time
import requests
import google.auth.transport.requests
from google.oauth2 import service_account
from google.cloud import compute_v1

KEY_PATH = "gcp-key.json"
PROJECT_ID = "prepmeupai"
ZONE = "us-central1-a"
INSTANCE = "prepmeup-edge-proxy"
BUCKET = "prepmeupai-build-store-2026"

def get_credentials():
    return service_account.Credentials.from_service_account_file(
        KEY_PATH,
        scopes=["https://www.googleapis.com/auth/cloud-platform"]
    )

def prepare_standalone_package():
    print("[1/4] Preparing Next.js standalone assets...")
    standalone_dir = os.path.join(".next", "standalone")
    standalone_next_static = os.path.join(standalone_dir, ".next", "static")
    source_static = os.path.join(".next", "static")

    if os.path.exists(source_static):
        print(f"[*] Copying .next/static to {standalone_next_static}...")
        if os.path.exists(standalone_next_static):
            shutil.rmtree(standalone_next_static)
        shutil.copytree(source_static, standalone_next_static)

    standalone_public = os.path.join(standalone_dir, "public")
    source_public = "public"
    if os.path.exists(source_public):
        print(f"[*] Copying public to {standalone_public}...")
        if os.path.exists(standalone_public):
            shutil.rmtree(standalone_public)
        shutil.copytree(source_public, standalone_public)

    tar_path = "standalone_bundle.tar.gz"
    print(f"[*] Packaging {standalone_dir} into {tar_path}...")
    with tarfile.open(tar_path, "w:gz") as tar:
        for item in os.listdir(standalone_dir):
            item_path = os.path.join(standalone_dir, item)
            tar.add(item_path, arcname=item)
    
    size_mb = os.path.getsize(tar_path) / (1024 * 1024)
    print(f"[+] Archive created successfully: {size_mb:.2f} MB")
    return tar_path

def upload_bundle_to_gcs(tar_path):
    print("[2/4] Uploading standalone_bundle.tar.gz to Google Cloud Storage...")
    creds = get_credentials()
    req = google.auth.transport.requests.Request()
    creds.refresh(req)
    headers = {
        'Authorization': f'Bearer {creds.token}',
        'Content-Type': 'application/gzip'
    }

    url = f"https://storage.googleapis.com/upload/storage/v1/b/{BUCKET}/o?uploadType=media&name=standalone_bundle.tar.gz"
    with open(tar_path, 'rb') as f:
        r = requests.post(url, headers=headers, data=f)
    print("Bundle upload HTTP status:", r.status_code)
    if r.status_code not in (200, 201):
        raise RuntimeError(f"GCS upload failed: {r.text}")

    # Make readable by the VM
    acl_url = f"https://storage.googleapis.com/storage/v1/b/{BUCKET}/o/standalone_bundle.tar.gz?predefinedAcl=publicRead"
    requests.patch(acl_url, headers=headers)
    print("[+] GCS Object permissions updated to publicRead.")

def restart_vm():
    print("[3/4] Resetting GCP VM prepmeup-edge-proxy to pull and run updated bundle...")
    client = compute_v1.InstancesClient(credentials=get_credentials())
    reset_op = client.reset(project=PROJECT_ID, zone=ZONE, instance=INSTANCE)
    print(f"[+] Reset operation initiated: {reset_op.name}")

def verify_live():
    print("[4/4] Polling live endpoint on 34.45.36.206...")
    for i in range(15):
        time.sleep(6)
        try:
            r = requests.get("http://34.45.36.206/prepmeup", timeout=5)
            print(f"Attempt {i+1}: HTTP {r.status_code}")
            if r.status_code == 200:
                print("[SUCCESS] Production site is LIVE on Strategy C!")
                return True
        except Exception as e:
            print(f"Attempt {i+1}: Waiting for VM startup... ({e})")
    return False

if __name__ == "__main__":
    tar = prepare_standalone_package()
    upload_bundle_to_gcs(tar)
    restart_vm()
    verify_live()
