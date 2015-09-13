var socket = io();
var room = param('room');
var user = param('users');


$('form').submit(function( event ){
    event.preventDefault();
    socket.emit('chat message', {
        name:    $('#name').val(),
        message: $('#message').val(),
        room:    user + ':' + room
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
        $('#messages').append('<li>' + list[i] + '</li>');
    }
});

$(document).ready(function(){
    socket.emit( 'joinRoom', user + ':' + room );
    $("#title").text( room + ' hosted by ' + user )
});
