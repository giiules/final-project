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
  const sql = "INSERT INTO connection (x, y, message, ggid) VALUES (?, ?, ?, ?)";
  pool.query(sql, [x, y, message, ggid], (err, result) => {
    if (err) {
      console.error("❌ Insert failed:", err.sqlMessage || err.message || err);
      return res.status(500).json({ error: "Failed to save submission" });
    }
    res.json({ success: true, id: result.insertId });
  });
});

// (Optional) Endpoint to get all submissions
app.get('/api/submissions', (req, res) => {
  pool.query("SELECT * FROM connection ORDER BY id DESC", (err, results) => {
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
