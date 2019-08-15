"use strict";
exports.__esModule = true;
var mysql = require("mysql");
const con = mysql.createConnection({
    host: "eu-cdbr-west-02.cleardb.net",
    user: "bbbe4c4b9258de",
    password: "6cd2ff07",
    database: "heroku_22978428292f607"
});
con.connect(function (err) {
    if (err)
        throw err;
    console.log("Connected");
});



module.exports = {
    con
}


