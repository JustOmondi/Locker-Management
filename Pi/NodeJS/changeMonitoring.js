// Variables for shell execution
var shell = require('shelljs');

var pythonLockDir = '/home/pi/piServer/header.py'
var pythonLockCode = pythonLockDir + ' 0';
var pythonUnlockCode = pythonLockDir + ' 1';

var ledDir = '/home/pi/piServer/led.py'
var onLed = ledDir + ' 1'
var blinkLed = ledDir + ' 2 &&'
var offLed = ledDir + ' 3'

// if (shell.exec(blinkLed).code !== 0) {
  // console.log('Pulsing LED error');
// }

// Authenticating into firebase database
var admin = require("firebase-admin");
var serviceAccount = require("/home/pi/piServer/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://locker-management-1be92.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("/");

//ref.once("value", function(snapshot) {
//  console.log(snapshot.val());
//});

// Get the data on a post that has changed
ref.on("child_changed", function(snap) {
  var changedLock = snap.val();
//  console.log("The updated lock status is " + changedLock.lockStatus);

  if (changedLock.lockStatus == 1) {
    if (shell.exec(pythonUnlockCode).code !== 0) {
      console.log("Unlock shell script error.");
    }
    //Commented out till final structure layout of firebase database
    // if (changedLock.time_out != -1) {
      // setTimeout(shell.exec(pythonLockCode), changedLock.time_out;
    // }
    //setTimeout(setLockOn(changedLock), changedLock.time_out * 1000);
  } else if (changedLock.lockStatus == 0) {
    if (shell.exec(pythonLockCode).code !== 0) {
      console.log("Lock shell script error.");
    }
  }
});

//Faulty reference edit
function setLockOn(ref) {
  var updates = {};
  //Add changes to update list and push to database
  updates["/lockStatus"] = 1;
  database.ref('lock').update(updates);

  // ref.child('lockStatus').set(1);
}

/* Code for cloud functions [untested]
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
*/

var connectedRef = db.ref(".info/connected");
connectedRef.on("value", function(snap) {
  if (snap.val() === true) {
    if (shell.exec(onLed).code !== 0) {
      console.log('On LED error');
    }
    console.log("connected");
  } else {
    if (shell.exec(offLed).code !== 0) {
      console.log('Off LED error');
    }
    console.log("not connected");
  }
});

console.log("Firebase Scripts loaded");
