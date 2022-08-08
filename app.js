// app.js
import express, { query } from "express";
import mysql from "mysql2/promise";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const port = 4000;
const pool = mysql.createPool({
  host: "localhost",
  user: "sbsst",
  password: "sbs123414",
  database: "a9",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const getData = async () => {
  const data = await axios.get("http://localhost:3000/todos");
  console.log("async await", data);
};

app.get("/todos/:id/:textId", async (req, res) => {
  // params 여러개 받기
  const data = {
    todos: {
      id: req.params.id,
      textId: req.params.textId,
    },
  };

  const {
    todos: { id, textId },
  } = data;

  console.log("id", id);
});

app.get("/todos", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM todo ORDER BY id DESC");

  res.json(rows);
});

app.get("/todos/:id/", async (req, res) => {
  //const id = req.params.id;
  const { id } = req.params;

  const [rows] = await pool.query(
    `
  SELECT *
  FROM todo
  WHERE id = ?
  `,
    [id]
  );
  if (rows.length === 0) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  res.json(rows[0]);
});

app.patch("/todos/check/:id", async (req, res) => {
  const { id } = req.params;

  const [[todoRow]] = await pool.query(
    `
      SELECT *
      FROM todo
      WHERE id = ?
      `,
    [id]
  );
  if (!todoRow) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }
  await pool.query(
    `
        UPDATE todo
        SET checked =?
        WHERE id =?
        `,
    [!todoRow.checked, id]
  );
  res.send(id);
});

app.patch("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  const [rows] = await pool.query(
    `
    SELECT *
    FROM todo
    WHERE id = ?
    `,
    [id]
  );

  if (rows.length === 0) {
    res.status(404).json({
      msg: "not found",
    });
  }
  if (!text) {
    res.status(400).json({
      msg: "text required",
    });
    return;
  }

  const [rs] = await pool.query(
    `
  UPDATE todo
  SET 
  text = ?
  WHERE id = ?
  `,
    [text, id]
  );

  res.json({
    msg: `${id}번 할일이 수정되었습니다.`,
  });
});

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;

  const [[todoRow]] = await pool.query(
    `
    SELECT *
    FROM todo
    WHERE id = ?`,
    [id]
  );

  if (todoRow === undefined) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  const [rs] = await pool.query(
    `DELETE FROM todo
    WHERE id = ?`,
    [id]
  );
  const [deleteTodo] = await pool.query(
    `
  SELECT *
  FROM todo
  ORDER BY id DESC
  `
  );
  res.json(deleteTodo);
});
app.post("/todos", async (req, res) => {
  const { reg_date } = req.body;
  const { perform_date } = req.body;
  const { checked } = req.body;
  const { text } = req.body;

  const [rows] = await pool.query(`SELECT * FROM todo`);
  if (rows.length === 0) {
    res.status(404).json({
      msg: "not found",
    });
  }

  if (!text) {
    res.status(400).json({
      msg: "text required",
    });
    return;
  }
  const [rs] = await pool.query(
    `
    INSERT todo 
    SET
    text = ? 
    `,
    [text]
  );

  const [addData] = await pool.query(`
  SELECT *
  FROM todo
  ORDER BY id DESC
  `);
  res.json(addData);
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
