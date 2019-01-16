var forumID = get("forumID");
var threadID = get("threadID");

var threadRef = firebase.firestore().collection("forums").doc(forumID).collection("threads").doc(threadID);

//INITIALIZE PAGE

//initialize Header
threadRef.get()
	.then(function(doc){
		
		var liked = didUserLike(doc,userRef.id) ? " liked" : " ";

		$("#headerDiv").html("<h1 id=\"threadTitle\">"+doc.data().name+"</h1>\
								<span class=\"author\">"+doc.data().from.id+"</span>\
								<div class=\"infoDiv\">\
									<button class=\"likeBtn"+liked+"\"><i class=\"material-icons\">thumb_up_alt</i></button>\
									<span class=\"timeStamp\">"+timeConverter(doc.data().timestamp.toDate())+"</span>\
									<i class=\"material-icons\">thumb_up_alt</i>\
									<span class=\"likeNum\" id=\'mainLikeNum\'>"+doc.data().usersWhoLiked.length+"</span>\
									<i class=\"material-icons\">chat_bubble</i>\
									<span class=\"comNum\" id=\'mainCommentNum\'>"+doc.data().commentCount+"</span>\
								</div>")

	})

//Initialize comments
commentsRef = threadRef.collection("comments");
commentsRef.orderBy("timestamp", "desc")
  .get().then(function(querySnapshot) {
	//console.log("comments:");
    querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        //console.log(getMainCommentAsElement(doc));

        $("#mainField").append(getMainCommentAsElement(doc));
        if (doc.data().commentCount>0){
        	//console.log("SubComments:");
        	commentsRef.doc(doc.id).collection("subComments").orderBy("timestamp").get().then(function(q) {
			    q.forEach(function(d) {
			        // d.data() is never undefined for query d snapshots
			        //console.log(d.id, " => ", d.data());

			        $("#"+doc.id+"-com").append(getSubCommentAsElement(d));
			    });
			});
        }
    });
});

//Realtime Handler to update main thread comment and like counts
threadRef
    .onSnapshot(function(doc) {
        $("#mainLikeNum").html(doc.data().usersWhoLiked.length);
        $("#mainCommentNum").html(doc.data().commentCount);
    });

//Realtime Handler to append main comments
commentsRef
    .onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
        	//console.log(change);
            if (change.type === "added" && !change.doc.metadata.fromCache) {
            	console.log(change);
                $("#mainField").prepend(getMainCommentAsElement(change.doc));
            }
            else if (change.type === "modified") {
                //console.log("Modified comment: ", change);
                $("#"+change.doc.id).remove();
				$("#mainField").prepend(getMainCommentAsElement(change.doc));                
				//TODO: maybe figure out a wya to not move threads around when liking them?
            }
            else if (change.type === "removed") {
                //console.log("Removed comment: ", change.doc.data());
                $("#"+change.doc.id).remove();
            }
            else{console.log(change)}
        });
    }, function(error) {
        console.log("Error getting realtime chat: ", error);
        alert("We've run into an error downloading message data!");
        //TODO: Add Hebrew
        window.location.href = "forum.html?id="+forumID;
    });

//TODO: Realtime Handler for sub comments

//Commenting

//get userRef
firebase.auth().onAuthStateChanged(function(user){
	if (user) { // User is signed in!
		userRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser.email);
		uEmail = userRef.id;
	}
});

//Add Main Comment

function comment(t){
	var date = new Date();
	commentsRef.add({
		text: t,
		timestamp: firebase.firestore.Timestamp.fromDate(date),
		from: userRef,
		commentCount: 0,
		usersWhoLiked: null
	})
	.then(function(docRef) {
    console.log("Document written with ID: ", docRef.id);
    threadRef.get().then(function(doc){
    	var c = doc.data().commentCount;
    	threadRef.update({
    		commentCount : c+1
    	});
    });
    //TODO: Live Update
	})
	.catch(function(error) {
	    console.error("Error adding document: ", error);
	});
}

//Main input button

function mainButtonClick(){
	comment($("#comInput").val());
	$("#comInput").val("");
}

