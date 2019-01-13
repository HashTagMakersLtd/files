var id = get("id");

genChatRef = firebase.firestore().collection("forums").doc(id).collection("genChat");


// READING MESSAGES AND INITIALIZING CHAT

var firstBatch = genChatRef.orderBy("timestamp", "desc").limit(25);

function displayOldMessage(doc){
	console.log(doc.id, " => ", doc.data());
	//TODO: actually add this
	//Here's how: prepend it on the list
	//On a different side depending if it comes from you or not
}

function displayNewMessage(doc){
	console.log(doc.id, " => ", doc.data());
	//TODO: actually add this
	//Here's how: append it on the list
	//On a different side depending if it comes from you or not
}

function get25messages(queryRef){
	queryRef.get()
    .then(function(querySnapshot) {
    	var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];

        querySnapshot.forEach(function(doc) {
            displayOldMessage(doc);
        });

        var nextBatch = genChatRef.orderBy("timestamp", "desc")
          						.startAfter(lastVisible)
          						.limit(25);
    })
    .catch(function(error) {
        console.log("Error getting chat log: ", error);
    });
}

//Get most recent 25 messages:
get25messages(firstBatch);

//TODO: add handler to some kind of "see older posts" button that calls get25messages(nextBatch);

//Realtime Handler to append new messages
genChatRef
    .onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            if (change.type === "added" && change.doc.metadata.hasPendingWrites) {
                displayNewMessage(change.doc)
            }
            if (change.type === "modified") {
                console.log("Modified msg: ", change.doc.data());
                //TODO: actually do this
            }
            if (change.type === "removed") {
                console.log("Removed msg: ", change.doc.data());
                //TODO: Handle this?
            }
        });
    }, function(error) {
        console.log("Error getting realtime chat: ", error);
        alert("We've run into an error downloading chat data!");
        window.location.href = "Main.html";
    });

//WRITING MESSAGES

firebase.auth().onAuthStateChanged(function(user){
	if (user) { // User is signed in!
		userRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser.email);
	}
});

function writeMessageHere(message){
	writeMessageInChat(genChatRef,message,userRef);
}

//TODO: Hook writeMessageHere up to button and inputText field

function deleteMessage(msgID){
	genChatRef.doc(msgID).update({
	    text: "🚫This message has been deleted🚫"
	})
	.then(function() {
	    console.log("Msg successfully deleted");
	})
	.catch(function(error) {
	    // The document probably doesn't exist.
	    console.error("Error deleting msg: ", error);
	});
}