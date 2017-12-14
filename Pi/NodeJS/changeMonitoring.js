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

// Variables for shell execution
var shell = require('shelljs');

// Shell string compiling for python motor script
var pythonLockDir = '/home/pi/piServer/header.py'
var pythonLockCode = pythonLockDir + ' 0';
var pythonUnlockCode = pythonLockDir + ' 1';

// Shell string compiling for the led python script
var ledDir = '/home/pi/piServer/led.py'
var onLed = ledDir + ' 1'
var blinkLed = ledDir + ' 2'
var offLed = ledDir + ' 3'

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

    // Test if lockID changed - Future function
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

// Flushes complete database
function flushData() {
  // Flushing to the users subtree database
  for (i in localDatabase.locks) {
    flushEntry(localDatabase.locks[i]);
  }
}

// Searches for the index in localDB which contains given userID
function findDatabaseIndex(searchVal) {
  for (var i = 0; i < localDatabase.locks.length; i++) {
    // console.log("Comparing")
    // console.log(searchVal + " :: " + localDatabase.locks[i].userID);
    if (localDatabase.locks[i].userID == searchVal) {
      return i;
    }
  }
  return -1;
}

function print_local_db() {
  console.log(JSON.stringify(localDatabase));
}

// Function that responds on connection status to firebase
var connectedRef = db.ref(".info/connected");
connectedRef.on("value", function(snap) {
  if (snap.val() === true) {
    connectedSetup();
  } else {
    unconnectedSetup();
  }
});

// Executed on connection aquired to firebase
function connectedSetup() {
  if (shell.exec(onLed).code !== 0) {
    console.log('On LED error');
  }
  console.log("connected");
}

// Executed on connection lost to firebase
function unconnectedSetup() {
  if (shell.exec(offLed).code !== 0) {
    console.log('Off LED error');
  }
  console.log("not connected");
}

// Indicates parsing of javascript file
console.log("changeMonitoring.js loaded");