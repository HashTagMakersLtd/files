//Populate the forumList with all the forums

var forumRef = firebase.firestore().collection("forums");

forumRef.get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            $("#forumList").append("<li id="+doc.id+"><a href='chat.html?id="+doc.id+"'>"+doc.data().name+"</a><br><div class='border'></div></li>")
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });