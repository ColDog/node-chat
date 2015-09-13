var express         = require('express');
var app             = express();
var http            = require('http').Server(app);
var io              = require('socket.io')(http);
var OpenTok         = require('opentok');
var bodyparser      = require('body-parser');
var opentok         = new OpenTok('45340532', '430580f9331483ee5d50e44b6f69547db32e0941');
var redis           = require('redis').createClient(process.env.REDIS_URL ? process.env.REDIS_URL : null);
var mongoose        = require('mongoose');
var bcrypt          = require('bcrypt');

// Mongoose
mongoose.connect('mongodb://localhost/chat');
var Schema = mongoose.Schema;
    // User Schema
var UserSchema = new Schema({
    name: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created_at: Date,
    updated_at: Date
});

UserSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});


UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var User = mongoose.model('User', UserSchema);


// redis
redis.on( "error",   function (err) { console.log("Error " + err) });
redis.on( 'connect', function() { console.log('connected') });

// configuration
app.set( 'port', (process.env.PORT || 3000) );
app.set( 'view engine', 'jade' );

// middleware
app.use( bodyparser.json() );
app.use( bodyparser.urlencoded({extended: true}) );
app.use( express.static(__dirname + '/public') );

// chat plugin functionality
require( './chat/chat' )( app, io, redis, opentok );
require( './users/users' )( app, User, io );

// start server
http.listen(app.get('port'), function(){
    console.log('listening on', app.get('port'));
});
