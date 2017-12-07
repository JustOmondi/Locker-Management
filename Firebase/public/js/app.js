var app = angular.module("PiLock", ["firebase"]);

function lockController($scope, $firebaseObject, $firebaseAuth)
{
    var locker = $scope;
    var lockStatus = 23;

    // Firebase config
    var config =
        {
        apiKey: "AIzaSyA-rpI8Y86okxMRsysGvAvrB420H7cs5YY",
        authDomain: "locker-management-1be92.firebaseapp.com",
        databaseURL: "https://locker-management-1be92.firebaseio.com",
        projectId: "locker-management-1be92",
        storageBucket: "locker-management-1be92.appspot.com",
        messagingSenderId: "484082976169"
    };

    // Initialize Firebase app
    var firebaseApp = firebase.initializeApp(config);


    console.log(firebaseApp.name); // "[DEFAULT]"

    // Retrieve services via the firebaseApp variable...

    var database = firebaseApp.database();

    // Get current lock status from database
    database.ref('lock').once('value').then(function(snapshot)
    {
        lockStatus = snapshot.val().lockStatus;
    });

    if(lockStatus == "0")
    {
        alert("Unlocked");
    }
    else if (lockStatus == "1")
    {
        alert("Locked");
    }


    var lock_url = "https://us-central1-locker-management-1be92.cloudfunctions.net/lock";
    var unlock_url = "https://us-central1-locker-management-1be92.cloudfunctions.net/unlock";

    locker.lockUnlock = function ()
    {
        if(lockStatus == "1")
        {
            // Unlock
            database.ref('lock').set(
                {
                    lockStatus: "0"
                }
            );
        }
        else if(lockStatus == "0")
        {
            // Lock
            database.ref('lock').set(
                {
                    lockStatus: "1"
                }
            );
        }
    }
}

function LogController($scope)
{
    var logs = $scope;
}