//Useful references
var button = $("#")

//Functions

function signOut() {
  // Sign out of Firebase.
  firebase.auth().signOut();
}

function authStateObserver(user) {
	
	if (user) { // User is signed in!
		alert("Already logged in!")
	else {
		alert("Not logged in")
	}
 