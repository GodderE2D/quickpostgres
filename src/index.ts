import EventEmitter from "events";
import { Client as PgClient } from "pg";

import add from "./methods/add";
import all from "./methods/all";
import clear from "./methods/clear";
import del from "./methods/delete";
import drop from "./methods/drop";
import fetch from "./methods/fetch";
import has from "./methods/has";
import push from "./methods/push";
import set from "./methods/set";
import subtract from "./methods/subtract";
import type from "./methods/type";

export type ClientOptions = {
  target?: string | null;
  table?: string | null;
};

export type Params = {
  id?: any;
  data?: any;
  ops: Options;
};

export type Options = {
  table?: string;
  target?: any[];
};

export type Methods =
  | "fetch"
  | "set"
  | "add"
  | "subtract"
  | "push"
  | "delete"
  | "has"
  | "clear"
  | "drop"
  | "all"
  | "type";

export class Client extends EventEmitter {
  /**
   * PostgreSQL database url
   * @type {string}
   * @readonly
   */

  readonly dbUrl: string;

  /**
   * Client options
   * @type {ClientOptions | undefined}
   * @readonly
   */

  readonly options: ClientOptions | undefined;

  /**
   * Default table name to use
   * @type {string | undefined}
   */

  public tableName: string | undefined;

  /**
   * The `pg` client instance for your database
   * @type {PgClient}
   */

  public client: PgClient;

  /**
   * Whether the database has been connected or not
   * @see connect
   * @see end
   */

  public connected: boolean;

  constructor(dbUrl: string, options?: ClientOptions) {
    super();
    this.dbUrl = dbUrl;
    this.options = options;
    this.tableName = options?.table ?? undefined;
    this.client = new PgClient(this.dbUrl);
    this.connected = false;
  }

  /**
   * Connects to the database
   * @returns {Promise<Client>} the client
   * @example await db.connect();
   */

  public async connect(): Promise<Client> {
    if (this.connected) throw new Error("Client has already been connected.");

    await this.client.connect();
    this.connected = true;

    /**
     * Emitted when the database has been connected
     * @event Client#ready
     * @param {Client} client the client
     */

    this.emit("ready", this);
    return this;
  }

  /**
   * Ends the connection to the database
   * @returns {Promise<Client>} the client
   * @example await db.end();
   */

  public async end(): Promise<Client> {
    if (!this.connected) throw new Error("Client has not been connected yet.");

    await this.client.end();
    this.connected = false;

    /**
     * Emitted when the database connection has been ended
     * @event Client#end
     * @param {Client} client the client
     */

    this.emit("end", this);
    return this;
  }

  /**
   * Fetches data from a key in the database
   * @param {string} key any string as a key, allows dot notation
   * @param {Options} options any options to be added to the request
   * @returns {Promise<any>} the data requested
   * @alias Client#get
   * @example const data = await db.fetch("users.1234567890.inventory");
   */

  public async fetch(key: string, ops?: Options): Promise<any> {
    if (!key) throw new TypeError("No key specified.");
    return await this.arbitrate(fetch, { id: key, ops: ops || {} });
  }

  /**
   * Fetches data from a key in the database
   * @param {string} key any string as a key, allows dot notation
   * @param {options} options any options to be added to the request
   * @returns {Promise<any>} the data requested
   * @alias Client#fetch
   * @example const data = await db.fetch("users.1234567890.inventory");
   */

  public async get(key: string, ops?: Options): Promise<any> {
    return await this.fetch(key, ops);
  }

  /**
   * Sets new data based on a key in the database
   * @param {string} key any string as a key, allows dot notation
   * @param value value of the data to be set
   * @param {Options} options any options to be added to the request
   * @returns {Promise<any>} the updated data
   * @example const data = await db.set("users.1234567890.level", 100);
   */

  public async set(key: string, value: any, ops?: Options): Promise<any> {
    if (!key) throw new TypeError("No key specified.");
    return await this.arbitrate(set, {
      id: key,
      data: value,
      ops: ops || {},
    });
  }

  /**
   * Adds a number to a key in the database. If no existing number, it will add to 0
   * @param {string} key any string as a key, allows dot notation
   * @param value value to add
   * @param {Options} options any options to be added to the request
   * @returns {Promise<any>} the updated data
   * @example const data = await db.add("users.1234567890.level", 1);
   */

  public async add(key: string, value: any, ops?: Options): Promise<any> {
    if (!key) throw new TypeError("No key specified.");
    if (isNaN(value)) throw new TypeError("No value specified to add.");
    return await this.arbitrate(add, {
      id: key,
      data: value,
      ops: ops || {},
    });
  }

  /**
   * Subtracts a number to a key in the database. If no existing number, it will subtract to 0
   * @param {string} key any string as a key, allows dot notation
   * @param value value to subtract
   * @param {Options} options any options to be added to the request
   * @returns {Promise<any>} the updated data
   * @example const data = await db.subtract("users.1234567890.level", 10);
   */

  public async subtract(key: string, value: any, ops?: Options): Promise<any> {
    if (!key) throw new TypeError("No key specified.");
    if (isNaN(value)) throw new TypeError("No value specified to subtract.");
    return await this.arbitrate(subtract, {
      id: key,
      data: value,
      ops: ops || {},
    });
  }

