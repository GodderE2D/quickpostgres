/* eslint-disable @typescript-eslint/no-var-requires */

// Please add a reasonable test scenario if you add a method.
// For each method added, a test scenario must be added too.

// Note: QUICKPOSTGRES_DEV_POSTGRES_URL should never be present except when developing or in CI.

const { Client } = require("../dist/index");
require("dotenv").config();
const db = new Client(process.env.QUICKPOSTGRES_DEV_POSTGRES_URL);

let count = 0;
let errored = false;

class Test {
  value;
  constructor(value) {
    this.value = value;
    count++;
  }

  test(expected) {
    if (this.value === expected) console.log(`✅ Test ${count} passed.`);
    else {
      errored = true;
      console.error(
        `\n❌ Test ${count} failed.\nReceived: ${this.value}\nExpected: ${expected}\n`
      );
    }
  }
}

db.on("ready", () => console.log("ℹ️ Database connected"));
db.on("end", () => console.log("ℹ️ Database connection ended"));

(async () => {
  await db.connect();

  console.time("Time to test (excludes connection & end)");

  await db.set("userInfo", { difficulty: "Easy" });

  await db.set("users.0", {
    username: "Zero",
    email: "zero@quickpostgres.com",
    points: 50,
    inventory: ["Item 1", "Item 2"],
    nested: {
      object: "Hello world!",
    },
  });

  // Test 1
  new Test(await db.get("users.0.username")).test("Zero");
  // Test 2
  new Test(await db.get("users.0.email")).test("zero@quickpostgres.com");
  // Test 3
  new Test((await db.get("users.0.inventory")).includes("Item 2")).test(true);
  // Test 4
  new Test(await db.get("users.0.nested.object")).test("Hello world!");

  await db.push("users.0.inventory", "Item 3");
  // Test 5
  new Test((await db.get("users.0.inventory")).includes("Item 3")).test(true);

  await db.add("users.0.points", 10);
  // Test 6
  new Test(await db.get("users.0.points")).test(60);

  await db.subtract("users.0.points", 50);
  // Test 7
  new Test(await db.get("users.0.points")).test(10);

  await db.delete("users.0.email");
  // Test 8
  new Test(!!(await db.get("users.0.email"))).test(false);
  // Test 9
  new Test(await db.has("users.0.email")).test(false);
  // Test 10
  new Test(await db.get("users.0.nonExistentElement")).test(undefined);
  // Test 11
  new Test(await db.has("users.0.nonExistentElement")).test(false);
  // Test 12
  new Test(await db.has("users.0.nested")).test(true);

  // Test 13
  new Test(await db.type("users.0.points")).test("number");

  console.timeEnd("Time to test (excludes connection & end)");

  await db.drop();
  await db.end();

  if (errored) process.exit(1);
})();
