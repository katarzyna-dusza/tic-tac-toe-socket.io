const app = require("express")();
const express = require("express");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const _ = require("underscore")._;

const test = require("./game-server.module");

const MAX_USERS_NUMBER = 2;
let signs = ["circle", "cross"];
let users = [];
let left = "";
let isTurn = "";
let randomSign = "";
let gameBoard = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8]
];

function addNewUser(socket, sign) {
    users.push({id: socket.id, sign: sign});

    socket.emit("allUsers", users);
}

app.use(express.static(__dirname + "/"));

io.on("connection", (socket) => {
    //console.log(users.length);

    if (0 === users.length) {
        randomSign = test.randomSignForUser();
        isTurn = randomSign;
        left = _.first(_.without(signs, randomSign));

        addNewUser(socket, randomSign);
        socket.emit("turn", isTurn);
    } else if (1 === users.length) {
        addNewUser(socket, left);
    } else {
        if (MAX_USERS_NUMBER <= users.length) {
            addNewUser(socket, "watcher");
        }
    }
    console.log("A user connected with id " + socket.id);

    //console.log(users);

    socket.on("saveSelectedQuadrat", (data) => {
        test.saveSelectedQuadratInBoard(data, io);
        io.emit("colorQuadrat", data);
    });

    socket.on("turn", (turn) => {
        if (randomSign === isTurn) {
            isTurn = left;
        } else {
            isTurn = randomSign;
        }
        //console.log(isTurn);

        io.emit("turn", isTurn);
    });

    socket.on("disconnect", () => {
        let index = 0;

        users.forEach(function(user) {
            if (user.id == socket.id) {
                signs.push(user.sign);
                index = users.indexOf(user);
            }
        });
        users.splice(index, 1);

        console.log("A user disconnected with id " + socket.id);
    });
});

http.listen(3020, () => {
    console.log("listening on 3020");
});