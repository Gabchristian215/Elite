#!/usr/bin/env bash
# Per-boot startup for the Elite dev environment. Idempotent and safe to re-run.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Non-secret dev defaults. Written only when .env is absent so user edits and
# Secrets-panel values (injected as real env vars) always take precedence.
if [ ! -f .env ]; then
  cat > .env <<'EOF'
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017
jwtSecret=dev-only-insecure-jwt-secret-change-me
jwtExpiresIn=90d
JWT_COOKIE_EXPIRES=90
EOF
  echo "Wrote dev defaults to .env"
fi

# Start MongoDB only if it is not already accepting connections.
if ! mongosh --quiet --eval 'db.runCommand({ ping: 1 })' >/dev/null 2>&1; then
  sudo mkdir -p /var/lib/mongodb /var/log/mongodb
  sudo chown -R "$(id -u)":"$(id -g)" /var/lib/mongodb /var/log/mongodb
  echo "Starting MongoDB ..."
  mongod --dbpath /var/lib/mongodb --bind_ip 127.0.0.1 --port 27017 \
    --logpath /var/log/mongodb/mongod.log --fork
fi

# Wait for readiness so dependents can rely on a live database.
for _ in $(seq 1 30); do
  if mongosh --quiet --eval 'db.runCommand({ ping: 1 })' >/dev/null 2>&1; then
    echo "MongoDB is ready on 127.0.0.1:27017"
    exit 0
  fi
  sleep 1
done

echo "MongoDB did not become ready in time" >&2
exit 1
