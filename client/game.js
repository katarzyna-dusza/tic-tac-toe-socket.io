const socket = io();

const quadrats = $('.quadrat');
const turnInfo = $('.turn-header');
let isUserTurn = "";

function colorQuadrat(number, sign) {
    if ("circle" === sign) {
        return $(quadrats[number]).addClass("marked-circle blocked-field");
    }

    return $(quadrats[number]).addClass("marked-cross blocked-field");
}

function mark(number) {
    socket.emit("turn", isUserTurn);
    socket.emit("saveSelectedQuadrat", {quadratNumber: number, user: isUserTurn});
}

socket.on("turn", (isTurn) => {
    isUserTurn = isTurn;
    $(turnInfo).text("Now is a " + isTurn.toUpperCase() + " turn.");
});

socket.on("colorQuadrat", (data) => {
    colorQuadrat(data.quadratNumber, data.user);
});

socket.on("winner", (user) => {
    $(turnInfo).text(user.toUpperCase() + " won!");
    $(quadrats).addClass("blocked-field");
});