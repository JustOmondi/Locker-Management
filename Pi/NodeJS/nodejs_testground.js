// Authenticating into firebase database
var admin = require("firebase-admin");
var serviceAccount = require("/home/pi/piServer/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://locker-management-1be92.firebaseio.com"
});

// Connecting to fiebase database and obtaining references
var db = admin.database();
var ref = db.ref("/");
var usersRef = db.ref("/testZone/users/")
var locksRef = db.ref("/testZone/locks/")

// The lock queue
var lockQueue = ["lock3", "lock4", "lock5", "lock6"];
// Local Database
var localDatabase = {
  "locks": [{
      "userID": "user0",
      "lockID": "lock0",
      "unlocked": "0"
    },
    {
      "userID": "user1",
      "lockID": "lock1",
      "unlocked": "0"
    },
    {
      "userID": "user2",
      "lockID": "lock2",
      "unlocked": "0"
    }
  ]
};

// Function that's called upon a user change
usersRef.on("child_added", function(snapshot, prevChildKey) {
  var newUser = snapshot.val();
  if (lockQueue.length > 0) {
    localDatabase.locks.push({
      "userID": snapshot.key,
      "lockID": lockQueue.shift(),
      "unlocked": 0
    });
  } else {
    localDatabase.locks.push({
      "userID": snapshot.key,
      "lockID": "null",
      "unlocked": 0
    });
  }
});

// Monitor for changes in users, push lock updates to locks
usersRef.on("child_changed", function(snap) {
  var changedUser = snap.val();

  console.log("User change detected");
  console.log("Searching local database for: " + changedUser.userID);

  // Find entry in local database
  var result = findDatabaseIndex(changedUser.userID);
  if (result > 0) {
    var localDBEntry = localDatabase.locks[result];

    // Test if lockID changed
    if (changedUser.lockID != localDBEntry.lockID) {
      console.log("LockID changed from " + localDBEntry.lockID + " to " + changedUser.lockID);
      lockQueue.push(localDBEntry.lockID);
      localDBEntry.lockID = "null";
    }
    // Test if lock status changed
    if (changedUser.unlocked != localDBEntry.unlocked) {
      console.log("Lock status change detected, new state: " + changedUser.unlocked);
      localDatabase.locks[i].unlocked = changedUser.unlocked;
    }

  } else { // User not found
    console.log(changedUser.userID + " not found in localDatabase");
  }
});

// Flushes an localDBEntry to the firebase database
function flushEntry(userData) {
  // Selecting reference to entry being modified
  userRef = db.ref("/users/" + userData.userID);

  // Compiling data to be sent
  var subData = []
  subData["/lockID"] = userData.lockID;
  subData["/unlocked"] = userData.unlocked;

  // Sending data
  userRef.update(subData);
}

// Flushed
function flushData() {

  // Flushing to the users subtree database
  for (i in localDatabase.locks) {
    userRef = db.ref("/users/" + localDatabase.locks[i].userID);

    var subData = []
    subData["/lockID"] = localDatabase.locks[i].lockID;
    subData["/unlocked"] = localDatabase.locks[i].unlocked;
    userRef.update(subData);
  }
}

// Searches for the index in localDB which contains given userID
function findDatabaseIndex(searchVal) {
  for (var i = 0; i < localDatabase.locks.length; i++) {
    if (localDatabase.locks[i].userID == searchVal) {
      return i;
    }
  }
  return -1;
}

// Indicates parsing of javascript file
console.log("nodejs_testground.js loaded");