#!/usr/bin/env bash
# Usage (from bluegreen-lab/): scripts/switch.sh green|blue
set -euo pipefail
TARGET="${1:?usage: switch.sh green|blue}"
case "$TARGET" in green|blue) ;; *) echo "target must be green or blue"; exit 1;; esac
ACTIVE=nginx/conf.d/active_upstream.conf
BACKUP="$(mktemp)"

for c in bg-blue bg-green bg-nginx; do
  [ "$(docker inspect -f '{{.State.Running}}' "$c" 2>/dev/null)" = "true" ] || { echo "$c is not running"; exit 1; }
done

cp "$ACTIVE" "$BACKUP"
t0=$(date +%s%3N)
cp "nginx/upstreams/$TARGET.conf" "$ACTIVE"
if ! docker exec bg-nginx nginx -t; then
  cp "$BACKUP" "$ACTIVE"; echo "nginx -t failed, restored previous config"; exit 1
fi
docker exec bg-nginx nginx -s reload
t1=$(date +%s%3N)
docker top bg-nginx -eo pid,args | grep "nginx: worker" || true
mkdir -p results
echo "SWITCH_TO=$TARGET t0_ms=$t0 t1_ms=$t1 reload_cmd_ms=$((t1-t0))" | tee -a results/switch-times.txt
