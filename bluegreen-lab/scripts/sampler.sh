#!/usr/bin/env bash
# Usage (from bluegreen-lab/): scripts/sampler.sh <out.csv> [seconds]
set -u
OUT="${1:?usage: sampler.sh <out.csv> [seconds]}"
SECS="${2:-0}"
NGINX_URL="${NGINX_URL:-http://localhost:8088/nginx_status}"
PGPW="${LAB_DB_PASSWORD:-lab123}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
trap 'exit 0' INT TERM

echo "ts_ms,elapsed_ms,nginx_workers,nginx_draining,nginx_worker_pids,nginx_active,nginx_accepts,nginx_handled,nginx_requests,nginx_reading,nginx_writing,nginx_waiting,app_conn_blue,app_conn_green,pgb_cl_active,pgb_cl_waiting,pgb_sv_active,pgb_sv_idle,pg_total,pg_active,pg_idle,pg_idle_in_txn" > "$OUT"

END=0
if [ "$SECS" -gt 0 ]; then END=$(( $(date +%s) + SECS )); fi

TCP_RE=":0BB8 [0-9A-F]+:[0-9A-F]+ 01 "
PG_SQL="SELECT count(*), count(*) FILTER (WHERE state='active'), count(*) FILTER (WHERE state='idle'), count(*) FILTER (WHERE state='idle in transaction') FROM pg_stat_activity WHERE datname='labdb' AND backend_type='client backend' AND pid<>pg_backend_pid();"

while :; do
  start=$(date +%s%3N)

  # all collectors run in parallel so one sample stays well under 1s
  docker top bg-nginx -eo pid,args > "$TMP/top" 2>/dev/null &
  curl -s -m 2 "$NGINX_URL" > "$TMP/stub" 2>/dev/null &
  docker exec bg-blue  sh -c "grep -cE '$TCP_RE' /proc/net/tcp" > "$TMP/blue"  2>/dev/null &
  docker exec bg-green sh -c "grep -cE '$TCP_RE' /proc/net/tcp" > "$TMP/green" 2>/dev/null &
  docker exec -e PGPASSWORD="$PGPW" bg-lab-postgres \
    psql -h pgbouncer -p 6432 -U lab -d pgbouncer --csv -c "SHOW POOLS" > "$TMP/pools" 2>/dev/null &
  docker exec bg-lab-postgres psql -U lab -d labdb -At -F, -c "$PG_SQL" > "$TMP/pg" 2>/dev/null &
  wait

  # nginx workers: active vs draining ("shutting down"); draining PIDs get a "d" suffix
  read -r w_act w_drain pids < <(awk '
    /nginx: worker process/ {
      if ($0 ~ /shutting down/) { d++; p = p (p ? ";" : "") $1 "d" }
      else                      { a++; p = p (p ? ";" : "") $1 }
    }
    END { print a+0, d+0, (p == "" ? "-" : p) }' "$TMP/top")

  # nginx stub_status
  read -r n_act n_acc n_han n_req n_rd n_wr n_wa < <(awk '
    /^Active connections/              { a = $3 }
    /^ *[0-9]+ [0-9]+ [0-9]+ *$/       { acc = $1; han = $2; req = $3 }
    /^Reading/                         { r = $2; w = $4; wa = $6 }
    END { print a, acc, han, req, r, w, wa }' "$TMP/stub")

  cb=$(tr -d '[:space:]' < "$TMP/blue"  2>/dev/null)
  cg=$(tr -d '[:space:]' < "$TMP/green" 2>/dev/null)

  # pgbouncer pool for labdb, columns found by header name
  read -r cl_a cl_w sv_a sv_i < <(awk -F, '
    NR == 1 { for (i = 1; i <= NF; i++) h[$i] = i; next }
    h["database"] && $(h["database"]) == "labdb" {
      print $(h["cl_active"]), $(h["cl_waiting"]), $(h["sv_active"]), $(h["sv_idle"])
    }' "$TMP/pools")

  IFS=, read -r pg_t pg_a pg_i pg_x < "$TMP/pg"

  elapsed=$(( $(date +%s%3N) - start ))
  echo "$start,$elapsed,${w_act:-},${w_drain:-},${pids:-},${n_act:-},${n_acc:-},${n_han:-},${n_req:-},${n_rd:-},${n_wr:-},${n_wa:-},${cb:-},${cg:-},${cl_a:-},${cl_w:-},${sv_a:-},${sv_i:-},${pg_t:-},${pg_a:-},${pg_i:-},${pg_x:-}" >> "$OUT"

  if [ "$END" -gt 0 ] && [ "$(date +%s)" -ge "$END" ]; then break; fi
  rem=$(( 1000 - elapsed ))
  if [ "$rem" -gt 0 ]; then sleep "$(awk -v r="$rem" 'BEGIN { printf "%.3f", r / 1000 }')"; fi
done
