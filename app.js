var express         = require('express');
var app             = express();
var http            = require('http').Server(app);
var io              = require('socket.io')(http);
var OpenTok         = require('opentok');
var bodyparser      = require('body-parser');
var opentok         = new OpenTok('45340532', '430580f9331483ee5d50e44b6f69547db32e0941');
var redis           = require('redis').createClient(process.env.REDIS_URL ? process.env.REDIS_URL : null);

redis.on("error", function (err) { console.log("Error " + err) });
redis.on('connect', function() { console.log('connected') });

// configuration
app.set('port', (process.env.PORT || 3000));

// middleware
app.use( bodyparser.json() );
app.use(bodyparser.urlencoded({extended: true}));
app.use( express.static(__dirname + '/public') );


// routes
app.get('/', function(req, res){
    res.sendFile(__dirname + '/views' + '/index.html');
});

app.get('/room*', function(req, res){
    res.sendFile(__dirname + '/views' + '/room.html');
});

app.post('/new_room', function(req, res) {
    var name = req.body.name;
    opentok.createSession(function(err, session) {
        console.log('setting key:', name, session.sessionId);
        redis.set('key:' + name, session.sessionId);
        res.redirect('/room/' + name)
    });
});


// sockets
io.on('connection', function(socket){
    console.log('socket connected');
    socket.on('chat message', function(msg){
        io.to( msg.room ).emit('chat message', msg);
        redis.rpush(['msg:' + msg.room, msg.name + ':' + msg.message], function(err, reply) {
            console.log('store list', reply);
        });
        console.log( 'Chat:', msg )
    });
    socket.on('joinRoom', function(room){
        socket.join(room);
        redis.get('key:' + room, function(err, sessionId) {
            console.log('Join Room', room, sessionId);
            if (sessionId) {
                var token = opentok.generateToken( sessionId, {role: 'publisher'} );
                socket.emit( 'joinRoom', { token: token, sessionId: sessionId } );
            } else {
                socket.emit( 'alert', 'Invalid session ID' )
            }
        });
        redis.lrange('msg:' + room, 0, -1, function(err, list) {
            console.log( 'room list', list );
            socket.emit( 'list', list )
        });
    });
    socket.on('checkName', function(room){
        redis.get('key:' + room, function(err, reply) {
            var result = true;
            if (reply) { result = false }
            socket.emit( 'checkName', result )
        })
    });
});


// start server
http.listen(app.get('port'), function(){
    console.log('listening on', app.get('port'));
});
