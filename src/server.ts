import express from "express";
import { pool } from "./db.js";
import { isEmail, isValidBalance, parseId } from "./validate.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/health", async (_req, res) => {
  await pool.query("select 1");
  res.json({ ok: true, version: process.env.APP_VERSION ?? "dev" });
});

app.post("/users", async (req, res) => {
  const { name, email, balance } = req.body ?? {};
  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "name required" });
  }
  if (!isEmail(email)) return res.status(400).json({ error: "invalid email" });
  if (!isValidBalance(balance)) {
    return res.status(400).json({ error: "balance must be an integer >= 0" });
  }
  const normalized = email.toLowerCase();
  const dup = await pool.query("select id from users where email = $1", [normalized]);
  if (dup.rowCount) return res.status(409).json({ error: "email already exists" });
  const { rows } = await pool.query(
    "insert into users (name, email, balance) values ($1, $2, $3) returning id, name, email, balance",
    [name.trim(), normalized, balance],
  );
  res.status(201).json(rows[0]);
});

app.get("/users/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "invalid id" });
  const { rows } = await pool.query(
    "select id, name, email, balance from users where id = $1",
    [id],
  );
  const user = rows[0];
  if (!user) return res.status(404).json({ error: "not found" });
  res.json(user);
});

app.delete("/users/:id", async (req, res) => {
  if (req.get("x-api-key") !== process.env.API_KEY) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "invalid id" });
  try {
    const result = await pool.query("delete from users where id = $1", [id]);
    if (!result.rowCount) return res.status(404).json({ error: "not found" });
    res.status(204).end();
  } catch (err) {
    console.error("delete failed", err);
    res.status(500).json({ error: "delete failed" });
  }
});

app.listen(3000, () => console.log("api listening on :3000"));