  /**
   * Push into an array in the database based on the key. If no existing array, it will create one
   * @param {string} key any string as a key, allows dot notation
   * @param value value to push
   * @param {Options} options any options to be added to the request
   * @returns {Promise<any>} the updated data
   * @example const data = await db.push("users.1234567890.inventory", "Slice of Cheese");
   */

  public async push(key: string, value: any, ops?: Options): Promise<any> {
    if (!key) throw new TypeError("No key specified.");
    if (!value && value != 0)
      throw new TypeError("No value specified to push.");
    return await this.arbitrate(push, {
      id: key,
      data: value,
      ops: ops || {},
    });
  }

  /**
   * Delete an object (or property) in the database
   * @param {string} key any string as a key, allows dot notation
   * @param {Options} options any options to be added to the request
   * @returns {boolean} `true` if success, if not found `false`
   * @example await db.delete("users.1234567890");
   */

  public async delete(key: string, ops?: Options): Promise<boolean> {
    if (!key) throw new TypeError("No key specified.");
    return await this.arbitrate(del, { id: key, ops: ops || {} });
  }

  /**
   * Returns a boolean indicating whether an element with the specified key exists or not
   * @param {string} key any string as a key, allows dot notation
   * @param {Options} options any options to be added to the request
   * @returns {boolean} boolean
   * @alias Client#includes
   * @example const data = await db.has("users.1234567890");
   */

  public async has(key: string, ops?: Options): Promise<boolean> {
    if (!key) throw new TypeError("No key specified.");
    return await this.arbitrate(has, { id: key, ops: ops || {} });
  }

  /**
   * Returns a boolean indicating whether an element with the specified key exists or not.
   * @param {string} key any string as a key, allows dot notation
   * @param {Options} options any options to be added to the request
   * @returns {Promise<boolean>} boolean
   * @alias Client#has
   * @example const data = await db.has("users.1234567890");
   */

  public async includes(key: string, ops?: Options): Promise<boolean> {
    return await this.has(key, ops);
  }

  /**
   * Deletes all rows from the entire active table.
   * Note: This does not delete the table itself. To delete the table itself along with the rows, use `drop()`.
   * @returns {Promise<number>} amount of rows deleted
   * @example const data = await db.clear();
   */

  public async clear(): Promise<number> {
    return await this.arbitrate(clear, { ops: {} }, this.tableName);
  }

  /**
   * Deletes the entire active table.
   * @returns {Promise<void>} void
   * @example await db.drop();
   */

  public async drop(): Promise<void> {
    return await this.arbitrate(drop, { ops: {} }, this.tableName);
  }

  /**
   * Fetches the entire active table
   * @param {Options} options any options to be added to the request
   * @returns {Promise<any>} entire table as an object
   * @alias Client#fetchAll
   * @example const data = await db.all();
   */

  public async all(ops?: Options): Promise<any> {
    return await this.arbitrate(all, { ops: ops || {} });
  }

  /**
   * Fetches the entire active table
   * @param {Options} options any options to be added to the request
   * @returns {Promise<any>} entire table as an object
   * @alias Client#all
   * @example const data = await db.all();
   */

  public async fetchAll(ops?: Options): Promise<any> {
    return await this.arbitrate(all, { ops: ops || {} });
  }

  /**
   * Used to get the type of the value
   * @param {string} key any string as a key, allows dot notation
   * @param {Options} options any options to be added to the request
   * @returns {Promise<"bigint" | "boolean" | "function" | "number" | "object" | "string" | "symbol" | "undefined">} type from `typeof`
   */

  public async type(
    key: string,
    ops?: Options
  ): Promise<
    | "bigint"
    | "boolean"
    | "function"
    | "number"
    | "object"
    | "string"
    | "symbol"
    | "undefined"
  > {
    if (!key) throw new TypeError("No key specified.");
    return await this.arbitrate(type, { id: key, ops: ops || {} });
  }

  /**
   * @private Arbitrate
   * @param {PgClient} client
   * @param {Params} params
   * @param {Options} options
   */

  private async arbitrate(
    method: (client: PgClient, params: Params, ops: Options) => any,
    params: Params,
    tableName?: string
  ): Promise<any> {
    if (!this.connected)
      throw new Error("Database is not connected. Use `connect()` to connect.");

    if (typeof params.id == "number") params.id = params.id.toString();

    const options = {
      table:
        this.options?.table || params.ops.table || tableName || "quickpostgres",
    };

    // Access database
    await this.client.query(
      `CREATE TABLE IF NOT EXISTS ${options.table} (ID TEXT, json TEXT)`
    );

    // Verify options
    if (params.ops.target && params.ops.target[0] === ".")
      params.ops.target = params.ops.target.slice(1);

    if (params.data && params.data === Infinity)
      throw new TypeError(
        `Infinity cannot be used as a field. (ID: ${params.id})`
      );

    // Stringify
    try {
      params.data = JSON.stringify(params.data);
    } catch (error) {
      throw new TypeError(
        `Please supply a valid input. (ID: ${params.id})\nError: ${error}`
      );
    }

    // Translate dot notation from keys
    if (params.id?.includes(".")) {
      const unparsed = params.id.split(".");
      params.id = unparsed.shift();
      params.ops.target = unparsed.join(".");
    }

    // Run and return method
    return await method(this.client, params, options);
  }
}
