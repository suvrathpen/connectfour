/*
 * This model uses the Node.js MongoDB Driver.
 * To install:  npm install mongodb --save
 */
var mongoClient = require('mongodb').MongoClient;

/*
 * This connection_string is for mongodb running locally.
 * Change nameOfMyDb to reflect the name you want for your database
 */
var connection_string = 'localhost:27017/nameOfMyDb';
/*
 * If OPENSHIFT env variables have values, then this app must be running on 
 * OPENSHIFT.  Therefore use the connection info in the OPENSHIFT environment
 * variables to replace the connection_string.
 */
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}
// Global variable of the connected database
var mongoDB;
// Global variables needed for gameplay 
var rows = 6;
var columns = 7;
var board;
// currentPlayer is either 1 (Red) or 2 (Black)
var currentPlayer = 1;

// Use connect method to connect to the MongoDB server
mongoClient.connect('mongodb://'+connection_string, function(err, db) {
  if (err) doError(err);
  console.log("Connected to MongoDB server at: "+connection_string);
  mongoDB = db; // Make reference to db globally available.
  console.log("connected to database");
});

/*
 * In the methods below, notice the use of a callback argument,
 * how that callback function is called, and the argument it is given.
 * Why do we need to be passed a callback function? Why can't the create, 
 * retrieve, and update functinons just return the data directly?
 * (This is what we discussed in class.)
 */

/********** CRUD Create -> Mongo insert ***************************************
 * @param {string} collection - The collection within the database
 * @param {object} data - The object to insert as a MongoDB document
 * @param {function} callback - Function to call upon insert completion
 *
 * See the API for more information on insert:
 * http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#insertOne
 */

 exports.initializeBoard = function(){
  board = new Array(rows);
  //create the 2d array
  for(var k = 0; k < rows; k++){
    board[k] = new Array(columns);
  } 
  // set the board to all 0's
  for(var i = 0; i < rows; i++){
    for(var j = 0; j < columns; j++){
      board[i][j] = 0;
    }
  }
  // console.log(board);
 }


 exports.create = function(collection, data, callback) {
  console.log("4. Start insert function in mongoModel");
  // Do an asynchronous insert into the given collection
  mongoDB.collection(collection).insertOne(
    data,                     // the object to be inserted
    function(err, status) {   // callback upon completion
      if (err) doError(err);
      console.log("5. Done with mongo insert operation in mongoModel");
      // use the callback function supplied by the controller to pass
      // back true if successful else false
      var success = (status.result.n == 1 ? true : false);
      callback(success);
      console.log("6. Done with insert operation callback in mongoModel");
    });
  console.log("7. Done with insert function in mongoModel");
}

exports.createBoard = function(collection, data, callback) {
  console.log("4. Start insert function in mongoModel");
  // Do an asynchronous insert into the given collection
  console.log(board);
  mongoDB.collection(collection).insertOne(
    data,                     // the object to be inserted
    function(err, status) {   // callback upon completion
      if (err) doError(err);
      console.log("5. Done with mongo insert operation in mongoModel");
      // use the callback function supplied by the controller to pass
      // back true if successful else false
      var success = (status.result.n == 1 ? true : false);
      callback(success);
      console.log("6. Done with insert operation callback in mongoModel");
    });
  console.log("7. Done with insert function in mongoModel");
}

/********** CRUD Retrieve -> Mongo find ***************************************
 * @param {string} collection - The collection within the database
 * @param {object} query - The query object to search with
 * @param {function} callback - Function to call upon completion
 *
 * See the API for more information on find: 
 * http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#find
 * and toArray:
 * http://mongodb.github.io/node-mongodb-native/2.0/api/Cursor.html#toArray
 */

exports.count = function(collection, query, callback){
  mongoDB.collection(collection).count(query).toArray(function(err, docs) {
    if (err) doError(err);
    // docs are MongoDB documents, returned as an array of JavaScript objects
    // Use the callback provided by the controller to send back the docs.
    callback(docs);
  });
}
exports.retrieve = function(collection, query, callback) {
  /*
   * The find sets up the cursor which you can iterate over and each
   * iteration does the actual retrieve. toArray asynchronously retrieves the
   * whole result set and returns an array.
   */
  mongoDB.collection(collection).find(query).sort({'wins' : -1}).toArray(function(err, docs) {
    if (err) doError(err);
    // docs are MongoDB documents, returned as an array of JavaScript objects
    // Use the callback provided by the controller to send back the docs.
    callback(docs);
  });
}

/********** CRUD Update -> Mongo updateMany ***********************************
 * @param {string} collection - The collection within the database
 * @param {object} filter - The MongoDB filter
 * @param {object} update - The update operation to perform
 * @param {function} callback - Function to call upon completion
 *
 * See the API for more information on insert:
 * http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#updateMany
 */
