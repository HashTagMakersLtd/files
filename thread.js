var forumID = get("forumID");
var threadID = get("threadID");

var threadRef = firebase.firestore().collection("forums").doc(forumID).collection("threads").doc(threadID);

//Build dictionary of emails to usernames:
var displayNameDict = JSON.parse(sessionStorage.getItem("displayNameDict"))||{};

//get userRef
firebase.auth().onAuthStateChanged(function(user){
	if (user) { // User is signed in!
		//$("#profilePhoto")[0].src=user.photoURL;
		userRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser.email);
		uEmail = userRef.id;
		userRef.get().then(function(doc){
			if(doc.data().admin==true){
				//SHOW ALL TRASH 
				admin = true;
				//$(".deleteBtn").remove();
				$("#mainMidDiv").prepend("<button class=\"deleteBtn\" onclick=\"deleteThisThread()\"><i class=\"material-icons\">delete</i></button>");
				//Show trash buttons for top-level comments
				$(".mainCommentMidDiv .deleteBtn").remove();
				var mainCommentMidDivs = $(".mainCommentMidDiv");
				//console.log(mainCommentMidDivs);
				for (var i = 0; i < mainCommentMidDivs.length; i++){
					//console.log(mainCommentMidDivs.eq(i));
					mainCommentMidDivs.eq(i).prepend(getDeleteButton(mainCommentMidDivs[i].id.slice(4)));
				}
			}
		});
	}
	else{
		alert("Please sign in!")
		//TODO: Add Hebrew
		window.location.href = "index.html";
	}
});

function isAdmin(){
	if (typeof admin!=='undefined'){
		return admin;
	}
	else{
		return false;
	}
}
//INITIALIZE PAGE

//initialize Header
threadRef.get()
	.then(function(doc){
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
						sessionStorage.setItem("displayNameDict", JSON.stringify(displayNameDict));
					}
				});
		} else {
			var authName = displayNameDict[doc.data().from.id];
		}
		var username = (doc.data().from.id===uEmail) ? "את\\ה" : authName;
		var liked = didUserLike(doc,userRef.id) ? " liked" : " ";
		var deleteBtn = (doc.data().from.id===uEmail) ? getDeleteButton(doc.id) : "";
		
		$("#headerDiv").html("<h1 id=\"threadTitle\">"+doc.data().name+"</h1>\
								<div class=\"midDiv\" id=\"mainMidDiv\">\
									"+deleteBtn+"\
									<span class=\"author userName "+username.replace(/@|\./g, '')+"\">"+username+"</span>\
								</div>\
								<div class=\"infoDiv\">\
									<button id=\"mainLike\" class=\"likeBtn"+liked+"\" onclick=\"mainLikeButton()\"><i class=\"material-icons\">thumb_up_alt</i></button>\
									<div class=\'infoText\'>\
										<span class=\"timeStamp\">"+timeConverter(doc.data().timestamp.toDate())+"</span>\
										<i class=\"material-icons\">thumb_up_alt</i>\
										<span class=\"likeNum\" id=\'mainLikeNum\'>"+doc.data().usersWhoLiked.length+"</span>\
										<i class=\"material-icons\">chat_bubble</i>\
										<span class=\"comNum\" id=\'mainCommentNum\'>"+doc.data().commentCount+"</span>\
									</div>\
								</div>");

	});

//Initialize comments
commentsRef = threadRef.collection("comments");
commentsRef.orderBy("timestamp", "desc")
  .get().then(function(querySnapshot) {
  	$(".loader").remove();
	//console.log("comments:");
    querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        //console.log(getMainCommentAsElement(doc));

        $("#mainField").append(getMainCommentAsElement(doc));
        if (doc.data().commentCount>0){
        	//console.log("SubComments:");
        	/* OLD VERSION
        	commentsRef.doc(doc.id).collection("subComments").orderBy("timestamp").get().then(function(q) {
			    q.forEach(function(d) {
			        // d.data() is never undefined for query d snapshots
			        //console.log(d.id, " => ", d.data());

			        $("#"+doc.id+"-com").append(getSubCommentAsElement(d));
			    });
			});
			*/
			realtimeUpdates(doc.id);
        }
    });
});

//Realtime Handler to update main thread comment and like counts
threadRef
    .onSnapshot(function(doc) {
    	var likeCount = (doc.data().usersWhoLiked===null) ? 0 : doc.data().usersWhoLiked.length;
        $("#mainLikeNum").html(likeCount);
        $("#mainCommentNum").html(doc.data().commentCount);
    });

