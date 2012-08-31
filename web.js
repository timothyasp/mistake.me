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

var sys	= require('util');
var Client = require('mysql').Client;
var client = new Client();
client.port = '/var/run/mysqld/mysqld.sock';
client.user = 'MisHearMe';
client.password = 'MisHearMe';
client.query('USE MisHearMe');

app.use(express.bodyParser());

// Store new results
var SaveAll = function saveAllPhrases(userPhrase, a)	{
	for (var i = 0; i < a.length; i++) {
		SavePhrase(userPhrase, a[i]);
	}
	client.end();
}

// Store a result
var SavePhrase = function savePhrase(userPhrase, resultPhrase)	{
	client.query(
		" INSERT INTO PHRASE_RESULTS " +
		" (PHRASE, PHRASE_RESULT, " +
		"  PHRASE_LIKES) VALUES " +
		" ('" + userPhrase + "', '" + resultPhrase + "', " +
		"  " + 0 + ")",
		function selectCB(err, results, fields)	{
			if (err)	{ throw err; }
		}
	);
}

var MakeObject = function makeRtnObject(idx, resultPhrase, count)	{
	return {
		idx: idx,
		result: resultPhrase,
		count: count
	};
}

// Get a new set of phrases.
var GetPhrases = function getNewPhrases(phrase)	{
	var a = [];
	a.push(MakeSQLSafe("The senator found his shoes"));
	a.push(MakeSQLSafe("Foundation jeopardy reconnisance"));
	a.push(MakeSQLSafe("Dump truck philosopher"));
	a.push(MakeSQLSafe("Crouching sabre"));
	a.push(MakeSQLSafe("This time we found a boulder"));
	a.push(MakeSQLSafe("Mother of god, it's expando-brain"));

	var aRes = [];
	for (var i = 0; i < a.length; i++)	{
		aRes.push(MakeObject(i, a[i], 0));
	}
	return aRes;
}

// Look for the phrase in our cache table
var IfExists = function checkForPhrase(res, phrase, next)	{
	console.log('checking for phrase');

	client.query(
		" SELECT COUNT(*) AS NumRows " +
		" FROM   PHRASE_RESULTS " +
		" WHERE  PHRASE = '" + phrase + "' ",
		function selectCB(err, results, fields)	{
			if (err)	{ throw err; }

			console.log('existing rowcount: ' + results[0].NumRows);

			if (parseFloat(results[0].NumRows) > 0)	{
				console.log('setting rtn to true');
				next(res, phrase, true);
			} else	{
				console.log('setting rtn to false');
				next(res, phrase, false);
			}
			client.end();
		}
	);
}

function HandlePhrase(res, phrase, bSeen)
{
	console.log('handling phrase');
	if (bSeen)	{
		// Yes? lookup the cached phrases
		console.log('found existing phrases');
	} else	{
		console.log('did not find existing phrases');

		// No? Get some new phrases
		var a = GetPhrases(phrase);

		// Then store them in the database
		SaveAll(phrase, a);

		// and return them to the client
		res.send(JSON.stringify(a));
	}
}

var MakeSQLSafe = function makeSQLSafe(s)	{
	console.log(s, ' ' + typeof(s));
	return s.replace(/'/g, "''");
}

// Routes
app.get('/', routes.index);

// Return some values - database query
app.post('/phrase', function(req, res)	{
	console.log(req.body);

	var userPhrase = MakeSQLSafe(req.body.value);

	// Have we seen the phrase before?
	IfExists(res, userPhrase, HandlePhrase);
	
});

// use either the process port for heroku or 3000 dev server
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
