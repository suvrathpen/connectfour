// include my model for this application
var mongoModel = require("../models/mongoModel.js")

// Define the routes for this controller
exports.init = function(app) {
  //initialize the board
  // app.put('/home', doCreate);
  app.get('/', index); // essentially the app welcome page
  // The collection parameter maps directly to the mongoDB collection
  // app.get('/board', getBoard);
  // app.put('/createBoard', putBoard);
  // app.put('/connect', doCreate); // CRUD Create
  // app.get('/connect', doRetrieve); // CRUD Retrieve
  // app.post('/connect/:row/:column', doUpdate); // CRUD Update
  app.get('/leaderboard', doRetrieve);
  // The CRUD Delete path is left for you to define
}
index = function(req, res) {
  // console.log("index is");
  // console.log(mongoModel.board);
  res.render('index');
};
//collection is called connectFour
doCreate = function(req, res) {
  console.log("1. Starting doCreate in dbRoutes");
  //for some reason mongoModel.board is undefined even though its a global
  mongoModel.initializeBoard();
  var tempBoard = mongoModel.returnBoard();
  mongoModel.createBoard ( 'connectFour', 
                          {'gameBoard': tempBoard},
                      function(result) {
                        // result equal to true means create was successful
                        var success = (result ? "Create successful" : "Create unsuccessful");
                        // res.render('message', {title: 'Mongo Demo', obj: success});
                        console.log("The tempBoard is: ");
                        console.log(tempBoard);
                        res.render('board', {'success':'true'});
                        console.log("2. Done with callback in dbRoutes create");
                      });
  console.log("3. Done with doCreate in dbRoutes");
}

getBoard = function(req, res){
  var board = mongoModel.returnBoard();
  res.render('board', {'gameBoard': board});
}


/********** CRUD Retrieve (or Read) *******************************************
 * Take the object defined in the query string and do the Retrieve
 * operation in mongoModel.  (Note: The mongoModel method was called "find"
 * when we discussed this in class but I changed it to "retrieve" to be
 * consistent with CRUD operations.)
 */ 

doRetrieve = function(req, res){
  /*
   * Call the model Retrieve with:
   *  - The collection to Retrieve from
   *  - The object to lookup in the model, from the request query string
   *  - As discussed above, an anonymous callback function to be called by the
   *    model once the retrieve has been successful.
   * modelData is an array of objects returned as a result of the Retrieve
   */
  mongoModel.retrieve(
    'connectfour', 
    {},
		function(modelData) {
		  if (modelData.length) {
        res.render('leaderboard',{title: 'Mongo Demo', obj: modelData});
      } else {
        var message = "No documents with "+JSON.stringify({})+ 
                      " in collection "+"connectfour"+" found.";
        res.render('message', {title: 'Mongo Demo', obj: message});
      }
		});
}

/********** CRUD Update *******************************************************
 * Take the MongoDB update object defined in the request body and do the
 * update.  (I understand this is bad form for it assumes that the client
 * has knowledge of the structure of the database behind the model.  I did
 * this to keep the example very general for any collection of any documents.
 * You should not do this in your project for you know exactly what collection
 * you are using and the content of the documents you are storing to them.)
 */ 
doUpdate = function(req, res){
  // if there is no filter to select documents to update, select all documents
  var filter = req.body.find ? JSON.parse(req.body.find) : {};
  // if there no update operation defined, render an error page.
  if (!req.body.update) {
    res.render('message', {title: 'Mongo Demo', obj: "No update operation defined"});
    return;
  }
  var board = mongoModel.changeBoard(req.params.row, req.params.column);
  togglePlayer();
  // var update = JSON.parse(req.body.update);
  /*
   * Call the model Update with:
   *  - The collection to update
   *  - The filter to select what documents to update
   *  - The update operation
   *    E.g. the request body string:
   *      find={"name":"pear"}&update={"$set":{"leaves":"green"}}
   *      becomes filter={"name":"pear"}
   *      and update={"$set":{"leaves":"green"}}
   *  - As discussed above, an anonymous callback function to be called by the
   *    model once the update has been successful.
   */
   // usually there is update after filter
   // where connect is usually req.params.collection 
  mongoModel.update(  'connect', filter, board,
		                  function(status) {
              				  res.render('message',{title: 'Mongo Demo', obj: status});
		                  });
}

/********** CRUD Delete *******************************************************
 * The delete route handler is left as an exercise for you to define.
 */


/*
 * How to test:
 *  - Create a test web page
 *  - Use REST Console for Chrome
 *    (If you use this option, be sure to set the Body Content Headers Content-Type to:
 *    application/x-www-form-urlencoded . Else body-parser won't work correctly.)
 *  - Use CURL (see tests below)
 *    curl comes standard on linux and MacOS.  For windows, download it from:
 *    http://curl.haxx.se/download.html
 *
 * Tests via CURL for Create and Update (Retrieve can be done from browser)

# >>>>>>>>>> test CREATE success by adding 3 fruits
curl -i -X PUT -d "name=apricot&price=2" http://localhost:50000/fruit
curl -i -X PUT -d "name=banana&price=3" http://localhost:50000/fruit
curl -i -X PUT -d "name=cantaloupe&price=4" http://localhost:50000/fruit
# >>>>>>>>>> test CREATE missing what to put
curl -i -X PUT  http://localhost:50000/fruit
# >>>>>>>>>> test UPDATE success - modify
curl -i -X POST -d 'find={"name":"banana"}&update={"$set":{"color":"yellow"}}' http://localhost:50000/fruit
# >>>>>>>>>> test UPDATE success - insert
curl -i -X POST -d 'find={"name":"plum"}&update={"$set":{"color":"purple"}}' http://localhost:50000/fruit
# >>>>>>>>>> test UPDATE missing filter, so apply to all
curl -i -X POST -d 'update={"$set":{"edible":"true"}}' http://localhost:50000/fruit
# >>>>>>>>>> test UPDATE missing update operation
curl -i -X POST -d 'find={"name":"pear"}' http://localhost:50000/fruit

 */