//Realtime Handler to append main comments
commentsRef
    .onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
        	//console.log(change);
            if (change.type === "added" && !change.doc.metadata.fromCache) {
            	//console.log(change);
                $("#mainField").prepend(getMainCommentAsElement(change.doc));
                realtimeUpdates(change.doc.id);
            }
            else if (change.type === "modified") {
                var likeCount = (change.doc.data().usersWhoLiked===null) ? 0 : change.doc.data().usersWhoLiked.length;
                $("#"+change.doc.id+"-likeCount").html(likeCount);
        		$("#"+change.doc.id+"-commentCount").html(change.doc.data().commentCount);    
        		$("#"+change.doc.id+"-text").html(change.doc.data().text);            
            }
            else if (change.type === "removed") {
                //console.log("Removed comment: ", change.doc.data());
                $("#"+change.doc.id).remove();
            }
            else{
            	//console.log(change)
            }
        });
    }, function(error) {
        console.log("Error getting realtime chat: ", error);
        alert("We've run into an error downloading message data!");
        //TODO: Add Hebrew
        window.location.href = "forum.html?id="+forumID;
    });

function realtimeUpdates(commentID){
	commentsRef.doc(commentID).collection("subComments").orderBy("timestamp")
    .onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
        	//console.log(change);
            if (change.type === "added") {
            	//console.log(change.doc);
            	//console.log(change);
                $("#"+commentID+"-com").append(getSubCommentAsElement(change.doc));
            }
            else if (change.type === "modified") {
                //console.log("Modified comment: ", change);
                var likeCount = (change.doc.data().usersWhoLiked===null) ? 0 : change.doc.data().usersWhoLiked.length;
                $("#"+change.doc.id+"-likeCount").html(likeCount);
        		$("#"+change.doc.id+"-text").html(change.doc.data().text);            
            }
            else if (change.type === "removed") {
                //console.log("Removed comment: ", change.doc.data());
                $("#"+change.doc.id).remove();
            }
            else{
            	//console.log(change)
            }
        });
    }, function(error) {
        console.log("Error getting realtime chat: ", error);
        alert("We've run into an error downloading message data!");
        //TODO: Add Hebrew
        window.location.href = "forum.html?id="+forumID;
    });
}
//Commenting



//Add Main Comment

function comment(t){
	var date = new Date();
	var ts = firebase.firestore.Timestamp.fromDate(date);
	commentsRef.add({
		text: t,
		timestamp: ts,
		from: userRef,
		commentCount: 0,
		usersWhoLiked: null
	})
	.then(function(docRef) {
    console.log("Document written with ID: ", docRef.id);
    threadRef.get().then(function(doc){
    	var c = doc.data().commentCount;
    	threadRef.update({
    		commentCount : c+1,
    		mostRecentPost : ts
    	});
    //Scroll to top:
    $('#superField').animate({
        scrollTop: 0
      }, 400);
    });
	})
	.catch(function(error) {
	    console.error("Error adding document: ", error);
	});
}

//Main input button

function mainButtonClick(){
	if ($("#comInput").val().trim()!=""){
		if (focusedId==""){
			comment($("#comInput").val());
			$("#comInput").val("");
			minimizeInputDiv();
		}
		else {
			subComment($("#comInput").val(), focusedId.slice(0, focusedId.length-6));
			$("#comInput").val("");
			$("#"+focusedId.slice(0, focusedId.length-6)).css("background-color","#fff");
    		minimizeInputDiv();
		}
	}
}

//Add subComment

function subComment(t, commentID){
	var date = new Date();
	var ts = firebase.firestore.Timestamp.fromDate(date);
	commentsRef.doc(commentID).collection("subComments").add({
		text: t,
		timestamp: ts,
		from: userRef,
		usersWhoLiked: null
	})
	.then(function(docRef) {
    	console.log("Document written with ID: ", docRef.id);
    	commentsRef.doc(commentID).get().then(function(doc){
	    	var c = doc.data().commentCount;
	    	commentsRef.doc(commentID).update({
	    		commentCount : c+1,
	    		mostRecentPost : ts
	    	});
	    });
	    threadRef.get().then(function(doc){
	    	var cc = doc.data().commentCount;
	    	threadRef.update({
	    		commentCount : cc+1
	    	});
	    });
    	$('#superField').animate({
	        scrollTop: $('#superField').scrollTop() + $("#"+focusedId).offset().top-$("#inputDiv").offset().top+200
	     }, 400);
    	focusedId = "";
	})
	.catch(function(error) {
	    console.error("Error adding document: ", error);
	});
}

