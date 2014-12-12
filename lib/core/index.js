	/*************
	* Resources *
	*************/
	var resources = {}
	resources.rethinkdb = r.connect(config.rethinkdb);
	resources.arraydb = require('./arraydb/')