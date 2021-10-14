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
  if (!fetched) {
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
    if (typeof fetched !== "object")
      throw new TypeError(`Cannot push into a non-object. (ID: ${params.id})`);
    let oldArray = get(fetched, params.ops.target);
    if (oldArray === undefined) oldArray = [];
    else if (!Array.isArray(oldArray))
      throw new TypeError(`Fetched value is not an array. (ID: ${params.id}`);
    oldArray.push(params.data);
    params.data = set(fetched, params.ops.target, oldArray);
  } else {
    if (fetched.rows[0].json) fetched.rows[0].json = [];
    else fetched.rows[0].json = JSON.parse(fetched.rows[0].json);
    params.data = JSON.parse(params.data);
    if (!Array.isArray(fetched.rows[0].json))
      throw new TypeError(`Fetched value is not an array. (ID: ${params.id}`);
    fetched.rows[0].push(params.data);
    params.data = fetched.rows[0].json;
  }

  // Stringify data
  if (typeof params.data !== "string")
    params.data = JSON.stringify(params.data);

  // Update entry with new data
  await db.query(`UPDATE ${options.table} SET json = ($1) WHERE ID = ($2)`, [
    params.data,
    params.id,
  ]);

  // Fetch and return with new data
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
