# [Quickpostgres](https://npmjs.com/package/quickpostgres)

An easy, beginner-friendly [PostgreSQL](https://www.postgresql.org/) database wrapper similar to [quick.db](https://github.com/lorencerri/quick.db).

## Installation

<!-- You can easily install quickpostgres using your preferred package manager.

```bash
npm install quickpostgres
# or
yarn add quickpostgres
# or
pnpm add quickpostgres
``` -->

Not yet published.

## Requirements

- Node.js 14 or above
- A PostgreSQL database

## Usage

Quickpostgres has similar (if not almost identical) syntax to [quick.db](https://github.com/lorencerri/quick.db). You can refer to their [documentation](https://quickdb.js.org/) if you are getting stuck.

> Note: Quickpostgres is built on top of promises, meaning you need to resolve them first using `.then()` or `await` to get their returned data.

```js
// Import quickpostgres
const { Client } = require("quickpostgres");

// Create a new client using the default values on localhost
const dbUrl = "postgresql://postgres:<password>@localhost:5432/postgres";
const db = new Client(dbUrl);

(async () => {
  // Connect to your client
  await db.connect();

  // Setting an object in the database:
  await db.set("userInfo", { difficulty: "Easy" });
  // => { difficulty: "Easy" }

  // Pushing an element to an array (that doesn't exist yet) in an object:
  await db.push("userInfo.items", "Sword");
  // => { difficulty: "Easy", items: ["Sword"] }

  // Adding to a number (that doesn"t exist yet) in an object:
  await db.add("userInfo.balance", 500);
  // => { difficulty: "Easy", items: ["Sword"], balance: 500 }

  // Repeating previous examples:
  await db.push("userInfo.items", "Watch");
  // => { difficulty: "Easy", items: ["Sword", "Watch"], balance: 500 }
  await db.add("userInfo.balance", 500);
  // => { difficulty: "Easy", items: ["Sword", "Watch"], balance: 1000 }

  // Fetching individual properties
  await db.get("userInfo.balance"); // => 1000
  await db.get("userInfo.items"); // ["Sword", "Watch"]

  // End the database connection
  await db.end();
})();
```

## Support

For now, please use [GitHub discussions](https://github.com/GodderE2D/quickpostgres/discussions) if you need any support.

I may consider opening a Discord support server soon, but this is not guranteed.

## Contributing

If you spot a bug or you have a feature request, please open a [GitHub issue](https://github.com/GodderE2D/quickpostgres/issues), or if you'd like to write some code, you can open a [pull request](https://github.com/GodderE2D/quickpostgres/pulls).

If you spot a security vulnerability, please [contact me](mailto:main@godder.xyz).

## License

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
