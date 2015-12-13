var myName = null
		, nWins = 0
		, trendPending = null;
$(function() {});

var socket = io.connect();

socket.on('connect', function(data) {
	$('#playerName')
		.slideDown()
		/*
		 * Save user's name handler
		 */
		.submit(function() {
			console.log("entered submit");
			myName = $('#playerName [name=playerName]').val();
			$('#myName').text(myName+"'s");
			$('#playerName').slideUp();
			socket.emit('name', {'username': myName});
			return false;
		});
});

// socket.on('ready', function () {
//   $('#waiting').hide();
//   socket.emit('start');
// });

socket.on('nPlayers', function (data) {
  console.log('nPlayers: '+data.number);
  $("#nPlayers").text(data.number);
});
	
socket.on('waiting', function(data) {
	console.log('waiting...');
	$('#waiting').slideDown();
});

socket.on('waitForTurn', function(){
	console.log('waiting for turn');
	$('#yourTurn').text("Please Wait for Turn");
	$("#rowcol").hide();
});

socket.on('move', function(data){
	$('#waiting').hide();
	$('#yourTurn').text('');
	// $('#yourTurn').text("");
	$('#gameBoard').html('');
	console.log("game is starting");
	// socket.emit('move', {'board': board, 'player': thisPlayer, 'playerTurn': playerTurn});
	var board = data.board;
	// $('#gameBoard').append('<p> It works</p>');
	// only display if its your turn
	var counter = 0;
	for(var row = 0; row < 6; row++){
		var $row = $("<div class='row'</div>");
		for(var col = 0; col < 7; col++){
			var $cell = $("<div class='col-md-1'</div>");
			var piece = board[row][col];
			console.log("piece is: "+piece);
			if(piece == 0){
				var a = "<div id='rectangle'";
				var b = "class='blueRect-";
				var c = ""+ counter + "'";
				var $blueSquare = $(a + b + c + "</div>");
				$blueSquare.appendTo($cell);
			}
			else if(piece == data.playerNumberOne){
				var a = "<div id='rectangle'";
				var b = "class='redRect-";
				var c = ""+ counter + "'";
				var $redSquare = $(a + b + c + "</div>");
				$redSquare.appendTo($cell);
			}
			else if(piece == data.playerNumberTwo){
				var a = "<div id='rectangle'";
				var b = "class='blueRect-";
				var c = ""+ counter + "'";
				var $greenSquare = $(a + b + c + "</div>");
				$greenSquare.appendTo($cell);
			}
			// if(piece == 1){
			// 	var $redSquare = $("<div id='rectangle' class='redRect'></div>");
			// 	$redSquare.appendTo($cell);
			// }
			// if(piece == 2){
			// 	var $greenSquare = $("<div id='rectangle' class='greenRect'></div>");
			// 	$greenSquare.appendTo($cell);
			// }
			// else{
			// 	console.log("piece is: " + piece);
			// 	var $redSquare = $("<div id='rectangle' class='redRect'></div>");
			// 	$redSquare.appendTo($cell);
			// }
			counter++;
			$cell.appendTo($row);
		}
		$row.appendTo($('#gameBoard'));
	}
	// if(data.playerNumber == data.playerTurn){
	// 	$('#turn').text("It is your turn player " + data.playerNumber);
	// }
	// else{
	// 	$('#turn').text("It is not your turn player " + data.playerNumber);
	// }
	// add interactivity to click a column and make a move here
	$("#rowcol").show();
	$("#rowcol").submit(function() {
			console.log("entered submit");
			row = $('#enterRow').val();
			col = $('#enterCol').val();
			console.log("playerNumber is "+ data.playerNumber);
			socket.emit('moveMade', {'row': row, 'col':col});
			return false;
		});
	$('.row #rectangle').on('click', function(){
		console.log($(this));
		console.log($(this).attr('class'));
		var classA = $(this).attr('class').split("-");
		//get the number in the class which is the 2nd index
		var number = classA[1];
		colClicked = number % 7;
		console.log("colClicked is: " + colClicked);
	});
});


// var render = function() {
//     $board.html('');
//     for (var row = 0; row < height; row++) {
//       var $row = $("<div class='row'></div>");
//       for (var col = 0; col < width; col++) {
//         var $cell = $("<div class='cell'></div>")
//         $cell.attr('row', row);
//         $cell.attr('col', col);

//         var piece = board[row][col];
//         if (piece) {
//           var $piece = $("<div class='piece'><div>")
//           $piece.addClass(piece === 1 ? "one" : "two");
//           $piece.appendTo($cell);
//         }
//         $cell.appendTo($row);
//       }
//       $row.appendTo($board);
//     }
//   };


// function createBoard(){
//   $.ajax({
//     url: '/home',
//     type: 'PUT',
//     success: function(result) {
//       // Do something with the result
//       console.log("createBoard result is:" + result);
//     } 
//   });
// }




// socket.on('players', function (data) {
//   console.log(data);
//   $("#numPlayers").text(data.number);
// 	});
// socket.on('welcome', function (data){
// 	console.log(data.message);
// 	$("#welcome").text(data.message);
// });