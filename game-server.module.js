const _ = require("underscore")._;

let signs = ["circle", "cross"];
let gameBoard = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8]
];
let users = [];
let randomSign = "";
let left = "";
let isTurn = "";

function randomSignForUser() {
    let zeroOrOneRandom = _.random(0, 1);
    return signs[zeroOrOneRandom];
}

function assignSignToUser(socket) {
    return {
        first: assignSignToFirstUser(socket),
        second: addNewUser(socket, left),
        next: addNewUser(socket, "watcher")
    }
}

function addNewUser(socket, sign) {
    users.push({id: socket.id, sign: sign});

    socket.emit("allUsers", users);
}

function assignSignToFirstUser(socket) {
    console.log(users);
    randomSign = randomSignForUser();
    isTurn = randomSign;
    left = _.first(_.without(signs, randomSign));

    addNewUser(socket, randomSign);
    console.log(users);
    socket.emit("turn", isTurn);
}

function assignSignToSecondUser(socket) {
    addNewUser(socket, left);
}

function assignSignToBothUsers(socket) {
    console.log(users);
    console.log(users.length);
    if (0 === users.length) {
        console.log("lldl");
        return assignSignToUser(socket).first;
        // randomSign = randomSignForUser();
        // isTurn = randomSign;
        // left = _.first(_.without(signs, randomSign));
        //
        // addNewUser(socket, randomSign);
        // socket.emit("turn", isTurn);
    } else if (1 === users.length){
        console.log("aaa");
        return assignSignToUser(socket).second;
        //addNewUser(socket, left);
    } else {
        console.log("vbbb");
        return assignSignToUser(socket).next;
        //addNewUser(socket, "watcher");
    }

    console.log(users.length);
}

function changeUserTurn() {
    if (randomSign === isTurn) {
        return left;
    }

    return isTurn;
}

function checkIfCurrentUserWon(user, io) {
    console.log("dlld1");
    console.log(gameBoard[0][0]);
    console.log(gameBoard[0][1]);
    console.log(gameBoard[0][2]);
    const COL_0 = 0;
    const COL_1 = 1;
    const COL_2 = 0;

    if ([gameBoard[0][0], gameBoard[0][1], gameBoard[0][2]].every(function (v, i, a) {
            return (
                v === a[0] &&
                v !== null
            );
        })) {
        io.emit("winner", user);

    }

    if (gameBoard[0][0] === gameBoard[0][1] === gameBoard[0][2]) {
        // || gameBoard[1][0] === gameBoard[1][1] === gameBoard[1][2]
        // || gameBoard[2][0] === gameBoard[2][1] === gameBoard[2][2]
        //
        // || gameBoard[0][0] === gameBoard[1][0] === gameBoard[2][0]
        // || gameBoard[0][1] === gameBoard[1][1] === gameBoard[2][1]
        // || gameBoard[0][2] === gameBoard[1][2] === gameBoard[2][2]
        //
        // || gameBoard[0][0] === gameBoard[1][1] === gameBoard[2][2]
        // || gameBoard[2][0] === gameBoard[1][1] === gameBoard[0][2]

        console.log("dlld");
        console.log(gameBoard[0][0]);
        console.log(gameBoard[0][1]);
        console.log(gameBoard[0][2]);
        console.log("winner" + user);
        console.log("dlld");
    }
}

function saveSelectedQuadratInBoard(data, io) {
    for (let row = 0; row < gameBoard.length; row++) {
        for (let column = 0; column < gameBoard.length; column++) {
            if (gameBoard[row][column] === data.quadratNumber) {
                gameBoard[row][column] = data.user;
                checkIfCurrentUserWon(data.user, io);
                io.emit("colorQuadrat", data);
            }
        }
    }
}

function deleteUser(socket) {
    let index = 0;

    console.log(users);
    users.forEach(function(user) {
        if (user.id == socket.id) {
            signs.push(user.sign);
            index = users.indexOf(user);
            console.log(index);
            console.log(user);
        }
    });
    users.splice(index, 1);
    console.log("now" + users);
}


module.exports = {
    randomSignForUser: randomSignForUser,
    assignSignToFirstUser: assignSignToFirstUser,
    addNewUser: addNewUser,
    saveSelectedQuadratInBoard: saveSelectedQuadratInBoard,
    assignSignToBothUsers: assignSignToBothUsers,
    changeUserTurn: changeUserTurn,
    deleteUser: deleteUser
};