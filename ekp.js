/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);

/*
app.post('/', routes.parser);
app.post('/', function(request, response) {
		
	console.log(request.body.query);

});
*/
app.use(express.bodyParser());

// Return some values - database query
app.post('/test', function(req, res)	{

	// The phrase
console.log('phrase should be: ' + req.body.query);
	var userPhrase = makeSQLSafe(req.body.query);

	// Have we seen the phrase before?
	if (checkForPhrase(userPhrase))	{
		// Yes? lookup the cached phrases
	} else	{
		// No? Get some new phrases
		var a = getNewPhrases(userPhrase);

		// Then store them in the database
		savePhrases(userPhrase, a);

		// and return them to the client
		res.send(JSON.stringify(a));

	}

	// Store new results
	function savePhrases(userPhrase, a)	{
		dbConnect();
		
		// Row counter for primary key
		var nRows = 0;
		client.query(
			" SELECT COUNT(*) AS NumRows " +
			" FROM   PHRASE_RESULTS ",
			function selectCB(err, results, fields)	{
				if (err)	{ throw err; }
				nRows = parseFloat(results[0].NumRows);
			}
		);

		for (var i = 0; i < a.length; i++)	{
			savePhrase(userPhrase, a[i], (parseFloat(nRows) + parseFloat(i)));
		}
		client.end();
	}
	
	// Store a result
	function savePhrase(userPhrase, resultPhrase, idx)	{
		client.query(
			" INSERT INTO PHRASE_RESULTS " +
			" (PHRASE_KEY, PHRASE, PHRASE_RESULT, " +
			"  PHRASE_LIKES) VALUES " +
			" (" + idx + ", '" + userPhrase + "', '" + resultPhrase + "', " +
			"  " + 0 + ")",
			function selectCB(err, results, fields)	{
				if (err)	{ throw err; }
			}
		);
	}

	// Get a new set of phrases.
	function getNewPhrases(phrase)	{
		var a = [];
		a.push(makeSQLSafe("The senator found his shoes"));
		a.push(makeSQLSafe("Foundation jeopardy reconnisance"));
		a.push(makeSQLSafe("Dump truck philosopher"));
		a.push(makeSQLSafe("Crouching sabre"));
		a.push(makeSQLSafe("This time we found a boulder"));
		a.push(makeSQLSafe("Mother of god, it's expando-brain"));
		return a;
	}

	function dbConnect() {
		var sys	= require('util');
		var Client = require('mysql').Client;
		client = new Client();
		client.port = '/var/run/mysqld/mysqld.sock';
		client.user = 'MisHearMe';
		client.password = 'MisHearMe';
		client.query('USE MisHearMe');
	}

	// Look for the phrase in our cache table
	function checkForPhrase(phrase)	{
		var rtn;
		dbConnect();

		client.query(
			" SELECT COUNT(*) AS NumRows " +
			" FROM   PHRASE_RESULTS " +
			" WHERE  PHRASE = '" + phrase + "' ",
			function selectCB(err, results, fields)	{
				if (err)	{ throw err; }
				if (parseFloat(results[0].NumRows) > 0)	{ rtn = true; }
				else	{ rtn = false; }
			}
		);
		return rtn;
	}

	function dbCheck()	{
		dbConnect();

		client.query(
			" SELECT TEST_NAME FROM TEST_TBL ",
			function selectCB(err, results, fields)	{
				if (err)	{ throw err; }
				console.log(results);
				var a = [];
				for (var i in results)	{
					a.push(results[i].TEST_NAME);
				}
				res.send(JSON.stringify(a));
			}
		);
		client.end();
	}

	function makeSQLSafe(s)	{
console.log(s, ' ' + typeof(s));
		return s.replace(/'/g, "''");
	}
});

app.get('/test', routes.test);

// use either the process port for heroku or 3000 dev server
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
