// Variables for shell execution
var shell = require('shelljs');
var pythonLockCode = './header.py 0';
var pythonUnlockCode = './header.py 1';

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

//var newLock = "autoCreatedLock";


//console.log(ref)

console.log("Reached script end");
