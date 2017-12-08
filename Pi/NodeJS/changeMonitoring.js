// Variables for shell execution
var shell = require('shelljs');
var pythonLockCode = './header.py 1';
var pythonUnlockCode = './header.py 0';

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

  if (changedLock.lockStatus == 0) {
    if (shell.exec(pythonUnlockCode).code !== 0) {
      console.log("Unlock script error.");
    }
    //setTimeout(setLockOn(changedLock), changedLock.time_out * 1000);
  } else if (changedLock.lockStatus == 1) {
    if (shell.exec(pythonLockCode).code !== 0) {
      console.log("Lock script error.");
    }
  }
});

//Faulty reference edit
function setLockOn(ref) {
  ref.child('lockStatus').set(1);
}

//var newLock = "autoCreatedLock";


//console.log(ref)

console.log("Reached script end");
