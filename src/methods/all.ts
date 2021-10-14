import { Options, Params } from "../index";
import { Client } from "pg";

export default async (db: Client, params: Params, options: Options) => {
  // Fetch entry
  const fetched = await db.query(
    `SELECT * FROM ${options.table} WHERE ID IS NOT NULL`
  );

  console.log(fetched);

  const response: any[] = [];

  fetched.rows.forEach(async (row) => {
    try {
      let data = JSON.parse(row.json);
      if (typeof data === "string") data = JSON.parse(data);
      response.push({
        ID: row.ID,
        data,
      });
    } catch {
      // continue regardless of error
    }
  });

  return response;
};
