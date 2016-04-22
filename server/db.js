var http = require('http');
var router = require('express');
var mongo = require('mongodb');
var server = http.createServer(router);
var mongoose = require('mongoose');

var app = router();

server.listen(porcess.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
	var addr = server.address();
	console.log("Server listening at", addr.address + ":" + addr.port);
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', function(){
	var userSchema = mongoose.Schema({
		name: String,
		passhash: String,
		email: String
	});

	var destSchema = mongoose.Schema({
		name: String,
		address: String,
		lat: Number,
		lng: Number
	});
	var User = mongoose.model('User', userSchema);
	var Dest = mongoose.model('Dest', destSchema);

	userSchema.methods.validatePassword = function(var input) {
		
	}
});