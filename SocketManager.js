const values = require('lodash');

const io = require('./server.js').io;



const { CHAT, MULTIPLAYER, LIST_UPDATE, WINNER, HIGHSCORE, GAME_SETUP, GAME_OVER, INITIALIZE_GAME, DISPLAY_GAMES, VERIFY_USER, USER_CONNECTED, LOGOUT, GAME_UPDATE, USER_DISCONNECTED, GAME_START, USER_READY, GAME_INIT, USER_IN_GAME, GAME_REQUEST, REQUEST_DENIED, RESET, ADD_SHAPES, SPECTATE, SEND_TO_SPECTATOR, SPECTATE_INFO } = require('./Events.js')

const { createUser, generateShapes } = require('./Factories');

//const { con } = require("../database/MySQLConnection");

let connectedUsers = {};

let gamesInProgress = {};  

module.exports = function (socket, connected,setConnections) {
    connectedUsers = connected;
    socket.on(VERIFY_USER, (nickname, password, callback) => {
      /*  if (isUser(connectedUsers, nickname)) {
            callback({ isUser: 0, user: null })
        }
        else {

            //enable and change to fit database


            /*   con.query("SELECT * FROM user where name = '"+nickname+"' and password = '"+password+"'", function (err, result, fields) {
               if (err) throw err;
               if(result[0]){
                   */
            
            callback({ isUser: 2, user: createUser({ name: socket.handshake.session.userId.name, socketID: socket.id }) })
            /* }
             else {
             callback({ isUser: 1, user: null })
             }
         });*/
       // }
    })
    socket.on('disconnect', () => {
        if ("user" in socket) {
            let name = socket.user.name;
            if(connectedUsers[name] && connectedUsers[name].gameName){
            let game = gamesInProgress[connectedUsers[name].gameName];
            
            if (game){
                changeUserStatus(name, []);
                checkAndRemoveGame(game)
            }
            }
            connectedUsers = removeUser(connectedUsers, name);
            setConnections(connectedUsers)
            
            //gamesInProgress = removeGame(gamesInProgress, name);
            io.emit(USER_DISCONNECTED, { allUsers: connectedUsers, name });
            if (gamesInProgress) {
                io.emit(DISPLAY_GAMES, gamesInProgress)
            }
            
        }
    })
    socket.on(LOGOUT, () => {
        if (socket.user) {
            let name = socket.user.name;
            //connectedUsers = removeUser(connectedUsers, socket.user.name);
            //setConnections(connectedUsers)
            io.emit(USER_DISCONNECTED, { allUsers: connectedUsers, name });
            if (gamesInProgress) {
                io.emit(DISPLAY_GAMES, gamesInProgress);
            }
            checkAndRemoveGame(socket.user.gameName)
        }
    })

    socket.on(USER_CONNECTED, (user) => {
        user.socketID = socket.id; 
        connectedUsers = addUser(connectedUsers, user);
        setConnections(connectedUsers);
        socket.user = user;
        io.emit(USER_CONNECTED, connectedUsers);
        if (gamesInProgress) {
            io.emit(DISPLAY_GAMES, gamesInProgress);
        }
        showHighscores(socket);
    })
    socket.on(LIST_UPDATE, () => {
        socket.emit(USER_CONNECTED, connectedUsers);
        socket.emit(DISPLAY_GAMES, gamesInProgress);
    })
    socket.on(GAME_UPDATE, ({ matrix, shape, reciever, sender, score, totalScore, acceleration, blockSize }) => {

        if (socket.user) {
            let current = connectedUsers[socket.user.name];
            current.score = totalScore;
            let game = gamesInProgress[checkGame(reciever, sender)]
            if (game) {
                let recieversStatus = game.recieversStatus;
                if (recieversStatus[socket.user.name])
                    recieversStatus[socket.user.name].score = totalScore;
            }
            emitToAllRecievers({ matrix: matrix, shape: shape, score, totalScore, acceleration, sender, blockSize }, GAME_UPDATE, reciever, socket);
        }
    })

    socket.on(MULTIPLAYER, user => {
        if(connectedUsers[user]){
        connectedUsers[user].gameMode = 1;
        io.emit(USER_CONNECTED, connectedUsers);
        }
        else {
            console.log("user created: "+user)
            console.log(connectedUsers)
            connectedUsers = addUser(connectedUsers, createUser({name: user, socketID: socket.id, gameMode: 1}));
            console.log(connectedUsers)
            io.emit(USER_CONNECTED, connectedUsers);
        }
    })


    socket.on(GAME_INIT, () => {
        socket.emit(GAME_INIT, generateShapes(1000, 7));
    })

    socket.on(RESET, ({ to, user, keepGameMode }) => {
        let rec;
        let current = connectedUsers[user];
        let game = gamesInProgress[checkGame(to, user)];
        if (game)
            changeUserStatus(user, to); 
        if (current) {
            current.inGame = false;
            if(keepGameMode){
                current.gameMode = 1;
            }
            else current.gameMode = 0;
           
        }
        if (to)
            to.forEach(name => {
                rec = connectedUsers[name];
                if (rec)
                 if(!rec.inGame)
                    socket.to(rec.socketID).emit(RESET, user);
            })
            if(current)
            checkAndRemoveGame(current.gameName)
        io.emit(USER_CONNECTED, connectedUsers);
    })

    socket.on(USER_READY, ({ user, reqSender }) => {
        const sender = connectedUsers[reqSender];
        if (sender)
            if (!sender.inGame) {
                socket.to(sender.socketID).emit(USER_READY, { user, tf: true });
            }
            else socket.emit(USER_READY, { user, tf: false });
    })

    socket.on(REQUEST_DENIED, ({ user, reqSender }) => {
        const senderID = connectedUsers[reqSender].socketID;
        socket.to(senderID).emit(REQUEST_DENIED, user);
    })

    socket.on(INITIALIZE_GAME, ({ sender, recievers, difficulty }) => {
        let rec;
        const generatedShapes = generateShapes(1000, difficulty);
        let tempArray;

        for (var i = 0; i < recievers.length; i++) {
            rec = connectedUsers[recievers[i]];
            if (rec) {
                tempArray = recievers.slice(0);
                tempArray.splice(i, 1);
                tempArray.push(sender);
                rec.inGame = true;
                rec.gameName = sender;
                socket.to(rec.socketID).emit(INITIALIZE_GAME, { generatedShapes, recievers: tempArray, difficulty });
            }
        }
        let s = connectedUsers[sender];
        if (s) {
            s.inGame = true;
            s.gameName = sender;
        }
        socket.emit(INITIALIZE_GAME, { generatedShapes, recievers, difficulty });
        io.emit(USER_CONNECTED, connectedUsers);
        recievers.push(sender)
        gamesInProgress = addGame(gamesInProgress, sender, recievers);

    })

    socket.on(GAME_START, ({ to, user }) => {
        let rec;
        socket.emit(GAME_START, { start: true });
        if (to) {
            to.forEach(name => {
                rec = connectedUsers[name];
                if (rec)
                    socket.to(rec.socketID).emit(GAME_START, { start: true });
            })

        }
        if (gamesInProgress) {
            io.emit(DISPLAY_GAMES, gamesInProgress);
        }
    })

    socket.on(USER_IN_GAME, ({ username }) => {
        connectedUsers[username].inGame = true;
        io.emit(USER_CONNECTED, connectedUsers);
    })

    socket.on(GAME_REQUEST, ({ sender, reciever }) => {
        let rec;
        rec = connectedUsers[reciever];
        socket.to(rec.socketID).emit(GAME_REQUEST, { sender });

    })

    socket.on(ADD_SHAPES, (reciever) => {
        const newShapes = generateShapes(100, 7);
        socket.emit(ADD_SHAPES, newShapes);
        reciever.forEach(name => {
            socket.to(connectedUsers[name].socketID).emit(ADD_SHAPES, newShapes);
        })
    })


    socket.on(SPECTATE, ({ user, game }) => {
        let gameToSpectate = gamesInProgress[game];
        let u1;
        if (gameToSpectate)
            u1 = connectedUsers[gameToSpectate.sender];
        let un;
        if (u1)
            socket.to(u1.socketID).emit(SPECTATE, user);
        gameToSpectate.recievers.forEach(name => {
            un = connectedUsers[name];
            if (un)
                socket.to(un.socketID).emit(SPECTATE, user);
        })
        let recievers = gameToSpectate.recievers;
        if (recievers.indexOf(game) === -1)
            recievers.push(game);
        socket.emit(SPECTATE_INFO, recievers);

    })
    socket.on(SEND_TO_SPECTATOR, ({ matrix, shape, spectator, user, totalScore, score, blockSize }) => {

        const specID = connectedUsers[spectator];
        if (specID)
            socket.to(specID.socketID).emit(SEND_TO_SPECTATOR, { matrix, shape, user, totalScore, score, blockSize });
    })

    socket.on(GAME_OVER, ({ user, recievers, score, totalScore, difficulty }) => {
        let reciever, sql;
        const game = checkGame(recievers, user);
        if (gamesInProgress[game]) {
            const currentRecievers = gamesInProgress[game].recieversStatus;
            currentRecievers[user].gameOver = true; 
            recievers.forEach(name => {
                if(currentRecievers[name])  
                if (currentRecievers[name].inGame) {
                    reciever = connectedUsers[name]
                    if (reciever) {
                        socket.to(reciever.socketID).emit(GAME_OVER, user);
                    }
                }
            })
        }
        //changeUserStatus(user, recievers);
       /* if (difficulty == 7) {
            sql = "INSERT INTO highscore VALUES (null, '" + user + "', " + totalScore + ", " + score + ", 0)";
            con.query(sql, function (err, result) {
                if (err) throw err;
            });
        }
        else {
            sql = "INSERT INTO highscore VALUES (null, '" + user + "', " + totalScore + ", " + score + ", 1)";
            con.query(sql, function (err, result) {
                if (err) throw err;
            });
        }*/

        if (isGameOver(user, recievers)) {
            const winnerData = declareWinner(user, recievers);
            socket.emit(WINNER, winnerData)
            const game = checkGame(recievers, user);
            const players = gamesInProgress[checkGame(recievers, user)].recieversStatus;
            recievers.forEach(name => {

                let rec = connectedUsers[name];
                if (rec && players[name].inGame) {
                    socket.to(rec.socketID).emit(WINNER, winnerData);
                }

            });
            gamesInProgress = removeGame(gamesInProgress, game);
            io.emit(DISPLAY_GAMES, gamesInProgress);
        }


    })

    socket.on(GAME_SETUP, ({ master, recievers }) => {
        let rec;
        recievers.forEach(name => {
            rec = connectedUsers[name];
            if (rec)
                socket.to(rec.socketID).emit(GAME_SETUP, { master, recievers });
        })
    })

    socket.on(CHAT, ({ user, msg}) => {
        let line = user +": "+msg;
        io.emit(CHAT, line);
    })

}

