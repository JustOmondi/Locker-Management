// Authenticating into firebase database
var admin = require("firebase-admin");
var serviceAccount = require("/home/pi/piServer/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://locker-management-1be92.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("/");

var usersRef = db.ref("/testZone/users/")
var locksRef = db.ref("/testZone/locks/")

//Lock == 0, Unlock == 1
var lockQueue = ["lock3", "lock4", "lock5", "lock6"];
var localDatabase = {
  "locks": [
    { "userID":"user0", "lockID":"lock0", "unlocked":"0" },
    { "userID":"user1", "lockID":"lock1", "unlocked":"0" },
    { "userID":"user2", "lockID":"lock2", "unlocked":"0" }
  ]
};

usersRef.on("child_added", function(snapshot, prevChildKey) {
  var newUser = snapshot.val();
  if (lockQueue.length > 0) {
    localDatabase.locks.push({"userID":snapshot.key,"lockID":lockQueue.shift(),"unlocked":0});
  } else {
    localDatabase.locks.push({"userID":snapshot.key,"lockID":"null","unlocked":0});
  }

});

//Monitor for changes in users, push lock updates to locks
usersRef.on("child_changed", function(snap) {
  var changedUser = snap.val();

  var result = findDatabaseIndex(changedUser.userID);
  if (result > 0) {
    if (changedUser.lockID == "null") {
      lockQueue.push(changedUser.lockID);
      localDatabase.locks[i].lockID = "null";
    } else {
      if (changedUser.unlocked == 1) {
        localDatabase.locks[i].unlocked = "1";
      } else {
        localDatabase.locks[i].unlocked = "0";
      }
    }


  }
  //
//  console.log("The updated lock status is " + changedLock.lockStatus);
});

locksRef.on("child_changed", function(snap) {
  var changedLock = snap.val();
  console.log(snap);

cha

  if () {

  }

  // for(var i = 0; i < localDatabase.locks.length; i++)
  // {
  //   if(localDatabase.locks[i].userID == snap.val)
  //   {
  //     return localDatabase.locks[i].restaurant.name;
  //   }
  // }

});

function flushEntry(userData) {
  userRef = db.ref("/users/" + userData.userID);

  var subData = []
  subData["/lockID"] = userData.lockID;
  subData["/unlocked"] = userData.unlocked;
  userRef.update(subData);
}

function flushData() {

//Flushing to the users subtree database
  for (i in localDatabase.locks) {
    userRef = db.ref("/users/" + localDatabase.locks[i].userID);

    var subData = []
    subData["/lockID"] = localDatabase.locks[i].lockID;
    subData["/unlocked"] = localDatabase.locks[i].unlocked;
    userRef.update(subData);
  }

}

function findDatabaseIndex(var searchVal) {

  for(var i = 0; i < localDatabase.locks.length; i++)
  {
    if(localDatabase.locks[i].userID == searchVal)
    {
      return i;
    }
  }
  return -1;
}

console.log("Loaded Scripts");
