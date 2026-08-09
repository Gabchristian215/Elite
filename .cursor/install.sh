#!/usr/bin/env bash
# Idempotent repository bootstrap for the Elite dev environment.
# Runs after the repo is checked out. Safe to run repeatedly.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# 1) MongoDB server + shell (install only if missing).
if ! command -v mongod >/dev/null 2>&1; then
  echo "Installing MongoDB 8.0 ..."
  curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc \
    | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor --yes
  echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" \
    | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list >/dev/null
  sudo apt-get update -qq
  sudo apt-get install -y mongodb-org
fi

# 2) MongoDB data + log directories owned by the runtime user.
sudo mkdir -p /var/lib/mongodb /var/log/mongodb
sudo chown -R "$(id -u)":"$(id -g)" /var/lib/mongodb /var/log/mongodb

# 3) Node dependencies (uses the committed lockfile).
npm ci

echo "install.sh complete."
