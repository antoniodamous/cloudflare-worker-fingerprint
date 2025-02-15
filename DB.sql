CREATE TABLE fingerprints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_agent TEXT,
  platform TEXT,
  language TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  timezone TEXT,
  referrer TEXT,
  ip TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
