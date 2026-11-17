import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getBackupsStatus,
  runWeeklyBackupRotation,
  purgeStaleBackups,
  getBackupPackageById,
  restoreFromBackup,
} from "@/lib/prepmeup/backupManager";

export const dynamic = "force-dynamic";

async function isAuthorizedAdminOrCron(req: NextRequest): Promise<{
  authorized: boolean;
  actor: string;
}> {
  const cronSecret = process.env.PMU_BACKUP_CRON_SECRET || process.env.CMS_WEBHOOK_SECRET;
  const headerSecret = req.headers.get("x-backup-cron-secret");
  if (cronSecret && headerSecret && headerSecret === cronSecret) {
    return { authorized: true, actor: "weekly-cron-scheduler" };
  }

  const cookieStore = await cookies();
  const adminSession = cookieStore.get("pmu-admin-session");
  if (adminSession?.value) {
    return { authorized: true, actor: "admin@ridheshcybe.dpdns.org" };
  }

  return { authorized: false, actor: "" };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await isAuthorizedAdminOrCron(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const downloadId = searchParams.get("downloadId");

    if (downloadId) {
      const pkgRes = await getBackupPackageById(downloadId);
      if (!pkgRes.ok || !pkgRes.packageData || !pkgRes.record) {
        return NextResponse.json(
          { ok: false, error: pkgRes.error || "Backup package not found." },
          { status: 404 }
        );
      }

      return new NextResponse(JSON.stringify(pkgRes.packageData, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${pkgRes.record.backupKey}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const status = await getBackupsStatus(true);
    return NextResponse.json({
      ok: true,
      ...status,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to fetch backup status." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await isAuthorizedAdminOrCron(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "rotate_weekly";

    if (action === "rotate_weekly" || action === "create_backup") {
      const result = await runWeeklyBackupRotation({
        forceNew: true,
        triggeredBy: auth.actor,
      });
      const status = await getBackupsStatus(false);

      return NextResponse.json({
        ok: true,
        message: `Weekly backup rotated: ${result.staleDeletedCount} stale backup(s) deleted and new package (${result.activeBackup.backupKey}) uploaded to Supabase.`,
        rotation: result,
        ...status,
      });
    }

    if (action === "purge_stale") {
      const purge = await purgeStaleBackups({ maxAgeDays: 7 });
      const status = await getBackupsStatus(false);

      return NextResponse.json({
        ok: true,
        message: `Purged ${purge.deletedCount} stale backup(s) older than 7 days.`,
        purge,
        ...status,
      });
    }

    if (action === "restore_backup") {
      const backupId = body.backupId;
      if (!backupId) {
        return NextResponse.json(
          { ok: false, error: "backupId is required to restore." },
          { status: 400 }
        );
      }

      const restoreRes = await restoreFromBackup(backupId);
      if (!restoreRes.ok) {
        return NextResponse.json(
          { ok: false, error: restoreRes.error || "Restore failed." },
          { status: 400 }
        );
      }

      const status = await getBackupsStatus(false);
      return NextResponse.json({
        ok: true,
        message: `Platform state restored from verified backup package (${restoreRes.restoredRecord?.backupKey}).`,
        restored: restoreRes.restoredRecord,
        ...status,
      });
    }

    return NextResponse.json(
      { ok: false, error: `Unknown backup action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Backup operation failed." },
      { status: 500 }
    );
  }
}
