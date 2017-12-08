//Script for connecting to Firebase database and changing data.

var app = angular.module("PiLock", ["firebase"]);

//Changing the status of the lock, and pulling information
function lockController($scope, $firebaseObject, $firebaseAuth)
{
    var locker = $scope;
    var lockStatus = -1;//initially -1 as we still need to get the current status from Firebase

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

    database.ref('lock').on('value', function(snapshot)
    {
        console.log(snapshot.val());
        lockStatus = snapshot.val().lockStatus;
        console.log("Lock status ="+lockStatus);
        // alert("Lock status = "+lockStatus);
    });

    var lockButton = $('#lock-fab');
    var lockIcon = $('#lock-icon');
    var lock_status_text = $("#lock-status-text")

    // Wait for lockStatus to be fetched from database before doing anything that depends on its value
    setTimeout(function()
    {
        // alert("Lock status outside = "+lockStatus);
        // Locked
        if(lockStatus == 1)
        {
            // lockButton.empty();

            lockButton.removeClass('grey');
            lockButton.addClass('red');
            lockButton.html('Lock');
            lockIcon.html("lock_open");
            lock_status_text.html("Your locker is unlocked");

        }
        // Unlocked
        else if (lockStatus == 0)
        {
            lockButton.removeClass('grey');
            lockButton.addClass('green');
            lockButton.html('Unlock');
            lockIcon.html("lock_outline");
            lock_status_text.html("Your locker is locked");
        }

    }, 2000);



    var lock_url = "https://us-central1-locker-management-1be92.cloudfunctions.net/lock";
    var unlock_url = "https://us-central1-locker-management-1be92.cloudfunctions.net/unlock";

    // Update lock status
    locker.lockUnlock = function ()
    {
        if(lockStatus == 1)
        {
            //Add changes to update list and push to database
            locker.pushChanges('lock', 0);

            //UI changes
            lockButton.removeClass('red');
            lockButton.addClass('green');
            lockButton.text('Unlock');

            lockIcon.html("lock_outline");
            lock_status_text.html("Your locker is locked");
            //console.log("lalal " + lockIcon.html());
        }
        else if(lockStatus == 0)
        {
            //Lock
            locker.pushChanges('lock', 1);

            //UI changes
            lockButton.removeClass('green');
            lockButton.addClass('red');
            lockButton.text('Lock');

            lockIcon.html("lock_open");
            lock_status_text.html("Your locker is unlocked");
            //console.log("old html = " + lockButton.html());

        }
    };

    //push a list of updates to database
    locker.pushChanges = function(lock_key, value)
    {
        var updates = {};
        updates["/lockStatus"] = value;
        database.ref('lock').update(updates);
    };

    locker.emailSignIn = function(email, password)
    {
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode + ": " + errorMessage);
            window.location.href = 'index.html';
        });
        window.location.href = 'views/home.html'
    };
}

function LogController($scope)
{
    var logs = $scope;
}