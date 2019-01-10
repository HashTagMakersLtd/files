//Useful references
var button = $("#googleSI");

//Functions

function signOut() {
  // Sign out of Firebase.
  firebase.auth().signOut();
}

function initFirebaseAuth() {
  // Listen to auth state changes.
  firebase.auth().onAuthStateChanged(authStateObserver);
}

function signInWithGoogle(){//Signs in with Google
	var provider = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithRedirect(provider);
	firebase.auth().getRedirectResult().then(function(result) {//This gets the result of the redirected login
	  if (result.credential) {
	    // This gives you a Google Access Token. You can use it to access the Google API.
	    var token = result.credential.accessToken;
	  }
	  // The signed-in user info.
	  var user = result.user;
	  //TODO: add to database
	}).catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  // The email of the user's account used.
	  var email = error.email;
	  // The firebase.auth.AuthCredential type that was used.
	  var credential = error.credential;
	  console.log(errorMessage);
	});
}

function authStateObserver(user) {
	
	if (user) { // User is signed in!
		alert("Already logged in as "+firebase.auth().currentUser.displayName);
	} else {
		button.on("click", signInWithGoogle)
	}
}
 
initFirebaseAuth();