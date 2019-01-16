//Populate the forumList with all the forums

var forumRef = firebase.firestore().collection("forums");

forumRef.get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            $("#forumList").append("<li id="+doc.id+"><div class='btnOut'><div class='btnIn'><a href='forum.html?id="+doc.id+"'>"+doc.data().name+"</a></div></div></li><br>")
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });