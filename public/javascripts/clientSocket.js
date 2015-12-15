var myName = null
		, nWins = 0
		, trendPending = null
		, isTurn = false;
$(function() {
});

var socket = io.connect("http://connectfour-smoney.rhcloud.com:8000");

function displayBoard(board, playerNumberOne, playerNumberTwo){
	var counter = 0;
	for(var row = 0; row < 6; row++){
		var $row = $("<div class='row'</div>");
		for(var col = 0; col < 7; col++){
			var $cell = $("<div class='space col-xs-1'</div>");
			var piece = board[row][col];
			console.log("piece is: "+piece);
			if(piece == 0){
				var a = "<div id='rectangle'";
				var b = "class='blueRect-";
				var c = ""+ counter + "'";
				var $blueSquare = $(a + b + c + "</div>");
				$blueSquare.appendTo($cell);
			}
			else if(piece == playerNumberOne){
				var a = "<div id='rectangle'";
				var b = "class='redRect-";
				var c = ""+ counter + "'";
				var $redSquare = $(a + b + c + "</div>");
				$redSquare.appendTo($cell);
			}
			else if(piece == playerNumberTwo){
				var a = "<div id='rectangle'";
				var b = "class='greenRect-";
				var c = ""+ counter + "'";
				var $greenSquare = $(a + b + c + "</div>");
				$greenSquare.appendTo($cell);
			}
			counter++;
			$cell.appendTo($row);
		}
		$row.appendTo($('#gameBoard'));
	}
}

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


socket.on('nPlayers', function (data) {
  console.log('nPlayers: '+data.number);
  $("#nPlayers").text(data.number);
});
	
socket.on('waiting', function(data) {
	console.log('waiting...');
	$('#waiting').slideDown();
});

socket.on('waitForTurn', function(data){
	console.log('waiting for turn');
	isTurn = false;
	$('#yourTurn').text("Please Wait for Turn");
	// display the move you made
	$('#gameBoard').html('');
	displayBoard(data.board, data.playerNumberOne, data.playerNumberTwo);
	$("#rowcol").hide();
});

socket.on('wonGame', function(data){
	$('#yourTurn').text('');
	$('#wonGame').text("You won the Game");
	$('#gameBoard').html('');
	displayBoard(data.board, data.playerNumberOne, data.playerNumberTwo);
});

socket.on('lostGame', function(data){
	$('#yourTurn').text('');
	$('#wonGame').text("You lost the Game");
	$('#gameBoard').html('');
	displayBoard(data.board, data.playerNumberOne, data.playerNumberTwo);
});


socket.on('move', function(data){
	$('#waiting').hide();
	$('#yourTurn').text('');
	isTurn = true;
	$('#gameBoard').html('');
	console.log("game is starting");
	var board = data.board;
	displayBoard(board, data.playerNumberOne, data.playerNumberTwo);
	$('.row #rectangle').on('click', function(){
		if(isTurn){
			console.log($(this));
			console.log($(this).attr('class'));
			var classA = $(this).attr('class').split("-");
			console.log('classA');
			//get the number in the class which is the 2nd index
			var number = classA[1];
			colClicked = number % 7;
			console.log("colClicked is: " + colClicked);
			socket.emit('moveMade', {'col':colClicked});
		}
		else{
			console.log("not your turn");
		}
	});
});

