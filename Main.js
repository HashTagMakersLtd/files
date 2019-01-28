//Populate the forumList with all the forums
var deleteToggled = false;

var forumRef = firebase.firestore().collection("forums");

forumRef.orderBy("name","desc").onSnapshot(function(querySnapshot) {
    $("#forumList").html("");
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            //console.log(doc.id, " => ", doc.data());
            
            $("#forumList").append("<div  id=\""+doc.id+"\" class=\"outerDiv\"><button class='forumBtn'><a href='forum.html?id="+doc.id+"'>"+doc.data().name+"</a></button></div><br>");
        });
    }, function(error) {
        console.log("Error getting documents: ", error);
    });

//Show extra options if user is an admin:
firebase.auth().onAuthStateChanged(function(user){
    if (user) { // User is signed in!
        userRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser.email);
        userRef.get().then(function(doc) {
            //console.log(doc);
            if (!doc.exists) {
                userRef.set({
                    admin : false,
                    starred: [],
                    displayName : user.displayName,
                    photoUrl : user.photoURL
                })
                .then(function() {
                    //console.log("User successfully created!");
                    $("#profilePhoto")[0].src=user.photoURL;
                })
                .catch(function(error) {
                    console.error("Error creating user: ", error);
                });
            } 
            else{
                //console.log("Returning user");
                $("#profilePhoto")[0].src=user.photoURL;
                if(doc.data().admin==true){
                    $(".btn").css("display","block");
                    $("#forumField").css("height","50%");
                }
            }
        }).catch(function(error) {
            console.log("Error finding user:", error);
        });
    }
});
//Show delete buttons if you click the delete button
function toggleDelete(){
    //console.log("delete");
    if (deleteToggled){
        $(".deleteBtn").remove();
        deleteToggled = false;
    }
    else{
        var forumList = $(".outerDiv");
        for (var i = 0; i<forumList.length; i++){
            forumList.eq(i).prepend(("<button class=\"deleteBtn\" onclick=\"deleteForum(\'"+forumList[i].id+"\')\"><i class=\"material-icons\">delete</i></button>"));
        }
        deleteToggled = true;
    }
}

function deleteForum(id){
    //if (confirm("Are you sure you would like to delete this hub?")){
    if (confirm("בטוח שתרצו למחוק את החדר?")){
        forumRef.doc(id).delete().then(function() {
            //console.log("Forum successfully deleted!");
        }).catch(function(error) {
            console.error("Error removing hub : ", error);
        });
    }
    else {
        toggleDelete()
    }
}

//Add a new forum if you click the create button
function newForum(){
    //console.log('create');
    //var Name = prompt("What should be the name of the hub?");
    var Name = prompt("איך תרצו לקרוא לחדר החדש?");
    if (Name==null){return;}
    firebase.firestore().collection("forums").add({
        name: Name
    })
    .then(function(docRef) {
        //console.log("Document written with ID: ", docRef.id);
        var date = new Date();
        var ts = firebase.firestore.Timestamp.fromDate(date);
        docRef.collection("threads").add({
            from: userRef,
            //name: "Welcome to the "+Name+" hub!",
            name: "ברוכים הבאים לקטגוריה:"+Name+"!",
            timestamp: ts,
            mostRecentPost: ts,
            commentCount: 0,
            usersWhoLiked: [userRef]
        })
        .catch(function(error) {
            console.error("Error creating thread: ", error);
            //TODO: Inform user
        });
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
}
