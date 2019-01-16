
//CHATS
function addForum(Name){
	firebase.firestore().collection("forums").add({
    	name: Name
	})
	.then(function(docRef) {
	    console.log("Document written with ID: ", docRef.id);
	    postMessage(docRef.collection("genChat"),"Welcome to the chat for the "+Name+" forum!")
	    //TODO: Add Hebrew
	})
	.catch(function(error) {
	    console.error("Error adding document: ", error);
	});
}

function get(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}

function writeMessageInChat(chatRef, message,userRef){
		var date = new Date();
	    chatRef.add({
		    from: userRef,
		    text: message,
		    timestamp: firebase.firestore.Timestamp.fromDate(date)
		})
		.catch(function(error) {
		    console.error("Error posting message: ", error);
		});
}

function timeConverter(UNIX_timestamp){
  //var a = new Date(UNIX_timestamp * 1000);
  var a = UNIX_timestamp;
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  if (min<10){
  	min = "0"+min;
  }
  var sec = a.getSeconds();
  if (sec<10){
  	sec = "0"+sec;
  }
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}