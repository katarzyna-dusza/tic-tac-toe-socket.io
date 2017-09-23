const app = require("express")();
const express = require("express");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const _ = require("underscore")._;
const gameService = require("./server-service/game-service.module.js");

let users = [];
let left = "";
let isTurn = "";
let randomSign = "";

app.use(express.static(__dirname + "/"));
app.use('/js', express.static('./node_modules/snapsvg/dist'));


function createPlayers(socket) {
    if (0 === users.length) {
        randomSign = gameService.assignSignToFirstUser().randomSign;
        isTurn = gameService.assignSignToFirstUser().isTurn;
        left = gameService.assignSignToFirstUser().left;

        users.push(gameService.addNewUser(socket, randomSign));
        return socket.emit("turn", isTurn);
    }

    return users.push(gameService.addNewUser(socket, left));
}

function createNewUsers(socket) {
    if (2 > users.length) {
        return createPlayers(socket);
    }

    socket.disconnect();
}

io.on("connection", (socket) => {
    console.log("A user connected with id " + socket.id);

    createNewUsers(socket);
    io.emit("allUsers", users);

    socket.on("saveSelectedQuadrat", (data) => {
        gameService.saveSelectedQuadratInBoard(data, io);
        io.emit("colorQuadrat", data);
    });

    socket.on("turn", (turn) => {
        io.emit("turn", gameService.changeUserTurn(turn));
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected with id " + socket.id);
        gameService.deleteUser(socket, users);
    });
});

http.listen(3020, () => {
    console.log("listening on 3020");
});