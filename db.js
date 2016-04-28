var express = require('express');
var app     = express();
var path    = require('path');
var bodyParser = require('body-parser');
var request = require('request');
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/public')));
var json = require('./app/config.json');
var API_KEY   = json.API_KEY;
var INTERCEPT = json.INTERCEPT;
var XONE      = json.XONE;
var XTWO      = json.XTWO;
var XTHREE    = json.XTHREE;
var PORT      = json.PORT;

var urlTop = "https://maps.googleapis.com/maps/api/place/autocomplete/json?input="
var urlBtm = "&location=40.7128,-74.0059&radius=60500&key=" + API_KEY;
var users = 0;

app.post('/autocomplete', function(req, res) {
	var data = req.body.text;
	request(urlTop + data + urlBtm, function(err, response, body) {
		if(err) throw err;
		res.send(body);
	});
});

app.post('/distance', function(req, res) {
	var data = req.body;
	var distTop =  "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=";
	var distBtm = data.curr + "&destinations=" + data.dest + "&departure_time=" + Math.round(new Date().getTime()/1000.0) + "&traffic_model=best_guess";
	request(distTop + distBtm, function(err, response, body) {
		if(err) throw err;
		res.send(body);
	});
});

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.post('/fare', function(req, res) {
	if(req.body !== undefined){
		var data = req.body;
		if( data.time !== undefined &&
			data.dist !== undefined &&
			data.riders !== undefined){

			// transform string data into integer data
			var ltime;
			if(data.time.indexOf("hr") > -1){
				data.time = data.time.replace(" min", "");
				data.time = data.time.replace(" hr ", ":");
				var times = data.time.split(":");
				ltime = (parseInt(times[0]) * 60) 
					+ parseInt(times[1]);
			} else {
				data.time = data.time.replace(" min", "");
				ltime = parseInt(data.time);
			}
			var ldist = parseInt(data.dist.replace(" mi", ""));

			var calc = INTERCEPT + (XONE * ldist) 
					+ (XTWO * ltime) + (XTHREE * data.riders);
			res.send({'calc': calc.toFixed(2)});
		}
	} else 
		res.status(500).send('Invalid data!');
});

app.listen(PORT, function(){
	console.log('Server listening on port ' + PORT);
});