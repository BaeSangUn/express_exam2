// app.js
import express from "express";
import mysql from "mysql2/promise";
const app = express();
const port = 3000;

const pool = mysql.createPool({
  host: "localhost",
  user: "sbsst",
  password: "sbs123414",
  database: "a9",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

function sum(a, b) {
  return a + b;
}

app.get("/", (req, res) => {
  const a = sum("LostArk ", "Summer Festival");
  res.send(a);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
app.get("/todos", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM todo ORDER BY id DESC");
  console.log("rows", rows);
  res.json(rows);
});
