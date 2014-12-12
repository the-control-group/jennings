var r = require('rethinkdb');


module.exports = function(config, app){

	return {

		// push a 
		create: function(req, res, next){

			console.log(r.now());

			var response = {
				value: "I love this!"
			};

			return response;
		}
	}
}