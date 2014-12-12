var express = require('express');
var app = express();
var fs = require('fs');
var config = fs.existsSync('./config.json');

// Register App
var pixelService = require('./api/index.js')(config, app);


// Load data into memory
	// fetch pixels from rdb, store in memory

// Start RethinkDB sync monitor

// Register app
// 
//require('./api/pixels.js')(config, app);

app.listen(3000);


	/*
		// create pixel
		var pixel = {
			name: "home page, aol",
			decription: "home page pixel for aol",
			context: "home:visit",
			triggers: [
				src: "aol"
			],
			pixel: '<img src="">'
		}
		pixel.create(pixel);
	
		// pulls from memory
		pixel.fetch({
			context: "home:visit",
			meta: {
				src: 'aol'
			}
		})
		
		// response
		({
			

		})



	*/