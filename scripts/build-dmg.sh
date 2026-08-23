#!/usr/bin/env bash
#
# scripts/build-dmg.sh — Build a fully branded macOS DMG with embedded volume icon & Applications shortcut
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

APP_PATH="src-tauri/target/release/bundle/macos/OrchestraAI.app"
ICON_PATH="src-tauri/icons/icon.icns"
OUTPUT_DIR="src-tauri/target/release/bundle/dmg"
OUTPUT_DMG="$OUTPUT_DIR/OrchestraAI_0.1.0_universal.dmg"
TEMP_DMG="$OUTPUT_DIR/temp.dmg"
VOL_NAME="OrchestraAI"

if [ ! -d "$APP_PATH" ]; then
  echo "Error: App bundle not found at $APP_PATH. Run 'npm run build' first." >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"
rm -f "$OUTPUT_DMG" "$TEMP_DMG"

echo "==> Creating temporary disk staging folder..."
STAGING_DIR="$(mktemp -d)"
cp -R "$APP_PATH" "$STAGING_DIR/"
ln -s /Applications "$STAGING_DIR/Applications"
cp "$ICON_PATH" "$STAGING_DIR/.VolumeIcon.icns"

echo "==> Creating read-write DMG..."
hdiutil create -volname "$VOL_NAME" -srcfolder "$STAGING_DIR" -ov -format UDRW "$TEMP_DMG"
rm -rf "$STAGING_DIR"

echo "==> Mounting DMG to set custom volume icon..."
MOUNT_DIR="$(mktemp -d)"
DEV_NAME=$(hdiutil attach "$TEMP_DMG" -mountpoint "$MOUNT_DIR" -nobrowse -quiet | head -n 1 | awk '{print $1}')

# Set custom volume icon attribute
if command -v SetFile &>/dev/null; then
  SetFile -a C "$MOUNT_DIR" 2>/dev/null || true
  SetFile -a V "$MOUNT_DIR/.VolumeIcon.icns" 2>/dev/null || true
fi

echo "==> Detaching DMG..."
hdiutil detach "$MOUNT_DIR" -quiet

echo "==> Converting to compressed read-only DMG (UDZO)..."
hdiutil convert "$TEMP_DMG" -format UDZO -imagekey zlib-level=9 -o "$OUTPUT_DMG"
rm -f "$TEMP_DMG"

# Also create standard named symlink/copies
cp "$OUTPUT_DMG" "$OUTPUT_DIR/OrchestraAI.dmg"
cp "$OUTPUT_DMG" "/Users/kiet/Desktop/OrchestraAI.dmg"
cp "$OUTPUT_DMG" "/Users/kiet/Documents/Heimer/orchestraai-landing/assets/downloads/OrchestraAI.dmg" 2>/dev/null || true

echo "==> Setting custom file icon on DMG using Swift..."
swift - <<EOF 2>/dev/null || true
import Cocoa
let iconPath = "$REPO_ROOT/$ICON_PATH"
let paths = [
  "$REPO_ROOT/$OUTPUT_DMG",
  "$REPO_ROOT/$OUTPUT_DIR/OrchestraAI.dmg",
  "/Users/kiet/Desktop/OrchestraAI.dmg"
]
if let img = NSImage(contentsOfFile: iconPath) {
  for path in paths {
    _ = NSWorkspace.shared.setIcon(img, forFile: path, options: [])
  }
}
EOF

echo ""
echo "  🎉 Successfully built branded OrchestraAI DMG:"
echo "  👉 $OUTPUT_DMG"
echo "  👉 /Users/kiet/Desktop/OrchestraAI.dmg"
echo ""