//Add subComment

function subComment(t, commentID){
	var date = new Date();
	commentsRef.doc(commentID).collection("subComments").add({
		text: t,
		timestamp: firebase.firestore.Timestamp.fromDate(date),
		from: userRef,
		usersWhoLiked: null
	})
	.then(function(docRef) {
    	console.log("Document written with ID: ", docRef.id);
    	commentsRef.doc(commentID).get().then(function(doc){
    	var c = doc.data().commentCount;
    	commentsRef.doc(commentID).update({
    		commentCount : c+1
    	});
    });
    	//TODO: Live Update
	})
	.catch(function(error) {
	    console.error("Error adding document: ", error);
	});
}

//Subordinate input button

function secondaryButtonClick(commentID){
	subComment($("#"+commentID+"-input").val(),commentID);
	$("#"+commentID+"-input").val("");
}

//STRUCTURE GENERATION

function getMainCommentAsElement(doc){
	var data = doc.data();
	var commentClass = (data.from.id===uEmail) ? "yourCom" : "theirCom";
	var username = (data.from.id===uEmail) ? "את\\ה" : data.from.id;
	var likeCount = (data.usersWhoLiked===null) ? 0 : data.usersWhoLiked.length;
	return "<div class=\""+commentClass+"Field\"  id=\""+doc.id+"\">\
				<div class=\""+commentClass+"\">\
					<span class=\"userName\">"+username+"</span><br>\
					<img id=\"profilePhoto\" src=\"genericProfileImg.png\">\
					<span class=\"comText\">"+data.text+"</span>\
					<div class=\"infoDiv\">\
						<button class=\"likeBtn\"><i class=\"material-icons\">thumb_up_alt</i></button>\
						<span class=\"timeStamp\">"+timeConverter(data.timestamp.toDate())+"</span>\
						<i class=\"material-icons\">thumb_up_alt</i>\
						<span class=\"likeNum\">"+likeCount+"</span>\
						<i class=\"material-icons\">chat_bubble</i>\
						<span class=\"comNum\">"+data.commentCount+"</span>\
					</div>\
				</div>\
				<div class=\"comSpace\" id=\""+doc.id+"-com\"></div>\
				<div class=\"comSpace\" >\
					<div class=\"postComDiv\">\
						<textarea name=\"text\" class=\"comInput2\" id=\""+doc.id+"-input\" placeholder=\"הגיבו כאן\"></textarea>\
						<button id=\"sendCom\" onclick=\"secondaryButtonClick(\'"+doc.id+"\')\">\
							<img src=\"sendImg.png\">\
						</button>\
					</div>\
				</div>\
			</div>"
}

function getSubCommentAsElement(doc){
	var data = doc.data();
	var commentClass = (data.from.id===uEmail) ? "yourCom" : "theirCom";
	var username = (data.from.id===uEmail) ? "את\\ה" : data.from.id;
	var likeCount = (data.usersWhoLiked===null) ? 0 : data.usersWhoLiked.length;
	return "<div class=\""+commentClass+"\" id=\""+doc.id+"\">\
					<span class=\"userName\">"+username+"</span><br>\
					<img id=\"profilePhoto\" src=\"genericProfileImg.png\">\
					<span class=\"comText\">"+data.text+"</span>\
					<div class=\"infoDiv\">\
						<button class=\"likeBtn\"><i class=\"material-icons\">thumb_up_alt</i></button>\
						<span class=\"timeStamp\">"+timeConverter(data.timestamp.toDate())+"</span>\
						<i class=\"material-icons\">thumb_up_alt</i>\
						<span class=\"likeNum\">"+likeCount+"</span>\
					</div>\
			</div>"
}

//Hide the address bar in mobile safari:
/*
if(isSafari()) {
  //For iPhone and Andriod To remove Address bar when viewing website on Safari Mobile
  // When ready...
  window.addEventListener("load",function() {
    // Set a timeout...
    setTimeout(function(){
    // Hide the address bar!
    window.scrollTo(0, 1);
    }, 0);
  });
}
*/
