'use strict';

var app = require('express')();
var config = require('./config.json');

// Register App
app.use('/v1/', require('./api/index.js')(config));

// Start Listening
app.listen(config.port);
