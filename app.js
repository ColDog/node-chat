var app             = require('express')();
var http            = require('http').Server(app);
var io              = require('socket.io')(http);
var OpenTok         = require('opentok');
var bodyparser      = require('body-parser');
var opentok         = new OpenTok('45340532', '430580f9331483ee5d50e44b6f69547db32e0941');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/views' + '/index.html');
});

app.get('/room', function(req, res){
    res.sendFile(__dirname + '/views' + '/room.html');
});

app.post('/new_room', function(req, res) {
    opentok.createSession(function(err, session) {
        res.redirect('/room?session=' + session.sessionId)
    });
});

io.on('connection', function(socket){
    console.log('socket connected');
    socket.on('chat message', function(msg){
        io.to( msg.session ).emit('chat message', msg);
        console.log( 'Chat:', msg )
    });
    socket.on('joinRoom', function(msg){
        socket.join(msg);
        var token = opentok.generateToken(msg, {role: 'publisher'});
        socket.emit('sendToken', token);
        console.log( 'Join:', msg )
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
