
PAT=$1; LOGDIR=${2:-./logs}
PG="docker exec user_mngmt_db psql -U <user> -d user_db -tA -c"
echo "time,rss_mb,cpu_pct,pg_conns,pg_mb,redis_mb,log_mb" > soak-monitor.csv
while true; do
  PID=$(pgrep -f "$PAT" | head -1)
  RSS=$(ps -o rss= -p "$PID" | awk '{printf "%.0f",$1/1024}')
  CPU=$(ps -o %cpu= -p "$PID" | tr -d ' ')
  C=$($PG "SELECT count(*) FROM pg_stat_activity WHERE datname='user_db'")
  S=$($PG "SELECT pg_database_size('user_db')/1024/1024")
  R=$(docker exec redis-user-mgmt redis-cli info memory | awk -F: '/^used_memory:/{printf "%.0f",$2/1024/1024}')
  L=$(du -sm "$LOGDIR" 2>/dev/null | cut -f1)
  echo "$(date +%T),$RSS,$CPU,$C,$S,$R,$L" | tee -a soak-monitor.csv
  sleep 30
done