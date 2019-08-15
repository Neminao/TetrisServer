"use strict";
exports.__esModule = true;
var mysql = require("mysql");
const config = {
    host: "eu-cdbr-west-02.cleardb.net",
    user: "bbbe4c4b9258de",
    password: "6cd2ff07",
    database: "heroku_22978428292f607",
    url: "mysql://bbbe4c4b9258de:6cd2ff07@eu-cdbr-west-02.cleardb.net/heroku_22978428292f607?reconnect=true"
};
var database = mysql.createPool(config.url);


/*function handleDisconnect(){
    con = mysql.createConnection(config.url);

    con.connect(function (err) {
        if(err) {
            console.log("Error when connecting:", err);
            setTimeout(handleDisconnect, 2000);
        }
        console.log("connected to database");
    });

    con.on('error', function(err) {
        console.log("DB error:", err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.log("Connection lost, attempting reconnect")
            handleDisconnect();
        } else if(err.fatal){
            console.log("Fatal error occured")
        } else {
            console.log("Final error", err)
            throw err;
        }
    })
    /*connection.on('error', function(err) {
        if(!err.fatal){
            return;
        }

        if(err.code !== 'PROTOCOL_CONNECTION_LOST') {
            throw err;
        }
        console.log('Re-connecting lost connection: ' + err.stack);
        
        handleDisconnect(con);
        con.connect(function (err) {
            if (err)
                throw err;
            console.log("Connected");
        });
    })
}*/

//handleDisconnect();


module.exports = {
    database
}


