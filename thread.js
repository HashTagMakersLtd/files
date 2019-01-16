var forumID = get("forumID");
var threadID = get("threadID");

var threadRef = firebase.firestore().collection("forums").doc(forumID).collection("threads").doc(threadID);

//Initialize header

threadRef.get()
	.then(function(doc){
		console.log("Initialize title")
	})
		
//Commenting

//get userRef
firebase.auth().onAuthStateChanged(function(user){
	if (user) { // User is signed in!
		userRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser.email);
	}
});