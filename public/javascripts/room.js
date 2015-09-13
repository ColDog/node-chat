var socket = io();
var room = roomName();

$('form').submit(function( event ){
    event.preventDefault();
    socket.emit('chat message', {
        name:    $('#name').val(),
        message: $('#message').val(),
        room: room
    });
    $('#message').val('');
    return false;
});

socket.on('chat message', function(msg){
    $('#messages').append('<li>' + msg.name + ': ' + msg.message + '</li>');
});

socket.on('joinRoom', function(msg){
    connect( msg.sessionId, msg.token, 'video', 'publisher' )
});

socket.on('list', function(list){
    for (var i = 0; i < list.length; i++) {
        $('#messages').append('<li>' + list[i].split(':')[0] + ': ' + list[i].split(':')[1] + '</li>');
    }
});

$(document).ready(function(){
    socket.emit( 'joinRoom', room );
    $("#title").text( room )
});

function roomName() {
    var arr = window.location.pathname.split('/');
    var str = arr[arr.length - 1];
    if (str.indexOf('?') >= 0) {
        return str.substring(0, str.indexOf('?'))
    } else {
        return str
    }
}