/*-
 * Javascript Sample Application: Connection to Informix using Mongo
 */

//Topics
//1 Inserts
//1.1 Insert a single document into a collection
//1.2 Insert multiple documents into a collection
//2 Queries
//2.1 Find one document in a collection that matches a query condition  
//2.2 Find documents in a collection that match a query condition
//2.3 Find all documents in a collection
//3 Update documents in a collection
//4 Delete documents in a collection
//5 Drop a collection

var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var collectionName = "nodeMongo";

// To run locally, set the URL here
var URL = "";

var port = process.env.VCAP_APP_PORT || 3000;
var USE_SSL = false;

var commands = [];

// Since node uses asynchronous server calls, in order to get commands to complete sequentially they are passed into the next functions as callbacks
// Remove the call to the next function to break the chain of events

function doEverything(res) {
	url = URL;
	if (url == null || url == "") {
		url = parseVcap();
	}
	MongoClient.connect(url, function(err, db) {
		if (err){ 
			return console.error("error: ", err.message);
		}
		
		var collection = db.collection(collectionName);
		
		// Inserts a single document
		// Remove the insertMany callback to avoid calling the insertMany function
		function insert(err) {
			if (err){
				return console.error("error: ", err.message);
			}
			collection.insert({name : "test1", value : 1}, insertMany);
			commands.push("#1 Inserts");
			commands.push("\n#1.1 Insert a single document into a collection");
			commands.push("Inserted \n{name : \"test1\", value : 1}");
		}
		
		// Inserts multiple documents
		// Remove the findOne callback to avoid calling the findOne function
		function insertMany(err) {
			if (err){
				return console.error("error: ", err.message);
			}
			commands.push("#1.2 Insert documents into a collection");
			collection.insert([{name : "test1", value : 11}, {name : "test2", value : 2}, {name : "test3", value : 3}], findOne);
			commands.push("Inserted \n{name : \"test1\", value : 1}\n{name : \"test2\", value : 2}\n{name : \"test3\", value : 3}");
		}
		
		// Find one that matches a query condition
		// Remove the findAll() callback to avoid calling the findAll function
		function findOne(err) {
			if (err){
				return console.error("error: ", err.message);
			}
			collection.findOne({name: "test1"}, function (err, results) {
				commands.push("#2 Queries");
				commands.push("#2.1 Find one document in a collection that matches a query condition");
				commands.push("Query result for find one of name test1:");
				commands.push(JSON.stringify(results));
		
				findAll();
			});
		}
		
		
		// Remove the find() callback to avoid calling the find function
		function findAll(err) {
			if (err){
				return console.error("error: ", err.message);
			}
			var cursor = collection.find({name: "test1"});
			commands.push("#2.2 Find documents in a collection that matches query condition");
			commands.push("Query result for find all of name test1:");
			
			cursor.each(function(err, doc){
				if (doc === null) {
					find();
				} else {
					commands.push("Docs -> ", JSON.stringify(doc));
				}
			});
		}
		
		// Lists all documents in collection
		// Remove the update() callback to avoid calling the update function
		function find(err) {
			if (err){
				return console.error("error: ", err.message);
			}
			var cursor = collection.find();
			commands.push("#2.3 Find all documents in a collection");
			commands.push("Query result for find:");
			cursor.each(function(err, doc){
				if (doc === null) {
					update();
				} else {
					commands.push("Docs -> ", JSON.stringify(doc));
				}
		});
		}
		
		// Updates documents
		// Remove the remove callback to avoid calling the remove function
		function update(err){
			if (err){
				return console.error("error: ", err.message);
			}
			commands.push("#3 Update documents in a collection");
			collection.update({name : "test2"}, {$set : {value : 9}}, remove);
			commands.push("Updated test2 with value 9");
		}
		
		// Removes documents
		// Remove the drop callback to avoid calling the drop function
		function remove(err) {
			if (err){
				return console.error("error: ", err.message);
			}
			commands.push("#4 Delete documents in a collection");
			collection.remove({name : "test3"}, drop);
			commands.push("Removed test3 from collection");
		}
		
		// Drops the entire collection
		function drop(err) {
			if (err){
				return console.error("error: ", err.message);
			}
			commands.push("#5 Drop a collection");
			db.dropCollection(collectionName, printBrowser);
			commands.push("Collection dropped");
			db.close();
		}
		
		function printLog(){
			for (var i=0; i<commands.length;i++){
				console.log(commands[i]);
			}
			return;
		}
		
		function printBrowser(){
			app.set('view engine', 'ejs');
			res.render('index.ejs', {commands: commands});
			commands = [];
		}

		// Starts the chain of event by calling insert
		insert();
	
	});
}
function parseVcap() {
	var serviceName = process.env.SERVICE_NAME || 'timeseriesdatabase';
    var vcap_services = JSON.parse(process.env.VCAP_SERVICES);
    var credentials = vcap_services[serviceName][0].credentials;
	if (USE_SSL){
		url = credentials.mongodb_url_ssl;
	}
	else{
		url = credentials.mongodb_url;
	}
	return url;
}

app.get('/databasetest', function(req, res) {
	doEverything(res);
});

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

app.listen(port,  function() {
	console.log("server starting on 3000");
});
