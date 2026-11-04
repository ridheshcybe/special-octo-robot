#!/usr/bin/env bash
# ============================================================================
# make-hls.sh — Phase 4. Run LOCALLY on your own machine (one-time ffmpeg).
#
#   Usage:
#     ./scripts/make-hls.sh input.mp4 lesson-7
#
# What it does:
#   1. Transcodes input.mp4 into an HLS ladder (360p / 480p / 720p, 4 s
#      segments, keyframe every 4 s) with names unique across the whole
#      bucket:
#         hls/lesson-7/360p_0001.ts … 480p_0001.ts … 720p_0001.ts …
#         hls/lesson-7/360p.m3u8 480p.m3u8 720p.m3u8 master.m3u8
#   2. Prints the rclone commands to upload the folder to your PRIVATE R2
#      bucket (no public access, ever). Segments are only reachable through
#      presigned URLs from the get-hls-url edge function.
#
# Requirements: ffmpeg (brew install ffmpeg / winget install ffmpeg),
#               rclone configured once: `rclone config` → type r2 → account
#               ID + access key + secret (same creds as the edge secrets).
# Cost note: uploading ~N MB costs nothing; R2 has zero egress fees.
# ============================================================================
set -euo pipefail

IN="${1:?Usage: make-hls.sh input.mp4 lesson-7}"
NAME="${2:?Usage: make-hls.sh input.mp4 lesson-7}"
OUT="hls/${NAME}"

if ! command -v ffmpeg >/dev/null; then
  echo "ffmpeg not found. Install it first: https://ffmpeg.org/download.html"
  exit 1
fi

mkdir -p "$OUT"

# Bitrate ladder — must stay in sync with LADDER in supabase/functions/get-hls-url.
enc() { # enc NAME WIDTH HEIGHT VIDEO_KBPS AUDIO_KBPS
  ffmpeg -y -i "$IN" \
    -vf "scale=w=$2:h=$3:force_original_aspect_ratio=decrease,pad=ceil=iw/2)*2:ceil=ih/2)*2" \
    -c:v libx264 -preset medium -b:v "$4k" -maxrate "$4k" -bufsize "$(( $4 * 2 ))k" \
    -g 96 -keyint_min 96 -sc_threshold 0 \
    -c:a aac -b:a "$5k" -ac 2 \
    -hls_time 4 -hls_playlist_type vod \
    -hls_segment_filename "$OUT/${1}_%04d.ts" \
    -flags +cgop \
    "$OUT/${1}.m3u8"
}

echo "==> 360p" && enc 360p  640  360  800 96
echo "==> 480p" && enc 480p  854  480 1400 128
echo "==> 720p" && enc 720p 1280  720 2800 128

# Master playlist: bandwidth values match the edge function's LADDER.
cat > "$OUT/master.m3u8" <<'EOF'
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x480
480p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p.m3u8
EOF

echo "==> Done: $OUT/"
ls -lh "$OUT" | tail -n +2

cat <<EOF

Next — upload to R2 (private bucket, e.g. named \`hls-videos\`):

  rclone copy "$OUT/" r2:hls-videos/hls/${NAME}/ --transfers 8

Then in the admin panel, set the lesson's HLS path to:

  hls/${NAME}/master.m3u8
EOF
