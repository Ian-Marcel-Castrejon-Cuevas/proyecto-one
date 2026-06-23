const { Pool } = require("pg");

const pool = new Pool({
  host: "192.168.8.55",
  user: "asecon",
  password: "MassLrj10$",
  database: "asecon",
  port: 5432,
});

module.exports = pool;
