require("dotenv").config();

const express = require("express");
const app = express();
const db = require("./db");
const port = 8080;

app.get("/", async (_, res) => {
  try {
    const { rows } = await db.query("SELECT NOW()"); // Sample query
    res.send(`Hello World! The current time is: ${rows[0].now}`);
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).send("Error occurred while accessing the database.");
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
