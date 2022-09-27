require("dotenv").config();
const mysql = require("mysql");

const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.MYSQL_PASSWORD,
  database: "MondeDB",
});

var del = mysqlConnection._protocol._delegateError;
mysqlConnection._protocol._delegateError = function (err, sequence) {
  if (err.fatal) {
    console.trace("fatal error: " + err.message);
  }
  return del.call(this, err, sequence);
};

const sql = "";
mysqlConnection.connect((err, result) => {
  if (err) {
    console.log(err);
  } else {
    console.log("connected to mySQL server ");
  }
});

module.exports = mysqlConnection;
