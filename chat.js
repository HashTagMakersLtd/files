var id = get("id");

genChatRef = firebase.firestore().collection("forums").doc(id).collection("genChat");


// READING MESSAGES AND INITIALIZING CHAT

var firstBatch = genChatRef.orderBy("timestamp",'desc').limit(25);

function displayOldMessage(doc){
	console.log(doc.id, " => ", doc.data());
	//TODO: actually add this
	//Here's how: prepend it on the list
	//On a different side depending if it comes from you or not
}

function get25messages(queryRef){
	queryRef.get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            
            displayOldMessage(doc);
        });

        var nextBatch = genChatRef.orderBy("timestamp",'desc')
          						.startAfter(lastVisible)
          						.limit(25);
    })
    .catch(function(error) {
        console.log("Error getting chat log: ", error);
    });
}

//Get latest 25 messages:
get25messages(firstBatch);

//TODO: add handler to some kind of "see older posts" button that calls get25messages(nextBatch);

//TODO: add realtime handler that appends new messages


//WRITING MESSAGES