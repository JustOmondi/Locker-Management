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

// Variables for shell execution
var shell = require('shelljs');
var pythonDir = '/home/pi/piServer/python/'

// Shell string compiling for python motor script
var pythonLockDir = pythonDir + 'header.py'
var pythonLockCode = pythonLockDir + ' 0';
var pythonUnlockCode = pythonLockDir + ' 1';

// Shell string compiling for the led python script
var ledDir = pythonDir + 'led.py'
var onLed = ledDir + ' 1'
var blinkLed = ledDir + ' 2'
var offLed = ledDir + ' 3'

// Local Database Entry Example
// var localDatabase = {
//   "locks": [{"userID": "user0", "lockID": "lock0", "lockStatus": "0"}]
// };
var lockQueue = ["lock0", "lock1", "lock2", "lock3", "lock4", "lock5", "lock6"];
var localDatabase = {
  "locks": []
};

// Function that's called upon a user change
usersRef.on("child_added", function(snapshot, prevChildKey) {
  var newUser = snapshot.val();

  console.log("Entry added = userID:" + snapshot.key);

  // Create entry for localDB
  var lockName = "null";
  if (lockQueue.length > 0) {
    lockName = lockQueue.shift();
  }
  localDatabase.locks.push({
    "userID": snapshot.key,
    "lockID": lockName,
    "lockStatus": 0
  });

  console.log("Flushing entry to firebase")
  // Flushes newly created entry
  flushEntry(localDatabase.locks[localDatabase.locks.length - 1]);
});

// Monitor for changes in users, push lock updates to locks
usersRef.on("child_changed", function(snapshot) {
  var changedUser = snapshot.val();

  console.log("User change detected");
  console.log("Searching local database for: " + snapshot.key);

  // Find entry in local database
  var result = findDatabaseIndex(snapshot.key);
  console.log("Entry found at index: " + result)
  if (result >= 0) {
    var localDBEntry = localDatabase.locks[result];

    // Test if lockID changed - Future function
    if (changedUser.lockID != localDBEntry.lockID) {

      console.log("LockID changed from " + localDBEntry.lockID + " to " + changedUser.lockID);

      // Release lock into queue
      if (changedUser.lockID == "null") {
        lockQueue.push(localDBEntry.lockID);
        localDBEntry.lockID = "null";

        // Request new lock from queue
      } else if (changedUser.lockID == "req") {
        var lockName = "null";
        if (lockQueue.length > 0) {
          lockName = lockQueue.shift();
        }
        localDBEntry.lockID = lockName;
      }
    }
    // Test if lock status changed
    if (changedUser.lockStatus != localDBEntry.lockStatus) {
      console.log("Lock status change detected, new state: " + changedUser.lockStatus);

      // Change lock and modify status on server
      if (changedUser.lockStatus == 1) {
        localDatabase.locks[result].lockStatus = 0;
        flushEntry(localDatabase.locks[result]);
      } else if (changedUser.lockStatus == 2) {
        localDatabase.locks[result].lockStatus = 3;
        flushEntry(localDatabase.locks[result]);
      } else {
        console.log("Lock state error detected");
      }
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