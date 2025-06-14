const express = require('express');
const config = require('./config'); // Same structure as your existing config.js
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;

const pool = mysql.createPool({
  host: config.sql.host,
  user: config.sql.user,
  password: config.sql.password,
  database: config.sql.database,
  port: config.sql.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Check DB connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("⚠️ Database connection failed:", err);
    process.exit(1);
  } else {
    console.log("✅ Connected to DB:", config.sql.database);
    connection.release();
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/loneliness.html');
});

// Receive user dot + message
app.post('/api/submit', (req, res) => {
  const { x, y, message, ggid } = req.body;
  const sql = `
  INSERT INTO submissions (x, y, message, ggid)
  VALUES (?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    x = IFNULL(VALUES(x), x),
    y = IFNULL(VALUES(y), y),
    message = IF(VALUES(message) != '', VALUES(message), message)
`;
  pool.query(sql, [x, y, message, ggid], (err, result) => {
    if (err) {
      console.error("❌ Insert failed:", err.sqlMessage || err.message || err);
      return res.status(500).json({ error: "Failed to save submission" });
    }
    res.json({ success: true, id: result.insertId });
  });
});

app.post('/api/delete', (req, res) => {
  const { ggid } = req.body;
  const sql = "UPDATE submissions SET x = NULL, y = NULL WHERE ggid = ?";
  pool.query(sql, [ggid], (err) => {
    if (err) {
      console.error("❌ Dot delete failed:", err);
      return res.status(500).json({ error: "Failed to delete dot" });
    }
    res.json({ success: true });
  });
});

// (Optional) Endpoint to get all submissions
app.get('/api/submissions', (req, res) => {
  pool.query("SELECT * FROM submissions ORDER BY id DESC", (err, results) => {
    if (err) {
      console.error("❌ Fetch failed:", err);
      return res.status(500).json({ error: "Failed to fetch" });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`🚀 Server is running`);
});
