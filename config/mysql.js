require("dotenv").config();
const mysql = require("mysql");

const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.MYSQL_PASSWORD,
  database: "MondeDB",
});

const sql = "";
mysqlConnection.connect((err, result) => {
  if (err) {
    console.log(err);
  } else {
    console.log("connected to mySQL server ");
  }
});

module.exports = mysqlConnection;
