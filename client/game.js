const socket = io();

const quadrats = $('.quadrat');
const turnInfo = $('.turn-header');
const me = $('.my-sign');
let isUserTurn = '';

function colorQuadrat(number, sign) {
    if ('circle' === sign) {
        return $(quadrats[number]).addClass('marked-circle blocked-field');
    }

    return $(quadrats[number]).addClass('marked-cross blocked-field');
}

function mark(number) {
    socket.emit('turn', isUserTurn);
    socket.emit('saveSelectedQuadrat', {quadratNumber: number, user: isUserTurn});
}

socket.on('allUsers', (users) => {
    users.forEach((user) => {
       if (user.id === socket.id) {
           return $(me).text('You are: ' + user.sign);
       }
    });
});

socket.on('turn', (isTurn) => {
    isUserTurn = isTurn;
    $(turnInfo).text('Now it is s a ' + isTurn.toUpperCase() + ' turn.');
});

socket.on('colorQuadrat', (data) => {
    colorQuadrat(data.quadratNumber, data.user);
});

socket.on('winner', (user) => {
    $(turnInfo).text(user.toUpperCase() + ' won!');
    $(quadrats).addClass('blocked-field');
});