module.exports = function(app, User, io){
    app.get('/users', function(req, res){
        console.log('get users' );
        User.find({}, function(err, users) {
            if (err) throw err;
            console.log(users);
            res.sendFile(__dirname + '/views/users.html');
        });
    });
    app.get('/users/:username', function(req, res){
        User.find({ username: req.params.username }, function(err, user) {
            if (err) throw err;
            console.log(user);
            res.sendFile(__dirname + '/views/user.html');
        });
    });
    app.get('/users/:username/room/:room', function(req, res){
        User.find({ username: req.params.username }, function(err, user) {
            if (err) throw err;
            console.log(user);
            res.sendFile(__dirname + '/views/room.html');
        });
    });
    app.post('/users/new', function(req, res){
        console.log( req.body );
        var new_user = new User( req.body );
        new_user.save(function(err) {
            if (err) throw err;
            console.log('User saved successfully!');
            res.redirect( '/users/' + new_user.username )
        });
    });
    app.put('/users/:username', function(req, res){
        User.findOneAndUpdate({ username: req.params.username }, req.body, function(err, user) {
            if (err) throw err;
            console.log('user updated', user);
            res.sendFile(__dirname + '/views/user.html');
        });
    });
    app.delete('/users/:username', function(req, res){
        User.find({ username: req.params.username }, function(err, user) {
            if (err) throw err;
            console.log(user);
            res.redirect( '/users' )
        });
    });
    app.post('/users/login', function(req, res){
        User.find({ username: req.body.username }, function(err, user) {
            if (err) throw err;
            user.comparePassword(req.body.password, function(err, match) {
                    if (match) {
                        res.cookie('userId', user._id);
                        res.redirect('back')
                    } else {
                        res.redirect('back')
                    }
                }
            )
        });
    });

    io.on('connection', function(socket){
        console.log('socket connected');
        socket.on('checkUsername', function(username){
            User.find({ username: username }, function(err, user) {
                if (err) throw err;
                console.log( 'check username', user );
                socket.emit( 'checkName', user[0] ? true : false )
            });
        });
    });
};