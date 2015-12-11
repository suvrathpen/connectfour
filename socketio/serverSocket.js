var mongoModel = require('../models/mongoModel.js');

var QUORUM = 2; //need two players to start the game
var usernameList = []
exports.init = function(io) {
	var currentPlayers = 0; // keep track of the number of players
	var playerNumber = 0;


  // When a new connection is initiated
	io.sockets.on('connection', function (socket) {
		var thisPlayer = currentPlayers;
		console.log("Received connection event from "+thisPlayer);
		++currentPlayers;
		++playerNumber;
		console.log("Emitting nPlayers to: "+currentPlayers);
		socket.emit('nPlayers', { number: currentPlayers});
		socket.broadcast.emit('nPlayers', { number: currentPlayers});
		// if (currentPlayers <= 1) {
  // 		console.log("Emitting waiting to: "+playerNumber);
		// 	socket.emit('waiting');
		// }
		// if(currentPlayers == 2){
		// 	socket.emit('ready');
		//   socket.broadcast.emit('ready');
		// }

		socket.on('name', function(data){
			usernameList.push(data.username);
			if (usernameList.length <= 1) {
  		console.log("Emitting waiting to: "+playerNumber);
			socket.emit('waiting');
			}
			if(usernameList.length == 2){
			  console.log("emitted move");
				mongoModel.initializeBoard();
				var board = mongoModel.returnBoard();
				console.log(board);
				// console.log("Emitting board to: "+thisPlayer);
				// var playerTurn = mongoModel.returnCurrentPlayer();
				// mongoModel.togglePlayer();
				// console.log("playerNumber is: " + thisPlayer);
				// console.log("playerTurn is: " + playerTurn);
				socket.emit('waitForTurn');
				socket.broadcast.emit('move', {'board':board});
				// socket.emit('move', {'board': board});
				// socket.broadcast.emit('waitForTurn');
			}

		});

		// else{
		// 	socket.emit('ready');
		// 	socket.broadcast.emit('ready');
		// }
		// else {
		// 		mongoModel.initializeBoard();
		// 		var board = mongoModel.board;
		// 		console.log("Emitting board to: "+thisPlayer);
		// 		socket.emit('start', {board: board});
		// 		console.log("Broadcast emitting board");
		// 		socket.broadcast.emit('start', {board: board});
		// }

		// socket.on('start', function(data) {
		// 	// usernameList.push(data.username);	
		// 	// console.log("usernameList is: " + usernameList);
		// 	console.log("emitted move");
		// 	mongoModel.initializeBoard();
		// 	var board = mongoModel.returnBoard();
		// 	console.log(board);
		// 	// console.log("Emitting board to: "+thisPlayer);
		// 	// var playerTurn = mongoModel.returnCurrentPlayer();
		// 	mongoModel.togglePlayer();
		// 	// console.log("playerNumber is: " + thisPlayer);
		// 	// console.log("playerTurn is: " + playerTurn);
		// 	socket.broadcast.emit('waitForTurn');
		// 	socket.emit('move', {'board': board});
		// 	// console.log("Broadcast emitting board");
		// 	// socket.broadcast.emit('start', {board: board});
		// });

		socket.on('moveMade', function(data){
			console.log("move was made");
			console.log("row is: " + data.row);
			console.log("col is: " + data.col);
			mongoModel.changeBoard(data.row, data.col);
			var board = mongoModel.returnBoard();
			// var playerTurn = mongoModel.returnCurrentPlayer();
				// mongoModel.togglePlayer();
			socket.emit('waitForTurn');
			console.log("board in moveMade is:" + board);
			socket.broadcast.emit('move', {'board': board});
		});
		/*
		 * Upon this connection disconnecting (sending a disconnect event)
		 * decrement the number of players and emit an event to all other
		 * sockets.  Notice it would be nonsensical to emit the event back to the
		 * disconnected socket.
		 */
		socket.on('disconnect', function () {
			--currentPlayers;
			socket.broadcast.emit('players', { number: currentPlayers});
		});
	});
}
