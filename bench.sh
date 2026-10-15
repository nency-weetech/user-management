#!/bin/bash
# Usage: ./bench.sh "<SQL>"
for i in 1 2 3 4 5; do
  docker exec user_mngmt_db psql -U admin -d user_db -tA \
    -c "EXPLAIN (ANALYZE) $1" | grep "Execution Time"
done
