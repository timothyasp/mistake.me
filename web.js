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
app.use(express.methodOverride());
app.post('/test', function(req, res)	{
	console.log(req.body.query);
	res.send('yes you can');
	//res.redirect('back');
});
app.get('/test', routes.test);

// use either the process port for heroku or 3000 dev server
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
