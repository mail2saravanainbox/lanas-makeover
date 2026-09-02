#!/usr/bin/env bash
#
# ENCODE A HERO / SECTION CLIP
#
#   scripts/encode-video.sh <source> <output-basename> [landscape|portrait]
#
# Produces the three files the site's <video> element asks for, in the order
# the browser tries them:
#
#   <name>.av1.mp4   AV1     CRF 35   smallest, newest decoders only
#   <name>.webm      VP9     CRF 31
#   <name>.mp4       H.264   CRF 23   the one every device can play
#
# House rules, and why:
#   -an          no audio track at all. The hero is muted by policy; shipping
#                an audio stream is bytes nobody will ever hear.
#   -r 24        cinema cadence, and 24 of 50 frames is half the data.
#   +faststart   moov atom first, so playback starts on the first bytes
#                rather than after the whole file has landed.
#   ≤ 8 seconds  it loops. Nobody watches it twice.
#
set -euo pipefail

SRC="${1:?source file}"
OUT="${2:?output basename}"
SHAPE="${3:-landscape}"

if [ "$SHAPE" = "portrait" ]; then
  SCALE="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
else
  SCALE="scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080"
fi

echo "→ H.264  $OUT.mp4"
ffmpeg -v error -y -i "$SRC" -an -r 24 -vf "$SCALE" \
  -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart "$OUT.mp4"

echo "→ VP9    $OUT.webm"
ffmpeg -v error -y -i "$SRC" -an -r 24 -vf "$SCALE" \
  -c:v libvpx-vp9 -crf 31 -b:v 0 -row-mt 1 "$OUT.webm"

if ffmpeg -v error -encoders 2>/dev/null | grep -q libsvtav1; then
  echo "→ AV1    $OUT.av1.mp4"
  ffmpeg -v error -y -i "$SRC" -an -r 24 -vf "$SCALE" \
    -c:v libsvtav1 -crf 35 -preset 6 -pix_fmt yuv420p -movflags +faststart "$OUT.av1.mp4"
else
  echo "  (no libsvtav1 — skipping AV1; the site falls back to WebM then MP4)"
fi

ls -lh "$OUT".* | awk '{printf "   %-42s %s\n", $9, $5}'
