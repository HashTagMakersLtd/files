var id = get("id");

allThreadsRef = firebase.firestore().collection("forums").doc(id).collection("threads");

// READING MESSAGES AND INITIALIZING CHAT

var firstBatch = allThreadsRef.orderBy("timestamp", "desc").limit(25);

function getThreadAsElement(doc){
	var liked = didUserLike(doc,userRef.id) ? " liked" : " ";
	//console.log(liked);
	return "<li class=\"threadItem\" id=\""+doc.id+"-main\">\
				<a href=\"thread.html?forumID="+id+"&threadID="+doc.id+"\">\
					<h2 class=\"threadTitle\">"+doc.data().name+"</h2>\
				</a>\
					<span class=\"author\">"+doc.data().from.id+"</span><br>\
					<div class=\"infoDiv\">\
						<button class=\"likeBtn"+liked+"\" id=\""+doc.id+"\" onclick=\"onLikeButtonClick(\'"+doc.id+"\')\"><i class=\"material-icons\">thumb_up_alt</i></button>\
						<span class=\"timeStamp\">"+timeConverter(doc.data().timestamp.toDate())+"</span>\
						<i class=\"material-icons\">thumb_up_alt</i>\
						<span class=\"likeNum\">"+doc.data().usersWhoLiked.length+"</span>\
						<i class=\"material-icons\">chat_bubble</i>\
						<span class=\"comNum\">"+doc.data().commentCount+"</span>\
					</div>\
					<div class=\"border\"></div>\
			</li>"
}

function displayOldThread(thread){
	//console.log(thread);
	$("#threadList").append(thread);
}

function displayNewThread(thread){
	//console.log(thread);
	$("#threadList").prepend(thread);
}

function getNext25messages(queryRef){
	queryRef.get()
    .then(function(querySnapshot) {
    	var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];

        querySnapshot.forEach(function(doc) {
            displayOldThread(getThreadAsElement(doc));
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
getNext25messages(firstBatch);

//TODO: Add way to grab older threads

//Realtime Handler to append new thread
allThreadsRef
    .onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
        	//console.log(change);
            if (change.type === "added" && !change.doc.metadata.fromCache) {
            	//console.log("added");
                displayNewThread(getThreadAsElement(change.doc))
            }
            else if (change.type === "modified") {
                //console.log("Modified thread: ", change);
                $("#"+change.doc.id+"-main").remove();
                displayNewThread(getThreadAsElement(change.doc));
                //TODO: maybe figure out a wya to not move threads around when liking them?
            }
            else if (change.type === "removed") {
                console.log("Removed thread: ", change.doc.data());
                $("#"+change.doc.id+"-main").remove();
            }
            else{console.log(change)}
        });
    }, function(error) {
        console.log("Error getting realtime chat: ", error);
        alert("We've run into an error downloading forum data!");
        //TODO: Add Hebrew
        window.location.href = "Main.html";
    });


//MAKING NEW THREADS

firebase.auth().onAuthStateChanged(function(user){
	if (user) { // User is signed in!
		userRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser.email);
	}
});

function makeNewThread(title){
	var date = new Date();
	var ts = firebase.firestore.Timestamp.fromDate(date);
	var newThread = allThreadsRef.doc();
	newThread.set({
	    from: userRef,
	    name: title,
	    timestamp: ts,
	    mostRecentPost: ts,
	    commentCount: 0,
	    usersWhoLiked: [userRef]
	})
	.catch(function(error) {
	    console.error("Error creating thread: ", error);
	    //TODO: Inform user
	});
	//TODO: maybe initialize thread w a comment?
	window.location.href = "thread.html?forumID="+id+"&threadID="+newThread.id
}

function onButtonClick() {
	var title = prompt("Enter a title:");
	//TODO: Add Hebrew
	if (title!=null){
		makeNewThread(title);
	}
}

//LIKES

function onLikeButtonClick(id){
	forumRef = allThreadsRef.doc(id);
	if ($("#"+id).hasClass("liked")){//user already liked thread; is unliking it
		unlikeAnything(forumRef,userRef);
		$("#"+id).removeClass("liked");
	}
	else{//user is liking thread
		likeAnything(forumRef,userRef);
		$("#"+id).addClass("liked");
	}
}