'use strict';

var Q = require('q');
var r = require('rethinkdb');
var util = require('util');

var EventEmitter = require('events').EventEmitter;

function ArrDB(config){
	if (!(this instanceof ArrDB))
	  return new ArrDB(config);

	this.config = config;

	this.active     = false;  // are we syncing from the database?
	this.connecting = null;   // connecting promise
	this.conn       = null;   // the rethinkdb connection used for the changes feed
	this.feed       = null;   // the rethindkb changes feed
	this.retry      = null;   // retry interval for connection retry


	// DB (Array)
	// ----------
	// This is the in-memory array where we cache 
	// the entire database

	this.db = [];
}

util.inherits(ArrDB, EventEmitter);


// Apply Change
// ------------
// This applies a given change to the array DB
// and any indices

ArrDB.prototype.applyChange = function applyChange(change) {
	var self = this;

	// insert a new record
	if (change.old_val === null) {
		self.db.push(change.new_val);
		self.emit('sync', change);
		return;
	}

	// find an existing record
	for (var i = 0, len = self.db.length; i < len; i++) {
		if (self.db[i].id === change.old_val.id) {

			// delete the record
			if(change.new_val === null) {
				self.db.splice(i, 1);
				break;
			}

			// replace an existing record
			self.db[i] = change.new_val;
			break;
		}
	}

	self.emit('sync', change);
};

// Reset DB
// --------
// This removes every record from the array DB
// and replaces them with new data.
//
// Note that this function modifies its input
// for the sake of increased performance

ArrDB.prototype.resetDb = function resetDb(data) {
	var self = this;

	// prepare data to be used in `apply`
	data.unshift(self.db, self.db.length);

	// remove and replace records
	Array.prototype.splice.apply(self.db, data);
};


// Query
// -----

ArrDB.prototype.query = function query(){
	var self = this;

	return Q.all([

		// get entire database
		r.db(self.config.rethinkdb.db).table(self.config.table).run(self.conn).then(function(cursor){
			return cursor.toArray().then(self.resetDb.bind(self));
		}),

		// begin changes stream
		r.db(self.config.rethinkdb.db).table(self.config.table).changes().run(self.conn)

		// close old feed
		.then(function(feed){
			return self.feed ? self.feed.close().then(feed) : feed;
		})

		// open new feed
		.then(function(feed){
			self.feed = feed;
			self.feed.each(function(err, change){
				if(err) return self.error(err);
				self.applyChange(change);
			});
		})
	]);
};

// Connect
// -------

ArrDB.prototype.connect = function connect() {
	var self = this;
	if(!self.active) return new Q();
	if(self.connecting) return self.connecting;

	// set the current connection loop
	return (
		self.connecting = (self.conn ?

			// reuse existing connection
			self.conn.reconnect()

			// create a new connection
			: r.connect(self.config.rethinkdb).then(function(c) {
				self.conn = c;
				self.conn.on('error', self.error.bind(self));
			})
		)

		// retry
		.catch(function(error){
			return Q.delay(self.config.arrdb.retry).then(self.connect.bind(self));
		})

		// begin syncing
		.then(self.query.bind(self))

		// we are no longer trying to connect
		.then(function(){
			self.connecting = null;
		})
	);
};

// Error
// -----
// Supress errors if not active.

ArrDB.prototype.error = function error(e) {
	var self = this;
	if(!self.active) return new Q();

	self.emit('error', e);
	return self.restart().then(function(){ self.emit('reconnect'); });
};


// Start
// -----

ArrDB.prototype.start = function start(){
	var self = this;

	// already active
	if(self.active) return new Q();

	self.active = true;

	return self.connect().then(function(){ return self.emit('start'); });
};


// Stop
// ----

ArrDB.prototype.stop = function stop(){
	var self = this;

	self.active = false;

	// prevent any queued retries
	return new Q(function(){
		clearInterval(self.retry);
		self.retry = null;
	})

	// close feed
	.then(function(){
		if(self.feed) return self.feed.close().then(function(){
			self.feed = null;
		});
	})

	// close connection
	.then(function(){
		if(self.conn) return self.conn.close().then(function(){
			self.conn = null;
		});
	})

	// clear the array self.db
	.then(function(){
		self.db.length = 0;
		self.emit('stop');
	});
};

// Restart
// -------

ArrDB.prototype.restart = function restart(){
	var self = this;
	return self.stop().then(self.start.bind(self));
};


module.exports = ArrDB;