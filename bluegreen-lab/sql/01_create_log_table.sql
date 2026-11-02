CREATE TABLE IF NOT EXISTS bg_request_log(
    id BIGSERIAL PRIMARY KEY,
    request_id  TEXT NOT NULL,
    server_name TEXT NOT NULL,
    server_port INT,
    app_pid INT,
    db_backend_pid INT,
    handled_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_bg_log_handled_at ON bg_request_log (handled_at);