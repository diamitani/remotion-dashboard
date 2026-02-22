#!/usr/bin/env bash
set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required" >&2
  exit 1
fi

echo "Installing frontend + Remotion dependencies..."
npm install

echo "Installing baseline Remotion add-on packages..."
npx remotion add @remotion/google-fonts @remotion/fonts @remotion/paths @remotion/three || true

echo "Setting up environment file if missing..."
if [ ! -f .env ]; then
  cp .env.example .env
fi

echo "Checking Chatterbox TTS availability..."
if command -v chatterbox >/dev/null 2>&1; then
  echo "chatterbox CLI already installed"
else
  echo "Chatterbox CLI is not installed."
  if [ "${INSTALL_CHATTERBOX:-0}" = "1" ] && command -v python3.11 >/dev/null 2>&1; then
    echo "INSTALL_CHATTERBOX=1 set, installing local Chatterbox Python package..."
    python3.11 -m venv venv
    # shellcheck disable=SC1091
    source venv/bin/activate
    pip install chatterbox-tts
    echo "Installed chatterbox-tts into ./venv"
  else
    echo "Set INSTALL_CHATTERBOX=1 to auto-install locally."
    echo "Requires python3.11 on the host."
    echo "See CHATTERBOX_TTS_SETUP.md for API/server setup options."
  fi
fi

echo "Bootstrap complete."
