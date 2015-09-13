module.exports = function(app, User){
    app.get('/users', function(req, res){
        User.find({}, function(err, users) {
            if (err) throw err;
            console.log(users);
            res.render('users', {users: users})
        });
    });
    app.get('/users/:username', function(req, res){
        User.find({ username: req.params.username }, function(err, user) {
            if (err) throw err;
            console.log(user);
            res.render('user', {user: user})
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
            res.render('user', {user: user})
        });
    });
    app.delete('/users/:username', function(req, res){
        User.find({ username: req.params.username }, function(err, user) {
            if (err) throw err;
            console.log(user);
            res.redirect( '/users' )
        });
    });
};