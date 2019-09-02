"use strict";
exports.__esModule = true;
var mysql = require("mysql");
const config = {
    
};
var database = mysql.createPool(config.url);

module.exports = {
    database
}


