"use strict";
exports.__esModule = true;
var mysql = require("mysql");
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "highscore"
});
con.connect(function (err) {
    if (err)
        throw err;
    console.log("Connected");
});

module.exports = {
    con
}


