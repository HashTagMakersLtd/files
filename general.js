
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

