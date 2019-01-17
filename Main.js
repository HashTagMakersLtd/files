//Populate the forumList with all the forums

var forumRef = firebase.firestore().collection("forums");

forumRef.get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            $("#forumList").append("<button class='forumBtn'><a href='forum.html?id="+doc.id+"'>"+doc.data().name+"</a></button><br>");
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });