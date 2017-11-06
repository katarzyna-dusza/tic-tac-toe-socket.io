const app = require('express')();
const express = require('express');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const _ = require('underscore')._;
const gameService = require('./server-service/game-service.module.js');

const MAX_USERS_NUMBER = 2;
let users = [];
let left = '';
let isTurn = '';
let randomSign = '';
let board = [];
let signs = {};

app.use(express.static(__dirname + '/'));
app.use('/js', express.static('./node_modules/snapsvg/dist'));

function createPlayers(socket) {
    if (0 === users.length) {
        signs = gameService.assignSignToFirstUser();
        randomSign = signs.randomSign;
        isTurn = randomSign;
        left = signs.left;

        users.push(gameService.addNewUser(socket, randomSign));
        return socket.emit('turn', isTurn);
    }


    return users.push(gameService.addNewUser(socket, left));
}

function createNewUsers(socket) {
    if (MAX_USERS_NUMBER > users.length) {
        return createPlayers(socket);
    }

    return socket.disconnect();
}

io.on('connection', (socket) => {
    console.log('A user connected with id ' + socket.id);

    createNewUsers(socket);
    io.emit('allUsers', users);

    socket.on('saveSelectedQuadrat', (data) => {
        gameService.saveSelectedQuadratInBoard(data, io);
        io.emit('colorQuadrat', data);
    });

    socket.on('turn', (turn) => {
        io.emit('turn', gameService.changeUserTurn(turn));
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected with id ' + socket.id);
        gameService.deleteUser(socket, users);
    });
});

http.listen(3020, () => {
    console.log('listening on 3020');
});