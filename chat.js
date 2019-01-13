var id = get("id");

genChatRef = firebase.firestore().collection("forums").doc(id).collection("genChat");

genChatRef.get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
        });
    })
    .catch(function(error) {
        console.log("Error getting chat log: ", error);
    });