function emitToAllRecievers(data, emitType, recievers, socket) {
    let rec;
    if (recievers)
        recievers.forEach(name => {
            rec = connectedUsers[name];
            if (rec)
                if (rec.inGame) {
                    socket.to(rec.socketID).emit(emitType, data);
                }
        })
}
function isUser(userList, username) {

    return username in userList || username === "Guest";
}

function addUser(userList, user) {
    let newList = Object.assign({}, userList);
    newList[user.name] = user;
    return newList;
}
function removeUser(userList, username) {
    let newList = Object.assign({}, userList);
    delete newList[username];
    return newList;
}
function addGame(userList, sender, recievers) {
    let recieversStatus;
    recievers.forEach(name => {
        let rec = Object.assign({}, recieversStatus);
        rec[name] = { name, gameOver: false, inGame: true, score: 0 }
        recieversStatus = rec;
    })
    let newList = Object.assign({}, userList);
    newList[sender] = { sender, recievers, recieversStatus };
    return newList;
}
function removeGame(userList, sender) {
    let newList = Object.assign({}, userList);
    delete newList[sender];
    return newList;
}

function showHighscores(socket) {
  /*  con.query("SELECT * FROM highscore where mode = 0 ORDER BY score DESC ", function (err, result, fields) {
        if (err) throw err;
        socket.emit(HIGHSCORE, { result, mode: 'normal' });
    });
    con.query("SELECT * FROM highscore where mode = 1 ORDER BY score DESC ", function (err, result, fields) {
        if (err) throw err;
        socket.emit(HIGHSCORE, { result, mode: 'easy' });
    });*/
}
// provera da li je korisnik u nekoj od igara; vraca ime igre
function checkGame(recievers, user) {
    let temp = "";
    if (user in gamesInProgress) {
        temp = user;
    }
    else if (recievers)
        recievers.forEach(name => {
            if (name in gamesInProgress) {
                temp = name;
            }
        })   
    return temp;
}

