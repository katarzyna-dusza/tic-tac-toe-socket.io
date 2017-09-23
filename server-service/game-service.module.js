const _ = require("underscore")._;

let signs = ["circle", "cross"];
let gameBoard = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8]
];
let randomSign = "";
let left = "";

function winningOptions() {
    const FIRST_ROW = [gameBoard[0][0], gameBoard[0][1], gameBoard[0][2]];
    const SECOND_ROW = [gameBoard[1][0], gameBoard[1][1], gameBoard[1][2]];
    const THIRD_ROW = [gameBoard[2][0], gameBoard[2][1], gameBoard[2][2]];
    const FIRST_COLUMN = [gameBoard[0][0], gameBoard[1][0], gameBoard[2][0]];
    const SECOND_COLUMN = [gameBoard[0][1], gameBoard[1][1], gameBoard[2][1]];
    const THIRD_COLUMN = [gameBoard[0][2], gameBoard[1][2], gameBoard[2][2]];
    const FIRST_SLANT = [gameBoard[0][0], gameBoard[1][1], gameBoard[2][2]];
    const SECOND_SLANT = [gameBoard[2][0], gameBoard[1][1], gameBoard[0][2]];

    return [
        FIRST_ROW,
        SECOND_ROW,
        THIRD_ROW,
        FIRST_COLUMN,
        SECOND_COLUMN,
        THIRD_COLUMN,
        FIRST_SLANT,
        SECOND_SLANT
    ]
}

function randomSignForUser() {
    let zeroOrOneRandom = _.random(0, 1);
    return signs[zeroOrOneRandom];
}

function assignSignToFirstUser() {
    randomSign = randomSignForUser();
    left = _.first(_.without(signs, randomSign));

    return {
        randomSign: randomSign,
        isTurn: randomSign,
        left: left
    };
}

function addNewUser(socket, sign) {
    return {id: socket.id, sign: sign};
}


function changeUserTurn(turn) {
    if (randomSign === turn) {
        return left;
    }

    return randomSign;
}

function deleteUser(socket, users) {
    let index = 0;

    _.each(users, (user) => {
        if (user.id == socket.id) {
            index = users.indexOf(user);
        }
    });
    users.splice(index, 1);
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

function checkIfCurrentUserWon(user, io) {
    _.each(winningOptions(), (winningOption) => {
        if (winningOption.every(function (v, i, a) {
                return v === a[0];
            })) {
            io.emit("winner", user);
        }

    });
}

module.exports = {
    assignSignToFirstUser: assignSignToFirstUser,
    addNewUser: addNewUser,
    saveSelectedQuadratInBoard: saveSelectedQuadratInBoard,
    changeUserTurn: changeUserTurn,
    deleteUser: deleteUser
};