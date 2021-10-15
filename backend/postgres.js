const { Client } = require("pg");
require("dotenv").config();
//------------------------------------------------------------------------------
//DATABASE INITIALIZE
//------------------------------------------------------------------------------

//Initialize a connection to postgres
const postgres = new Client({
  connectionString: process.env.DB_URI,
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  console.log("Attempting to connected to postgres...");
  postgres.connect().then((res) => {
    console.log("Successfully connected to postgres");
  });
} catch (e) {
  console.error("Error trying to connect to postgres");
  console.error(e);
}

module.exports = postgres;
