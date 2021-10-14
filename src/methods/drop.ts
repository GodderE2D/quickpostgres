import { Options, Params } from "../index";
import { Client } from "pg";

export default async (db: Client, params: Params, options: Options) => {
  // Drop table
  await db.query(`DROP TABLE ${options.table}`);
};
