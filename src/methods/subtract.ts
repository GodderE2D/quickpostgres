import { Options, Params } from "../index";
import { Client } from "pg";
import get from "lodash/get";
import set from "lodash/set";

export default async (db: Client, params: Params, options: Options) => {
  // Fetch entry
  let fetched = await db.query(
    `SELECT * FROM ${options.table} WHERE ID = ($1)`,
    [params.id]
  );

  // If not found, create empty row
  if (!fetched.rows?.length) {
    await db.query(`INSERT INTO ${options.table} (ID,json) VALUES ($1,$2)`, [
      params.id,
      "{}",
    ]);
    fetched = await db.query(`SELECT * FROM ${options.table} WHERE ID = ($1)`, [
      params.id,
    ]);
  }

  // Check if a target was supplied
  if (params.ops.target) {
    fetched = JSON.parse(fetched.rows[0].json);
    params.data = JSON.parse(params.data);

    let oldValue = get(fetched, params.ops.target);
    if (oldValue === undefined) oldValue = 0;
    else if (isNaN(oldValue))
      throw new TypeError(
        `Specified value is not a number. (ID: ${params.id})`
      );
    params.data = set(fetched, params.ops.target, oldValue - params.data);
  } else {
    if (fetched.rows[0].json === "{}") fetched.rows[0].json = 0;
    else fetched.rows[0].json = JSON.parse(fetched.rows[0].json);

    if (isNaN(fetched.rows[0].json))
      throw new Error(`Fetched value is not a number. (ID: ${params.id})`);
    params.data = parseFloat(fetched.rows[0].json) - parseFloat(params.data);
  }

  // Stringify data
  if (typeof params.data !== "string")
    params.data = JSON.stringify(params.data);

  // Update entry with new data
  await db.query(`UPDATE ${options.table} SET json = ($1) WHERE ID = ($2)`, [
    params.data,
    params.id,
  ]);

  // Fetch and return new data
  let newData = (
    await db.query(`SELECT * FROM ${options.table} WHERE ID = ($1)`, [
      params.id,
    ])
  ).rows[0].json;
  if (newData === "{}") return null;
  else {
    newData = JSON.parse(newData);
    return newData;
  }
};
