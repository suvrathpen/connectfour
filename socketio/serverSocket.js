var mongoModel = require('../models/mongoModel.js');

var QUORUM = 2; //need two players to start the game
var usernameList = [];
var socketList = [];
exports.init = function(io) {
	var currentPlayers = 0; // keep track of the number of players
	var playerNumber = 0;


  // When a new connection is initiated
	io.sockets.on('connection', function (socket) {
		var thisPlayer = currentPlayers;
		console.log("Received connection event from "+thisPlayer);
		++currentPlayers;
		++playerNumber;
		console.log("playerNumber is: "+ playerNumber);
		socketList.push({"id": socket.id, "playerNumber": playerNumber, "username": ""});
		console.log("Emitting nPlayers to: "+currentPlayers);
		socket.emit('nPlayers', { number: currentPlayers});
		socket.broadcast.emit('nPlayers', { number: currentPlayers});

		socket.on('name', function(data){
			usernameList.push(data.username);
			for(var i = 0; i < socketList.length; i++){
				if(socketList[i].id == socket.id){
					socketList[i].username = data.username;
				}
			}
			console.log("pushing username: "+ data.username);
			if (usernameList.length <= 1) {
  		console.log("Emitting waiting to: "+playerNumber);
			socket.emit('waiting');
			}
			if(usernameList.length == 2){
			  console.log("emitted move");
				mongoModel.initializeBoard();
				var board = mongoModel.returnBoard();
				console.log(board);
				console.log('usernameList is: '+ usernameList);
				console.log("socketList is: " + socketList);
				socket.emit('waitForTurn');
				playerNumberOne = socketList[0].playerNumber;
				playerNumberTwo = socketList[1].playerNumber;
				console.log("playerNumberOne: "+ playerNumberOne);
				console.log("playerNumberTwo: "+ playerNumberTwo)
				socket.broadcast.emit('move', {'board':board, 
														'playerNumberOne': playerNumberOne, 'playerNumberTwo':playerNumberTwo});
			}

		});

		socket.on('moveMade', function(data){
			console.log("move was made");
			console.log("col is: " + data.col);
			var playerNumber;
			var currUsername;
			for(var i = 0; i < socketList.length; i++){
				if(socketList[i].id == socket.id){
					console.log("inside for loop setted playerNumber");
					// set the current playerNumber and currUsername
					playerNumber = socketList[i].playerNumber;
					currUsername = socketList[i].username;
				}
			}
			console.log("playerNumber is: " + playerNumber);
			// check if its a valid move here
			console.log("calling changeBoard with player " + playerNumber);
			mongoModel.changeBoard(data.col, playerNumber);
			var board = mongoModel.returnBoard();
			var didWin = mongoModel.checkForWin(playerNumber);
			console.log("playerNumber "+ playerNumber + " did win the game "+didWin);
			if(didWin){
				console.log("game is over");
				socket.emit('wonGame', {'board': board, 'playerNumberOne': playerNumberOne, 'playerNumberTwo':playerNumberTwo});
				console.log("currUsername is: "+ currUsername);
				mongoModel.update('connectfour', {'username': currUsername}, 
													{'$inc': {'wins': 1}},
		                  function(status) {
		                  });
				socket.broadcast.emit('lostGame', {'board': board, 'playerNumberOne': playerNumberOne, 'playerNumberTwo':playerNumberTwo});
			}
			// wait for Turn but still see the move that you made
			else{
				// game still in progress
				socket.emit('waitForTurn', {'board':board, 'playerNumberOne': playerNumberOne, 'playerNumberTwo':playerNumberTwo});
				console.log("board in moveMade is:" + board);
				playerNumberOne = socketList[0].playerNumber;
				playerNumberTwo = socketList[1].playerNumber;
				socket.broadcast.emit('move', {'board': board, 'playerNumberOne': playerNumberOne, 'playerNumberTwo':playerNumberTwo});
			}
		});
		/*
		 * Upon this connection disconnecting (sending a disconnect event)
		 * decrement the number of players and emit an event to all other
		 * sockets.  Notice it would be nonsensical to emit the event back to the
		 * disconnected socket.
		 */
		socket.on('disconnect', function () {
			--currentPlayers;
			socketList = [];
			usernameList = [];
			socket.broadcast.emit('players', { number: currentPlayers});
		});
	});
}
