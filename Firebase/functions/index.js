const functions = require('firebase-functions');

const admin = require('firebase-admin')
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

admin.initializeApp(functions.config().firebase);

exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

exports.lock = functions.https.onRequest((request, response) => {
    admin.database().ref('/lock').set({lockstatus: 1});
    response.send("1");
});

exports.unlock = functions.https.onRequest((request, response) => {
    admin.database().ref('/lock').set({lockstatus: 0});
    response.send("0");
});

exports.unlockWithTimeout = functions.https.onRequest((request, response) => {
    admin.database().ref('/lock').set({lockstatus: 0});
    response.send("0");

    //Code that enables auto lock after timeout, retrofitted from nodejs, still needs testing
    admin.database().ref('/lock').on("value", function(snapshot) {
      console.log(snapshot.time_out());

      if (snapshot.time_out() != -1) {
        setTimeout(function() {
          admin.database().ref('/lock').set({lockstatus: 1});
        }, snapshot.time_out());
      }

    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

});

exports.addMessage = functions.https.onRequest((req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
// Push the new message into the Realtime Database using the Firebase Admin SDK.
    admin.database().ref('/messages').push({original: original}).then(snapshot => {res.redirect(303, snapshot.ref);
});
});
