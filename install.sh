#!/usr/bin/env bash
#
# OrchestraAI One-Line Installer for macOS & Linux
# Usage: curl -fsSL https://raw.githubusercontent.com/tuankiet30902/orchestraai/main/install.sh | bash
#
set -euo pipefail

REPO="tuankiet30902/orchestraai"
APP_NAME="OrchestraAI"
BINARY_NAME="orchestraai"

echo ""
echo "  🎻 Installing OrchestraAI — The AI Multi-Agent Coding Studio"
echo "  ============================================================"
echo ""

OS="$(uname -s)"
ARCH="$(uname -m)"

# 1. Fetch latest release version
echo "==> Fetching latest release information..."
RELEASE_JSON="$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" 2>/dev/null || true)"

if [ -z "$RELEASE_JSON" ] || echo "$RELEASE_JSON" | grep -q "Not Found"; then
  echo "    Warning: Latest release API not responding. Falling back to repository downloads."
  TAG="latest"
else
  TAG="$(echo "$RELEASE_JSON" | grep '"tag_name":' | head -1 | sed -E 's/.*"([^"]+)".*/\1/')"
fi

echo "    Target Release: ${TAG}"

case "$OS" in
  Darwin*)
    echo "==> Detected macOS (${ARCH})"
    DMG_URL="https://github.com/${REPO}/releases/download/${TAG}/OrchestraAI_universal.dmg"
    TMP_DMG="$(mktemp -d)/OrchestraAI.dmg"

    echo "==> Downloading ${DMG_URL}..."
    if ! curl -fL --progress-bar "$DMG_URL" -o "$TMP_DMG"; then
      # Fallback to general dmg pattern
      DMG_URL="https://github.com/${REPO}/releases/latest/download/OrchestraAI.dmg"
      curl -fL --progress-bar "$DMG_URL" -o "$TMP_DMG" || {
        echo "Error: Failed to download macOS release bundle." >&2
        exit 1
      }
    fi

    echo "==> Mounting DMG and installing to /Applications..."
    MOUNT_DIR="$(mktemp -d)"
    hdiutil attach "$TMP_DMG" -mountpoint "$MOUNT_DIR" -quiet -nobrowse

    if [ -d "/Applications/OrchestraAI.app" ]; then
      echo "    Removing previous version in /Applications/OrchestraAI.app..."
      rm -rf "/Applications/OrchestraAI.app"
    fi

    cp -R "$MOUNT_DIR/OrchestraAI.app" /Applications/
    hdiutil detach "$MOUNT_DIR" -quiet
    rm -rf "$TMP_DMG" "$MOUNT_DIR"

    # Create CLI symlink in /usr/local/bin if writable or in ~/.local/bin
    CLI_DIR="/usr/local/bin"
    if [ ! -w "$CLI_DIR" ]; then
      CLI_DIR="$HOME/.local/bin"
      mkdir -p "$CLI_DIR"
    fi

    ln -sf "/Applications/OrchestraAI.app/Contents/MacOS/OrchestraAI" "${CLI_DIR}/${BINARY_NAME}" 2>/dev/null || true
    ln -sf "/Applications/OrchestraAI.app/Contents/MacOS/OrchestraAI" "${CLI_DIR}/orch" 2>/dev/null || true

    echo ""
    echo "  🎉 OrchestraAI has been successfully installed to /Applications/OrchestraAI.app!"
    echo "  👉 Launch from Spotlight or run '${BINARY_NAME}' in your terminal."
    echo ""
    ;;

  Linux*)
    echo "==> Detected Linux (${ARCH})"
    CLI_DIR="/usr/local/bin"
    if [ ! -w "$CLI_DIR" ]; then
      CLI_DIR="$HOME/.local/bin"
      mkdir -p "$CLI_DIR"
    fi

    APPIMAGE_URL="https://github.com/${REPO}/releases/download/${TAG}/OrchestraAI_${ARCH}.AppImage"
    DEST_BIN="${CLI_DIR}/${BINARY_NAME}"

    echo "==> Downloading AppImage from ${APPIMAGE_URL}..."
    if ! curl -fL --progress-bar "$APPIMAGE_URL" -o "$DEST_BIN"; then
      # Fallback URL
      APPIMAGE_URL="https://github.com/${REPO}/releases/latest/download/OrchestraAI.AppImage"
      curl -fL --progress-bar "$APPIMAGE_URL" -o "$DEST_BIN" || {
        echo "Error: Failed to download Linux AppImage." >&2
        exit 1
      }
    fi

    chmod +x "$DEST_BIN"
    ln -sf "$DEST_BIN" "${CLI_DIR}/orch" 2>/dev/null || true

    echo ""
    echo "  🎉 OrchestraAI binary installed to ${DEST_BIN}!"
    echo "  👉 Run '${BINARY_NAME}' or 'orch' in your terminal."
    echo ""
    ;;

  *)
    echo "Unsupported OS: $OS"
    echo "Please visit https://github.com/${REPO}/releases to download installer manually."
    exit 1
    ;;
esac
