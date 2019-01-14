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
		    timestamp: firebase.firestore.Timestamp.fromDate(date.getTime())
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

//sidemenu
$("#toggleMenu").click(function(){
	if($("#mainMenu").css('width') < '80%') {
		$("#mainMenu").animate({width: '80%'});
	}
});
$("#backBtn").click(function(){
	if($("#mainMenu").css('width') > '0') {
		$("#mainMenu").animate({width: '0'});
	}
});

//addForum("Testing", firebase.firestore().collection("users").doc("jyudel@gmail.com"));