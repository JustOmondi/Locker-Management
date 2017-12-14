// Authenticating into firebase database
var admin = require("firebase-admin");
var serviceAccount = require("/home/alienadmin/Desktop/Locker-Management/Pi/NodeJS/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://locker-management-1be92.firebaseio.com"
});

// Connecting to fiebase database and obtaining references
var db = admin.database();
var ref = db.ref("/");
var usersRef = db.ref("/Users/")
var locksRef = db.ref("/testZone/locks/")

// Function that's called upon a user change
usersRef.on("child_added", function(snapshot, prevChildKey) {
  var newUser = snapshot.val();
  console.log("key:" + snapshot.key);
});

// Monitor for changes in users, push lock updates to locks
usersRef.on("child_changed", function(snapshot) {

});

function runTests() {

}

// Indicates parsing of javascript file
console.log("nodejs_testground.js loaded");

runTests();