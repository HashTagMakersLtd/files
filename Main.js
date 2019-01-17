//Populate the forumList with all the forums

var forumRef = firebase.firestore().collection("forums");

forumRef.get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            $("#forumList").append("<button class='forumBtn' id=\""+doc.id+"\"><a href='forum.html?id="+doc.id+"'>"+doc.data().name+"</a></button><br>");
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

//Show extra options if user is an admin:
firebase.auth().onAuthStateChanged(function(user){
    if (user) { // User is signed in!
        userRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser.email);
        userRef.get().then(function(doc){
            if(doc.data().admin==true){
                $(".btn").css("display","block");
            }
        });
    }
});
//Show delete buttons if you click the delete button
function toggleDelete(){
    console.log("delete");
}

//Add a new forum if you click the create button
function newForum(){
    console.log('create');
}
