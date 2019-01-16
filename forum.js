var id = get("id");

allThreadsRef = firebase.firestore().collection("forums").doc(id).collection("threads");

// READING MESSAGES AND INITIALIZING CHAT

var firstBatch = allThreadsRef.orderBy("timestamp", "desc").limit(25);

function getThreadAsElement(doc){
	return "<li class=\"threadItem\" id=\""+doc.id+"\">\
				<h2 class=\"threadTitle\">"+doc.data().name+"</h2>\
				<span class=\"author\">"+doc.data().from.id+"</span><br>\
				<div class=\"infoDiv\">\
					<button class=\"likeBtn\"><i class=\"material-icons\">thumb_up_alt</i></button>\
					<span class=\"timeStamp\">"+timeConverter(doc.data().timestamp.toDate())+"</span>\
					<i class=\"material-icons\">thumb_up_alt</i>\
					<span class=\"likeNum\">"+doc.data().likeCount+"</span>\
					<i class=\"material-icons\">chat_bubble</i>\
					<span class=\"comNum\">"+doc.data().commentCount+"</span>\
				</div><br>\
				<div class=\"border\"></div>\
			</li>"
}

function displayThread(thread){
	console.log(thread);
	$("#threadList").append(thread);
}

function get25messages(queryRef){
	queryRef.get()
    .then(function(querySnapshot) {
    	var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];

        querySnapshot.forEach(function(doc) {
            displayThread(getThreadAsElement(doc));
        });

        nextBatch = allThreadsRef.orderBy("timestamp", "desc")
          						.startAfter(lastVisible)
          						.limit(25);
    })
    .catch(function(error) {
        console.log("Error getting threads: ", error);
    });
}

//Get most recent 25 messages:
get25messages(firstBatch);
//WRITING MESSAGES

firebase.auth().onAuthStateChanged(function(user){
	if (user) { // User is signed in!
		userRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser.email);
	}
});