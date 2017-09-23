const app = require("express")();
const express = require("express");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const _ = require("underscore")._;
const test = require("./server-service/game-service.module.js");

let users = [];
let left = "";
let isTurn = "";
let randomSign = "";

app.use(express.static(__dirname + "/"));
app.use('/js', express.static('./node_modules/snapsvg/dist'));

io.on("connection", (socket) => {
    console.log("A user connected with id " + socket.id);

    if (0 === users.length) {
        randomSign = test.assignSignToFirstUser().randomSign;
        isTurn = test.assignSignToFirstUser().isTurn;
        left = test.assignSignToFirstUser().left;

        users.push(test.addNewUser(socket, randomSign));
        socket.emit("turn", isTurn);
    } else if (1 === users.length) {
        users.push(test.addNewUser(socket, left));
    } else {
        users.push(test.addNewUser(socket, "watcher"));
    }

    socket.on("saveSelectedQuadrat", (data) => {
        test.saveSelectedQuadratInBoard(data, io);
        io.emit("colorQuadrat", data);
    });

    socket.on("turn", (turn) => {
        io.emit("turn", test.changeUserTurn(turn));
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected with id " + socket.id);
        test.deleteUser(socket, users);
    });
});

http.listen(3020, () => {
    console.log("listening on 3020");
});