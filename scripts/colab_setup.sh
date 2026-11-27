#!/usr/bin/env bash
set -euo pipefail

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi

echo "Installing Chrome/Remotion system dependencies..."
$SUDO apt-get update -qq
$SUDO apt-get install -y -qq \
  libnss3 \
  libdbus-1-3 \
  libatk1.0-0 \
  libasound2 \
  libxrandr2 \
  libxkbcommon-dev \
  libxfixes3 \
  libxcomposite1 \
  libxdamage1 \
  libgbm-dev \
  libcups2 \
  libatk-bridge2.0-0 \
  fonts-liberation \
  ffmpeg

if ! command -v node >/dev/null 2>&1 || [ "$(node -v | sed 's/v\([0-9]*\).*/\1/')" -lt 20 ]; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
  $SUDO apt-get install -y -qq nodejs
fi

echo "Installing npm dependencies..."
npm ci

echo "Ensuring Remotion browser..."
npx remotion browser ensure

echo "Colab setup complete:"
echo "  node: $(node -v)"
echo "  npm:  $(npm -v)"
echo "  ffmpeg: $(ffmpeg -version | head -n 1)"
