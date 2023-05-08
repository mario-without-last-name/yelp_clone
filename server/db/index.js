// https://node-postgres.com/features/connecting
// npm i pg
const { Pool } = require("pg");
// Bad practice. when you upload this file to github, people will see the password
/*
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'yelp',
  password: 'b!Nu$11092002',
  port: 5432,
});
*/

// This will automatically look for the information in the .env file.
const pool = new Pool();

module.exports = {
  query: (text, params) => pool.query(text, params),
};