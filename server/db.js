var express = require('express');
var app = express();
var path = require('path');
app.use(express.static(path.resolve(__dirname, '../')));
var API_KEY = require('./config.json').API_KEY;

var urlTop = "https://maps.googleapis.com/maps/api/place/autocomplete/json?input="
var urlBtm = "&location=40.7128,-74.0059&radius=605000000"
var users = 0;

app.post('/autocomplete', function(req, res) {
// 	var data = req.body.text;
// 	console.log(data);
// });

// app.get('/', function(req, res) {
// 	console.log('User connected!');
// 	users++;
// 	console.log('User count: ' + users);
});

app.listen(3000, function(){
	console.log('Server listening on port 3000');
});