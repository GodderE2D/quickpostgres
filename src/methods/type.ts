import { Options, Params } from "../index";
import { Client } from "pg";
import get from "lodash/get";

export default async (db: Client, params: Params, options: Options) => {
  // Fetch entry
  let fetched = await db.query(
    `SELECT * FROM ${options.table} WHERE ID = ($1)`,
    [params.id]
  );
  // If empty, return null
  if (!fetched.rows?.length) return null;
  fetched = JSON.parse(fetched.rows[0].json);

  // Check if target was supplied
  if (params.ops.target) fetched = get(fetched, params.ops.target);

  // Return value
  return typeof fetched;
};