function changeUserStatus(user, recievers) { 
    let game = checkGame(recievers, user)
    let currentGame = gamesInProgress[game];
    if (currentGame) {
        if(currentGame.recieversStatus[user]){
        currentGame.recieversStatus[user].inGame = false;
        currentGame.recieversStatus[user].gameOver = true;
        }
    }
}

function isGameOver(user, recievers) {
    let game = checkGame(recievers, user)
    let currentGame = gamesInProgress[game];
    let temp = true;
    if (currentGame) {
        let currentRecievers = currentGame.recieversStatus;
        recievers.forEach(reciever => {
            if (!currentRecievers[reciever].gameOver && reciever in connectedUsers) {
                temp = false;
                

            }
        })
    }
    return temp;
}

function declareWinner(user, recievers) {
    let game = checkGame(recievers, user);
    let currentPlayers = gamesInProgress[game].recieversStatus;
    let temp = currentPlayers[user];
    let winner = temp.name;
    let score = temp.score;
    recievers.forEach(reciever => {
        temp = currentPlayers[reciever];
        if (temp.score > score) {
            score = temp.score;
            winner = reciever;
        }
    })
    return { winner, score };
}

function checkAndRemoveGame(gameName){
    const game = gamesInProgress[gameName]
    if(game){
    const recs = values(game.recieversStatus)
    let temp = false;
    recs.forEach(rec => {
        if(!rec.gameOver){
            temp = true; 

        }
    })
    
    if(!temp){
        gamesInProgress = removeGame(gamesInProgress, gameName)
        io.emit(DISPLAY_GAMES, gamesInProgress)
    }
}
}

