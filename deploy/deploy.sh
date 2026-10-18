#!/usr/bin/env bash
# Build here, ship only the runtime, start on kishan-server (small box: nothing compiles there).
#   ./deploy/deploy.sh             build + ship + start
#   REFRESH=1 ./deploy/deploy.sh   re-download the latest NHS England month first
set -euo pipefail

HOST="${DEPLOY_HOST:-kishan-server}"
APP=seensooner
PORT=8100
REMOTE_DIR="apps/$APP"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/deploy/out"
SITE_URL="${SITE_URL:-https://seensooner.kishankanejiiya.tech}"

say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }

say "Checking free disk on $HOST"
free_kb=$(ssh "$HOST" "df -Pk / | awk 'NR==2 {print \$4}'")
echo "free: $((free_kb / 1024)) MB"
[ "$free_kb" -ge 1048576 ] || { echo "Less than 1 GB free on $HOST; aborting." >&2; exit 1; }

if [ "${REFRESH:-}" = "1" ]; then
  say "Refreshing NHS England RTT data"
  python3 -I "$ROOT/scripts/ingest_rtt.py"
fi

say "Building web (Next.js standalone)"
rm -rf "$OUT" && mkdir -p "$OUT/web"
(
  cd "$ROOT/web"
  npm ci --no-audit --no-fund
  SITE_URL="$SITE_URL" NEXT_TELEMETRY_DISABLED=1 npm run build
)
cp -R "$ROOT/web/.next/standalone/." "$OUT/web/"
mkdir -p "$OUT/web/.next"
cp -R "$ROOT/web/.next/static" "$OUT/web/.next/static"
cp -R "$ROOT/web/public" "$OUT/web/public"
cp "$ROOT"/deploy/{Dockerfile.web,compose.prod.yml} "$OUT/"

say "Shipping to $HOST:~/$REMOTE_DIR"
ssh "$HOST" "mkdir -p ~/$REMOTE_DIR && cd ~/$REMOTE_DIR && rm -rf web Dockerfile.web compose.prod.yml"
COPYFILE_DISABLE=1 tar -C "$OUT" -czf - . | ssh "$HOST" "tar -C ~/$REMOTE_DIR -xzf -"

say "Starting the container"
ssh "$HOST" "cd ~/$REMOTE_DIR && SITE_URL=$SITE_URL docker compose -f compose.prod.yml -p $APP up -d --build --remove-orphans && docker image prune -f >/dev/null"

say "Smoke test"
for _ in $(seq 1 30); do
  ssh "$HOST" "curl -fsS -o /dev/null http://127.0.0.1:$PORT/icon.svg" 2>/dev/null && break
  sleep 2
done
ssh "$HOST" "for p in / /now /planned/orthopaedics; do printf \"GET \$p -> \"; curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:$PORT\$p; done"
say "Done: http://127.0.0.1:$PORT on $HOST (public: $SITE_URL once the tunnel route exists)"
