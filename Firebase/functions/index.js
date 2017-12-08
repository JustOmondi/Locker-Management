const functions = require('firebase-functions');

const admin = require('firebase-admin')
const cors = require('cors')({origin: true});
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var app = admin.initializeApp(functions.config().firebase);

exports.lock = functions.https.onRequest((request, response) => {
    admin.database().ref('/lock').set({lockstatus: 1});
    response.send("1");
});

exports.unlock = functions.https.onRequest((request, response) => {
    admin.database().ref('/lock').set({lockstatus: 0});
    response.send("0");
});
