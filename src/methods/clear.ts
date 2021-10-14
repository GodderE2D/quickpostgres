import { Options, Params } from "../index";
import { Client } from "pg";

export default async (db: Client, params: Params, options: Options) => {
  // Get amount of rows
  const fetched = await db.query(`SELECT * FROM ${options.table}`);

  // Delete all rows
  await db.query(`DELETE FROM ${options.table}`);

  // Return values
  return fetched.rows?.length || 0;
};
