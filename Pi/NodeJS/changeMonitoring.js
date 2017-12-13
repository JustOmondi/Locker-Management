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

// Authenticating into firebase database
var admin = require("firebase-admin");
var serviceAccount = require("/home/pi/piServer/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://locker-management-1be92.firebaseio.com"
});

// Obtaining database references
var db = admin.database();
var ref = db.ref("/");

// Get the data on a post that has changed
ref.on("child_changed", function(snap) {
  var changedLock = snap.val();

  // Respond on lock status
  if (changedLock.lockStatus == 1) {
    if (shell.exec(pythonUnlockCode).code !== 0) {
      console.log("Unlock shell script error.");
    }
  } else if (changedLock.lockStatus == 0) {
    if (shell.exec(pythonLockCode).code !== 0) {
      console.log("Lock shell script error.");
    }
  }
});

// Faulty reference edit
function setLockOn(ref) {
  var updates = {};
  // Add changes to update list and push to database
  updates["/lockStatus"] = 1;
  database.ref('lock').update(updates);

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