const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  development: {
    username: "root",
    password: process.env.SQL_PWD,
    database: "wordle-maker",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  test: {
    username: "root",
    password: null,
    database: "wodle-maker",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: "root",
    password: null,
    database: "wodle-maker",
    host: "127.0.0.1",
    dialect: "mysql"
  }
}