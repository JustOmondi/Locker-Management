var admin = require("firebase-admin");

var serviceAccount = require("/home/alienadmin/firebase_nodejs/serviceAccountKey.json");

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
//  console.log("The updated lock status is " + changedLock.lockstatus);
  reactOnLockState(changedLock.lockstatus);
});

var shell = require('shelljs');
var pythonLockCode = 'python lock.py'
var pythonUnlockCode = 'python unlock.py'

function reactOnLockState(lockState) {
    if (lockState == 0) {
	    if (shell.exec(pythonUnlockCode).code !== 0) {
            shell.exit(1);
        }
        console.log("Unlocking Lock");
    } else {
        if (shell.exec(pythonLockCode).code !== 0) {
            shell.exit(1);
        }
        console.log("Locking Lock");
    }            // The function returns the product of p1 and p2
}

//var newLock = "autoCreatedLock";
//ref.child('testLock').set('-100')

//console.log(ref)

console.log("Reached script end");

