function getBoard(){
  $.ajax({
    url: '/connect',
    type: 'GET',
    success: function(result) {
      // Do something with the result
      console.log("entered");
      //add the table to the DOM
      // var a = $('#answer').append(result);
      console.log("html appended is:" + a);
      }
  });
}

function createBoard(){
  $.ajax({
    url: '/home',
    type: 'PUT',
    success: function(result) {
      // Do something with the result
      console.log("createBoard result is:" + result);
    } 
  });
}



function makeMove(){
  var row = $("#row").val();
  var column = $("#column").val();
  // var origin = $("#third").val();
  $.ajax({
    url: '/connect/'+row+'/'+column,
    type: 'POST',
    success: function(result) {
      // Do something with the result
      // $('#answer').empty();
      // console.log("result in changeDog is:" + result);
      // $('#answer').append('<p>'+'Name: '+ result.name + ' Breed: ' 
      //                     + result.breed + ' Origin: ' + result.origin
      //                     + '</p>');
      }
  });
}