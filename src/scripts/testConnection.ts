import "dotenv/config";
import {pool} from "../db/index.js";

async function testDB() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("DB connected:", res.rows);
    await pool.end();
  } catch (err) {
    console.error(err);
  }
}

testDB();