//Subordinate input button

function secondaryButtonClick(commentID){
	if ($("#"+commentID+"-input").val().trim()!=""){
		subComment($("#"+commentID+"-input").val(),commentID);
		$("#"+commentID+"-input").val("");
	}
}

//LIKES

function mainLikeButton(){
	if ($("#mainLike").hasClass("liked")){//user already liked thread; is unliking it
		unlikeAnything(threadRef,userRef);
		$("#mainLike").removeClass("liked");
	}
	else{//user is liking thread
		likeAnything(threadRef,userRef);
		$("#mainLike").addClass("liked");
	}
}

function commentLikeButton(id){
	commentRef = commentsRef.doc(id);
	if ($("#"+id+"-likebtn").hasClass("liked")){//user already liked; is unliking it
		unlikeAnything(commentRef,userRef);
		$("#"+id+"-likebtn").removeClass("liked");
	}
	else{//user is liking 
		likeAnything(commentRef,userRef);
		$("#"+id+"-likebtn").addClass("liked");
	}
}

function subCommentLikeButton(mainID, subID){
	commentRef = commentsRef.doc(mainID).collection("subComments").doc(subID);
	if ($("#"+subID+"-likebtn").hasClass("liked")){//user already liked; is unliking it
		unlikeAnything(commentRef,userRef);
		$("#"+subID+"-likebtn").removeClass("liked");
	}
	else{//user is liking 
		likeAnything(commentRef,userRef);
		$("#"+subID+"-likebtn").addClass("liked");
	}
}

//DELETING 

function deleteThisThread(){
    if (confirm("Are you sure you would like to delete this forum?")){
        forumRef.doc(forumID).collection('threads').doc(threadID).delete().then(function() {
            console.log("Forum successfully deleted!");
            window.history.back();
        }).catch(function(error) {
            console.error("Error removing forum: ", error);
        });
    }
    else {
        toggleDelete();
    }
}
//Fake-delete comments

function deleteComment(cID){
	if (confirm("Are you sure you would like to delete this comment?")){
		//TODO: Add Hebrew
		commentsRef.doc(cID).update({
		    text: "🚫This message has been deleted🚫"
		    //TODO: Add Hebrew
		})
		.then(function() {
		    console.log("Msg successfully deleted");
		})
		.catch(function(error) {
		    // The document probably doesn't exist.
		    console.error("Error deleting msg: ", error);
		});
	}
}

function deleteSubComment(cID, scID){
	if (confirm("Are you sure you would like to delete this comment?")){
		//TODO: Add Hebrew
		commentsRef.doc(cID).collection('subComments').doc(scID).update({
		    text: "🚫This message has been deleted🚫"
		    //TODO: Add Hebrew
		})
		.then(function() {
		    console.log("Msg successfully deleted");
		})
		.catch(function(error) {
		    // The document probably doesn't exist.
		    console.error("Error deleting msg: ", error);
		});	
	}
}
//TODO: actually delete whole threads

//STRUCTURE GENERATION

