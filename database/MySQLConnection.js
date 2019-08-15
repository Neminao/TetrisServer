"use strict";
exports.__esModule = true;
var mysql = require("mysql");
const config = {
    host: "eu-cdbr-west-02.cleardb.net",
    user: "bbbe4c4b9258de",
    password: "6cd2ff07",
    database: "heroku_22978428292f607"
};
let con = mysql.createConnection(config);
function handleDisconnect(connection){
    connection.on('error', function(err) {
        if(!err.fatal){
            return;
        }

        if(err.code !== 'PROTOCOL_CONNECTION_LOST') {
            throw err;
        }

        con = mysql.createConnection(config);
        handleDisconnect(con);
        con.connect(function (err) {
            if (err)
                throw err;
            console.log("Connected");
        });
    })
}

handleDisconnect(con);


module.exports = {
    con
}


