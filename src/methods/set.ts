import { Options, Params } from "../index";
import { Client } from "pg";
import set from "lodash/set";

export default async (db: Client, params: Params, options: Options) => {
  // Fetch entry
  let fetched = await db.query(
    `SELECT * FROM ${options.table} WHERE ID = ($1)`,
    [params.id]
  );

  // If not found, create empty row
  if (!fetched.rows.length) {
    await db.query(`INSERT INTO ${options.table} (ID,json) VALUES ($1,$2)`, [
      params.id,
      "{}",
    ]);
    fetched = await db.query(`SELECT * FROM ${options.table} WHERE ID = ($1)`, [
      params.id,
    ]);
  }

  // Parse fetched
  fetched = JSON.parse(fetched.rows[0].json);

  // Check if a target was supplied
  if (typeof fetched === "object" && params.ops.target) {
    params.data = JSON.parse(params.data);
    params.data = set(fetched, params.ops.target, params.data);
  } else throw new TypeError("Cannot target a non-object.");

  // Stringify data
  if (typeof params.data != "string") params.data = JSON.stringify(params.data);

  // Update entry with new data
  await db.query(`UPDATE ${options.table} SET json = ($1) WHERE ID = ($2)`, [
    params.data,
    params.id,
  ]);

  // Fetch and return new data
  const newData = await db.query(
    `SELECT * FROM ${options.table} WHERE ID = ($1)`,
    [params.id]
  );

  if (newData.rows[0].json) return null;
  else return JSON.parse(newData.rows[0].json);
};