function getMainCommentAsElement(doc){
	var data = doc.data();
	var mine = data.from.id===uEmail;
	var authName = data.from.id;
	if (!mine){
		if (displayNameDict[data.from.id]==null){
			firebase.firestore().collection("users").doc(data.from.id).get()
				.then(function(uDoc){
					//console.log(uDoc.data());
					if (uDoc.exists){
						var e = data.from.id;
						var n = uDoc.data().displayName;
						displayNameDict[e] = n;
						$("."+e.replace(/@|\./g, "")).text(n);
						sessionStorage.setItem("displayNameDict", JSON.stringify(displayNameDict));
					}
				});
		} else {
			var authName = displayNameDict[data.from.id];
		}
	}
	var commentClass = (mine) ? "yourCom" : "theirCom";
	var deleteBtn = (mine||isAdmin()) ? getDeleteButton(doc.id) : "";
	var username = (mine) ? "את\\ה" : authName;
	var likeCount = (data.usersWhoLiked===null) ? 0 : data.usersWhoLiked.length;
	var liked = didUserLike(doc,userRef.id) ? " liked" : " ";
	return "<div class=\""+commentClass+"Field\"  id=\""+doc.id+"\">\
				<div class=\""+commentClass+"\">\
					<div class=\"midDiv mainCommentMidDiv\" id=\"mid-"+doc.id+"\">\
									"+deleteBtn+"\
									<span class=\"userName "+username.replace(/@|\./g, '')+"\">"+username+"</span><br>\
								</div>\
					<img id=\"profilePhoto\" src=\"genericProfileImg.png\">\
					<span class=\"comText\" id=\""+doc.id+"-text\">"+data.text+"</span>\
					<div class=\"infoDiv\">\
						<button class=\"likeBtn "+liked+"\" id=\""+doc.id+"-likebtn\" onclick=\"commentLikeButton(\'"+doc.id+"\')\"><i class=\"material-icons\">thumb_up_alt</i></button>\
						<div class=\'infoText\'>\
							<span class=\"timeStamp\">"+timeConverter(data.timestamp.toDate())+"</span>\
							<i class=\"material-icons\">thumb_up_alt</i>\
							<span class=\"likeNum\" id=\""+doc.id+"-likeCount\">"+likeCount+"</span>\
							<i class=\"material-icons\">chat_bubble</i>\
							<span class=\"comNum\" id=\""+doc.id+"-commentCount\">"+data.commentCount+"</span>\
						</div>\
					</div>\
				</div>\
				<div class=\"comSpace\" id=\""+doc.id+"-com\"></div>\
				<div class=\"comSpace\" >\
					<div class=\"postComDiv\">\
						<textarea name=\"text\" class=\"comInput2\" id=\""+doc.id+"-input\" placeholder=\"הגיבו כאן\"></textarea>\
						<!--\
						<button id=\"sendCom\" onclick=\"secondaryButtonClick(\'"+doc.id+"\')\">\
							<img src=\"sendImg.png\">\
						</button>\
						-->\
					</div>\
				</div>\
			</div>"
}

function getSubCommentAsElement(doc){
	var data = doc.data();
	var mine = data.from.id===uEmail;
	var authName = data.from.id;
	if (!mine){
		if (displayNameDict[data.from.id]==null){
			firebase.firestore().collection("users").doc(data.from.id).get()
				.then(function(uDoc){
					//console.log(uDoc.data());
					if (uDoc.exists){
						var e = data.from.id;
						var n = uDoc.data().displayName;
						displayNameDict[e] = n;
						$("."+e.replace(/@|\./g, "")).text(n);
						sessionStorage.setItem("displayNameDict", JSON.stringify(displayNameDict));
					}
				});
		} else {
			var authName = displayNameDict[data.from.id];
		}
	}
	var commentClass = (mine) ? "yourCom" : "theirCom";
	var username = (mine) ? "את\\ה" : authName;
	var likeCount = (data.usersWhoLiked===null) ? 0 : data.usersWhoLiked.length;
	var deleteBtn = (mine||isAdmin()) ? getSubDeleteButton(doc.ref.parent.parent.id,doc.id) : "";
	var liked = didUserLike(doc,userRef.id) ? " liked" : " ";
	return "<div class=\""+commentClass+"\" id=\""+doc.id+"\">\
					<div class=\"midDiv\">\
									"+deleteBtn+"\
									<span class=\"userName "+username.replace(/@|\./g, '')+"\">"+username+"</span><br>\
								</div>\
					<img id=\"profilePhoto\" src=\"genericProfileImg.png\">\
					<span class=\"comText\" id=\""+doc.id+"-text\">"+data.text+"</span>\
					<div class=\"infoDiv\">\
						<button class=\"likeBtn "+liked+"\"  id=\""+doc.id+"-likebtn\" onclick=\"subCommentLikeButton(\'"+doc.ref.parent.parent.id+"\',\'"+doc.id+"\')\"><i class=\"material-icons\">thumb_up_alt</i></button>\
						<div class=\'infoText\'>\
							<span class=\"timeStamp\">"+timeConverter(data.timestamp.toDate())+"</span>\
							<i class=\"material-icons\">thumb_up_alt</i>\
							<span class=\"likeNum\" id=\""+doc.id+"-likeCount\">"+likeCount+"</span>\
						</div>\
					</div>\
			</div>"
}

function getDeleteButton(cID){
	return "<button class=\"deleteBtn\" onclick=\"deleteComment(\'"+cID+"\')\"><i class=\"material-icons\">delete</i></button>";
}

