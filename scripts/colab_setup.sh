#!/usr/bin/env bash
set -euo pipefail

echo "Installing Chrome/Remotion system dependencies..."
sudo apt-get update -y
sudo apt-get install -y \
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
  libatk-bridge2.0-0

if ! command -v node >/dev/null 2>&1 || [ "$(node -v | sed 's/v\([0-9]*\).*/\1/')" -lt 20 ]; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "Installing npm dependencies..."
npm ci

echo "Ensuring Remotion browser..."
npx remotion browser ensure

echo "Colab setup complete."
