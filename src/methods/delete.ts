import { Options, Params } from "../index";
import { Client } from "pg";
import unset from "lodash/unset";

export default async (db: Client, params: Params, options: Options) => {
  // Fetch entry
  const fetched = await db.query(
    `SELECT * FROM ${options.table} WHERE ID = ($1)`,
    [params.id]
  );

  // If empty, return false
  let json: any;
  if (!fetched.rows[0]) return false;
  else json = JSON.parse(fetched.rows[0].json);

  // Check if user wants to delete a prop inside an object
  if (typeof json === "object" && params.ops.target) {
    unset(json, params.ops.target);
    json = JSON.stringify(json);
    db.query(`UPDATE ${options.table} SET json = ($1) WHERE ID = ($2)`, [
      json,
      params.id,
    ]);
    return true;
  } else if (params.ops.target)
    throw new TypeError("Fetched value is not an object.");
  else
    await db.query(`DELETE FROM ${options.table} WHERE ID = ($1)`, [params.id]);

  // Resolve
  return true;
};
