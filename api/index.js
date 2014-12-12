module.exports = function(config, app){

	// not sure where to put this
	var bodyParser = require('body-parser');
	app.use( bodyParser.json() );       // to support JSON-encoded bodies
	app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	  extended: true
	}));


	var events = require('./controllers/events.js')(config, app);
	var pixels = require('./controllers/pixels.js')(config, app);

	app.get('/', function(req, res){
		res.send('woohoo!!!');
	});

	app.post('/pixels', function(req, res){
		var response = pixels.create(req);
		res.send(response);
	});

	app.put('/pixels', function(req, res){
		res.send('putting pixel');
	});

	app.delete('/pixels', function(req, res){
		res.send('deleting pixel');
	});
}