exports.update = function(collection, filter, update, callback) {
  mongoDB
    .collection(collection)     // The collection to update
    .updateOne(                // Use updateOne to only update 1 document
      filter,                   // Filter selects which documents to update
      update,                   // The update operation
      {upsert:true},            // If document not found, insert one with this update
                                // Set upsert false (default) to not do insert
      function(err, status) {   // Callback upon error or success
        if (err) doError(err);
        callback('Modified '+ status.modifiedCount 
                 +' and added '+ status.upsertedCount+" documents");
        });
}

// Code Citation: http://stackoverflow.com/questions/25289526/connect-4-check-if-player-wins
function checkHorizontal(playerNumber){
  console.log("board in checkHorizontal is: "+ board);
  console.log("playerNumber in checkHorizontal is: "+ playerNumber);
   for(var i = 0; i < 6;i++){
    for(var j = 0; j < 4;j++){
      if(board[i][j] == playerNumber && board[i][j+1] == playerNumber && board[i][j+2] == playerNumber && board[i][j+3] == playerNumber){
        console.log("player won horizontally");
        return true;
      }
    }
  }
  return false;
}

// Code Citation: http://stackoverflow.com/questions/25289526/connect-4-check-if-player-wins
function checkVertical(playerNumber){
  console.log("board in checkVertical is: " + board);
  console.log("playerNumber in checkVertical is: "+ playerNumber);
  //checks vertical win
  for(var i = 0; i < 3; i++){
    for(var j = 0; j < 7; j++){
      if(board[i][j] == playerNumber && board[i+1][j] == playerNumber && board[i+2][j] == playerNumber && board[i+3][j] == playerNumber){
        console.log("player won vertically");
        return true;
      }
    }
  }
  return false;
}

// Code Citation: http://stackoverflow.com/questions/25289526/connect-4-check-if-player-wins
function checkDiagonal(playerNumber){
  //checks right diagonal win
  var didWin = false;
  for(var i = 0; i < 3;i++){
    for(var j = 0; j < 4; j++){
      if(board[i][j] == playerNumber && board[i+1][j+1] == playerNumber && board[i+2][j+2] == playerNumber && board[i+3][j+3] == playerNumber){
        console.log("player won diagonally");
        didWin = true;
      }
    }
  }
  //checks left diagonal win
  for(var i = 0; i < 3; i++){
    for(var j = 0; j < 4;j++){
      if(board[i][j] == playerNumber && board[i+1][j-1] == playerNumber && board[i+2][j-2] == playerNumber && board[i+3][j-3] == playerNumber){
        console.log("player won diagonally");
        didWin = true;
      }
    }
  }
  return didWin;
}


exports.checkForWin = function(playerNumber){
  var result = checkHorizontal(playerNumber);
  console.log("result from checkHorizontal is: "+result);
  if(result){
    return true;
  }
  result = checkVertical(playerNumber);
  console.log("result from checkVertical is: "+result);
  if(result){
    return true;
  }
  result = checkDiagonal(playerNumber);
  console.log("result from checkDiagonal is: "+result);
  if(result){
    return true;
  }
  // checkDiagonals as well;
  return false;

}

// exports.checkDiagonal = function(playerNumber){

// }


exports.changeBoard = function(column, playerNumber){
  var boardChanged = false;
  var i = 5;
  while(i >= 0 && !boardChanged){
    //iterate through all rows of a particular column
    // find the lowest place that hasn't been taken and insert the player Token there
    console.log("column is: "+column);
    console.log("board[i][column] is: "+ board[i][column]);
    if(board[i][column] == 0){
      console.log("playerNumber in changeBoard is: "+ playerNumber);
      board[i][column] = playerNumber;
      boardChanged = true;
      console.log("board[i][column] is:" + board[i][column]);
      console.log("only changeBoard once");
     }
    i--;
  }
  return boardChanged;
}

exports.togglePlayer = function(){
  console.log("entered togglePlayer");
  if(currentPlayer == 1){
    currentPlayer = 2;
  }
  else if(currentPlayer == 2){
    currentPlayer = 1;
  }
  console.log("currentPlayer is: " + currentPlayer);
}

exports.returnBoard = function(){
  return board;
}

exports.returnCurrentPlayer = function(){
  return currentPlayer;
}

/********** CRUD Delete -> Mongo deleteOne or deleteMany **********************
 * The delete model is left as an exercise for you to define.
 */


var doError = function(e) {
        console.error("ERROR: " + e);
        throw new Error(e);
    }