function getSubDeleteButton(cID, scID){
	return "<button class=\"deleteBtn\" onclick=\"deleteSubComment(\'"+cID+"\',\'"+scID+"\')\"><i class=\"material-icons\">delete</i></button>";
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

//UX & USABILITY:

//Facebook style subcomments
$(document).on('click',"div",function(event){
	//console.log(this);
	if (this.id=="inputDiv"){
		event.stopPropagation();
	}
	else if (($(this).is(".theirCom:first-child") && !$(this).parent().hasClass("comSpace") )||($(this).is(".yourCom:first-child")) && !$(this).parent().hasClass("comSpace") ){
		//collapse subcomments when main comment is clicked
		event.stopPropagation();
		//console.log("first child of com field "+$(this).parent()[0].id+" clicked");
		//console.log($(".comSpace#"+$(this).parent()[0].id+"-com"));
		var ccid = $(this).parent()[0].id;
		$(".comSpace#"+ccid+"-com .yourCom").toggle(100, function(){
			//console.log($(".comSpace#"+ccid+"-com div").css("display"));
			//Add shadow to collapsed comment threads
			if ($(".comSpace#"+ccid+"-com div").css("display")==="none"){
				//console.log($(this).parent().parent().children(0).eq(0));
				$(this).parent().parent().children(0).eq(0).css("box-shadow","2px 4px 30px #cccccc");
			} else {
				$(this).parent().parent().children(0).eq(0).css("box-shadow","");
			}
		});
		$(".comSpace#"+ccid+"-com .theirCom").toggle(100, function(){
			//console.log($(".comSpace#"+ccid+"-com div").css("display"));
			//Add shadow to collapsed comment threads
			if ($(".comSpace#"+ccid+"-com div").css("display")==="none"){
				//console.log($(this).parent().parent().children(0).eq(0));
				$(this).parent().parent().children(0).eq(0).css("box-shadow","2px 4px 30px #cccccc");
			} else {
				$(this).parent().parent().children(0).eq(0).css("box-shadow","");
			}
		});
		
		
	}
	else{
	    if ($(this).hasClass("postComDiv")){
	  		event.stopPropagation();
	    	var x = $(this).children()[0];
	    	//console.log(x);
	    	setTimeout(function() { $('#comInput').focus() }, 10);
	    	$('#superField').animate({
	        	scrollTop: $('#superField').scrollTop() + $(x).offset().top-$("#inputDiv").offset().top+200
	      	}, 400);
	    	newFocus(x.id);
	    }
	    else if (focusedId!==""){
	    	//console.log('hey');
	    	$("#"+focusedId.slice(0, focusedId.length-6)).css("background-color","#fff");
	    	focusedId = "";
	    }
	}
	
});
/*
$(document).on('focusin', '.comInput2', function () {
    //$("#inputDiv").hide();
    //$("#superField").css("height",'100%');

    //Scroll to clicked comInput2
    $('#superField').animate({
        scrollTop: $('#superField').scrollTop() + $(this).offset().top-$("#inputDiv").offset().top+200
      }, 400);

    setTimeout(function() { $('#comInput').focus() }, 100);
    newFocus(this.id);
});
*/
/*
var tempFocus = "";
$(document).on('focusout', "#comInput",function () {
    //$("#inputDiv").show();
    //$("#superField").css("height",'90%');
    tempFocus = focusedId;
    if (focusedId!==""){
    	$("#"+focusedId.slice(0, focusedId.length-6)).css("background-color","#fff");
    	focusedId = "";
    }
});
*/


var focusedId = "";

function newFocus(inputId){
	//tempFocus = "";
	if (focusedId!==""){
		$("#"+focusedId.slice(0, focusedId.length-6)).css("background-color","#fff");
	}
	focusedId = inputId;
	$("#"+inputId.slice(0, inputId.length-6)).css("background-color","#def");
}

//Exapand the textarea to fit innerText:
$( document ).ready(function() {
    minimizeInputDiv();
	$("#comInput").keyup(function(event){
		//console.log(event);
		if (($('#comInput')[0].scrollHeight-20)>($('#comInput').height())){
			inputDivHeight+=1.5;
			$('#comInput')[0].style.height=inputDivHeight+"em";
		}
		if ($('#comInput').val()===""){
			minimizeInputDiv();
		}
	});
});
	
function minimizeInputDiv(){
	inputDivHeight = 1.5;
	$('#comInput')[0].style.height=inputDivHeight+"em";
}
