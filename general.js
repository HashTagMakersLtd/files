function addForum(Name, From){
	firebase.firestore().collection("forums").add({
    	name: Name
	})
	.then(function(docRef) {
	    console.log("Document written with ID: ", docRef.id);
	    var date = new Date();
	    docRef.collection("genChat").add({
		    from: From,
		    text: "Welcome to the chat for the "+Name+" forum!",
		    timestamp: date.getTime()
		})
		.then(function(docRef) {
		    console.log("General chat initialized");
		})
		.catch(function(error) {
		    console.error("Error initializing chat: ", error);
		});
	})
	.catch(function(error) {
	    console.error("Error adding document: ", error);
	});
}

addForum("Testing", firebase.firestore().collection("users").doc("jyudel@gmail.com"))l;