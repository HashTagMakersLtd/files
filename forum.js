var id = get("id");

allThreadsRef = firebase.firestore().collection("forums").doc(id).collection("threads");

//Build dictionary of emails to usernames:
var displayNameDict = {};
// READING MESSAGES AND INITIALIZING CHAT

firebase.firestore().collection("forums").doc(id).get()
	.then(function(doc){
		if (doc.exists){
			$("#forumTitle").text(doc.data().name);
		}
	});
var firstBatch = allThreadsRef.orderBy("mostRecentPost", "desc").limit(25);

function getThreadAsElement(doc){
	if (displayNameDict[doc.data().from.id]==null){
		var authName = doc.data().from.id;
		firebase.firestore().collection("users").doc(doc.data().from.id).get()
			.then(function(uDoc){
				//console.log(uDoc.data());
				if (uDoc.exists){
					var e = doc.data().from.id;
					var n = uDoc.data().displayName;
					displayNameDict[e] = n;
					$("."+e.replace(/@|\./g, "")).text(n);
				}
			})
	} else {
		var authName = displayNameDict[doc.data().from.id];
	}
	var liked = didUserLike(doc,userRef.id) ? " liked" : " ";
	//console.log(liked);
	return "<li class=\"threadItem\" id=\""+doc.id+"-main\">\
				<a href=\"thread.html?forumID="+id+"&threadID="+doc.id+"\">\
					<h2 class=\"threadTitle\">"+doc.data().name+"</h2>\
				</a>\
					<span class=\"author "+authName.replace(/@|\./g, '')+"\">"+authName+"</span><br>\
					<div class=\"infoDiv\">\
						<button class=\"likeBtn"+liked+"\" id=\""+doc.id+"\" onclick=\"onLikeButtonClick(\'"+doc.id+"\')\"><i class=\"material-icons\">thumb_up_alt</i></button>\
						<span class=\"timeStamp\">"+timeConverter(doc.data().mostRecentPost.toDate())+"</span>\
						<i class=\"material-icons\">thumb_up_alt</i>\
						<span class=\"likeNum\" id=\""+doc.id+"-likeCount\">"+doc.data().usersWhoLiked.length+"</span>\
						<i class=\"material-icons\">chat_bubble</i>\
						<span class=\"comNum\" id=\""+doc.id+"-commentCount\">"+doc.data().commentCount+"</span>\
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
	var queryNum = 0;
	queryRef.get()
    .then(function(querySnapshot) {
    	$(".loader").remove();
    	$("#newPostBtn").show();
    	var lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];

        querySnapshot.forEach(function(doc) {
        	queryNum++;
            displayOldThread(getThreadAsElement(doc));
        });
        if (queryNum==25){
        	$("#olderPosts").show()
        	nextBatch = allThreadsRef.orderBy("mostRecentPost", "desc")
          						.startAfter(lastVisible)
          						.limit(25);
        } else{
        	$("#olderPosts").hide();
        }
        
    })
    .catch(function(error) {
        console.log("Error getting threads: ", error);
    });
}

//Get most recent 25 messages:
getNext25messages(firstBatch);

//Way to grab older threads
$(document).ready(function(){
	$("#olderPosts").click(function(){
		getNext25messages(nextBatch);
	});
});

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
                //$("#"+change.doc.id+"-main").remove();
                //displayNewThread(getThreadAsElement(change.doc));
                $("#"+change.doc.id+"-likeCount").html(change.doc.data().usersWhoLiked.length);
        		$("#"+change.doc.id+"-commentCount").html(change.doc.data().commentCount);
            }
            else if (change.type === "removed") {
                console.log("Removed thread: ", change.doc.data());
                $("#"+change.doc.id+"-main").remove();
            }
            else{
            	//console.log(change)
            }
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
		//$("#profilePhoto")[0].src=user.photoURL;
		displayNameDict[(firebase.auth().currentUser.email)] = firebase.auth().currentUser.displayName;
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