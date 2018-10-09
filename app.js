// Dependency
const express  			= require('express');
const path 		 			= require('path');
const mongoose 			= require('mongoose');
const bodyParser 		= require('body-parser');
const app      			= express();
const server   			= require('http').createServer(app);
const io       			= require('socket.io')(server);

const CONNECTION_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/new-vote";

// menangani CORS
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*"); res.header('Access-Control-Allow-Methods', 'DELETE, PUT'); res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	if ('OPTIONS' == req.method) {
		res.sendStatus(200);
	} else {
		next();
	}
});

// Konfigurasi Midleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req,res,next){
	req.io = io;
	next();
});

// Beri tau express dimana file static berada
app.use(express.static(__dirname + '/public'));

// Connect to DB
mongoose.connect(CONNECTION_URI, { useNewUrlParser: true })
	.then(() =>  console.log('connection succesful'))
	.catch((err) => console.error(err));

// Buat skema database
let schema = mongoose.Schema({name: String});
let Vote = mongoose.model('Vote', schema);

/*
Routes
*/

// Render homepage.
app.get('/', function(req, res) {
	res.sendfile('index.html');
});


// Route for voting
app.post('/vote', function(req, res) {
	var field = [{name: req.body.name}];

	var newVote = new Vote(field[0]);

	newVote.save(function(err, data) {
		console.log('Saved');
	});

	Vote.aggregate(
		[{ "$group": {
			"_id": "$name",
			"total": { "$sum": 1 }
		}}],

		function(err, results) {
			if (err) throw err;
			console.log(results);
			req.io.sockets.emit('vote', results);
		}
	);

	res.send({'message': 'Successfully added.'});
});

app.get('/data', function(req, res) {
	Vote.find().exec(function(err, msgs) {
		res.json(msgs);
	});
});

/*
Socket.io Setting
*/

io.on('connection', function (socket) {

	Vote.aggregate(

		[{ "$group": {
			"_id": "$name",
			"total": { "$sum": 1 }
		}}],

		function(err, results) {
			if (err) throw err;

			socket.emit('vote', results);
		}
	);
});


// export
module.exports = app;

// Start
server.listen(process.env.PORT || 5432);
console.log('Open http://localhost:5432');