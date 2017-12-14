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

// The lock queue
var lockQueue = ["lock3", "lock4", "lock5", "lock6"];
// Local Database
// var localDatabase = {
//   "locks": [{
//       "userID": "user0",
//       "lockID": "lock0",
//       "lockStatus": "0"
//     }
//   ]
// };
var localDatabase = {
  "locks": []
};

// Function that's called upon a user change
usersRef.on("child_added", function(snapshot, prevChildKey) {
  var newUser = snapshot.val();

  console.log("Entry added = userID:" + snapshot.key);

  if (lockQueue.length > 0) {
    localDatabase.locks.push({
      "userID": snapshot.key,
      "lockID": lockQueue.shift(),
      "lockStatus": 0
    });
  } else {
    localDatabase.locks.push({
      "userID": snapshot.key,
      "lockID": "null",
      "lockStatus": 0
    });
  }

  console.log("Flushing entry to firebase")
  flushEntry(localDatabase.locks[localDatabase.locks.length - 1]);

});

// Monitor for changes in users, push lock updates to locks
usersRef.on("child_changed", function(snapshot) {
  var changedUser = snapshot.val();

  console.log("User change detected");
  console.log("Searching local database for: " + snapshot.key);

  // Find entry in local database
  var result = findDatabaseIndex(snapshot.key);
  if (result >= 0) {
    console.log("Entry found at index: " + result)
    var localDBEntry = localDatabase.locks[result];

    // Test if lockID changed
    if (changedUser.lockID != localDBEntry.lockID) {
      console.log("LockID changed from " + localDBEntry.lockID + " to " + changedUser.lockID);
      lockQueue.push(localDBEntry.lockID);
      localDBEntry.lockID = "null";
    }
    // Test if lock status changed
    if (changedUser.lockStatus != localDBEntry.lockStatus) {
      console.log("Lock status change detected, new state: " + changedUser.lockStatus);

      // Change lock and modify status on server
      if (changedUser.lockStatus == 1) {
        localDatabase.locks[result].lockStatus = 0;
      } else if (changedUser.lockStatus == 2) {
        localDatabase.locks[result].lockStatus = 3;
      } else {
        console.log("Lock state error detected");
      }
      flushEntry(localDatabase.locks[result]);
    }

  } else { // User not found
    console.log(snapshot.key + " not found in localDatabase");
  }
});

// Flushes an localDBEntry to the firebase database
function flushEntry(userData) {

  console.log("Uploading: " + JSON.stringify(userData));
  // Selecting reference to entry being modified
  userRef = db.ref("/Users/" + userData.userID);

  // Compiling data to be sent
  userRef.update({
    "lockID": userData.lockID,
    "lockStatus": userData.lockStatus
  });
  // Sending data
}

// Flushed
function flushData() {
  // Flushing to the users subtree database
  for (i in localDatabase.locks) {
    userRef = db.ref("/Users/" + localDatabase.locks[i].userID);

    userRef.update({
      "lockID": localDatabase.locks[i].lockID,
      "lockStatus": localDatabase.locks[i].lockStatus
    });
  }
}

// Searches for the index in localDB which contains given userID
function findDatabaseIndex(searchVal) {
  for (var i = 0; i < localDatabase.locks.length; i++) {
    console.log("Comparing")
    console.log(searchVal + " :: " + localDatabase.locks[i].userID);
    if (localDatabase.locks[i].userID == searchVal) {
      return i;
    }
  }
  return -1;
}

function runTests() {
  console.log("Starting tests");
  console.log("Pulling database")
  print_local_db();
}

function print_local_db() {
  console.log(JSON.stringify(localDatabase));
}

// Indicates parsing of javascript file
console.log("nodejs_testground.js loaded");

runTests();