module.exports = function(app, io, redis, opentok, User){

    // routes
    app.get('/', function(req, res){
        res.sendFile(__dirname + '/views/index.html');
    });

    app.get('/room*', function(req, res){
        res.sendFile(__dirname + '/views/room.html');
    });

    app.post('/new_room', function(req, res) {
        var name = req.body.name;
        opentok.createSession(function(err, session) {
            console.log('setting key:', name, session.sessionId);
            var username = req.body.username;
            if (username) {
                User.findOne({ username: username }, function(err, user) {
                    console.log( 'find user', user );
                    if (err) throw err;
                    if (user) {
                        redis.set('key:' + username + ':' + name, session.sessionId);
                        res.redirect('users/' + username + '/room/' + name)
                    } else {
                        redis.set('key:' + name, session.sessionId);
                        res.redirect('/room/' + name)
                    }
                });
            } else {
                redis.set('key:' + name, session.sessionId);
                res.redirect('/room/' + name)
            }
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

};