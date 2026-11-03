import { pool } from "../src/db.js";

const users = [
  ["Ali", "ali@example.com", 100],
  ["Vali", "vali@example.com", 0],
];

for (const [name, email, balance] of users) {
  await pool.query(
    "insert into users (name, email, balance) select $1, $2, $3 where not exists (select 1 from users where email = $2)",
    [name, email, balance],
  );
}
const { rows } = await pool.query("select count(*)::int as n from users");
console.log(`seeded, users in table: ${rows[0].n}`);
await pool.end();
