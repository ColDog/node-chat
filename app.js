var express         = require('express');
var app             = express();
var http            = require('http').Server(app);
var io              = require('socket.io')(http);
var OpenTok         = require('opentok');
var bodyparser      = require('body-parser');
var opentok         = new OpenTok('45340532', '430580f9331483ee5d50e44b6f69547db32e0941');
var redis           = require('redis').createClient(process.env.REDIS_URL ? process.env.REDIS_URL : null);
var mongoose        = require('mongoose');
var User            = require('./users/user_model');

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

// start server
http.listen(app.get('port'), function(){
    console.log('listening on', app.get('port'));
});
