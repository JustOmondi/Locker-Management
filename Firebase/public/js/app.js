var app = angular.module("PiLock", ["firebase"]);

function lockController($scope, $firebaseObject, $firebaseAuth)
{
    var locker = $scope;
    var lockStatus = -1;

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

    // // Get current lock status from database
    // database.ref('lock').once('value').then(function(snapshot)
    // {
    //     lockStatus = snapshot.val().lockStatus;
    //     alert("Pulled Lock status = "+lockStatus);
    // });


    var lockButton = $('#lock-fab');
    var lockIcon = $('#lock-icon');

    // var lockedContent = "<i class=\"material-icons left\">locked</i>lock_outline</i>";


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
            lockButton.text('Lock');
            lockIcon.html("lock_outline")
        }
        // Unlocked
        else if (lockStatus == 0)
        {
            lockButton.removeClass('grey');
            lockButton.addClass('green');
            lockButton.text('Unlock');
            lockIcon.html("lock_open")
        }

    }, 2000);



    var lock_url = "https://us-central1-locker-management-1be92.cloudfunctions.net/lock";
    var unlock_url = "https://us-central1-locker-management-1be92.cloudfunctions.net/unlock";

    locker.lockUnlock = function ()
    {
        if(lockStatus == 1)
        {
            // Unlock
            database.ref('lock').set(
                {
                    lockStatus: 0
                }
            );
            lockButton.removeClass('red');
            lockButton.addClass('green');
            lockButton.text('Unlock');
            lockIcon.html("lock_open")
            // locker.updateLockStatus();
        }
        else if(lockStatus == 0)
        {
            // Lock
            database.ref('lock').set(
                {
                    lockStatus: 1
                }
            );
            lockButton.removeClass('green');
            lockButton.addClass('red');
            lockButton.text('Lock');
            lockIcon.html("lock_outline")
            // locker.updateLockStatus();

        }
    };

    locker.updateLockStatus = function ()
    {
        database.ref('lock').once('value').then(function (snapshot) {
            lockStatus = snapshot.val().lockStatus;
        });
    };
}

function LogController($scope)
{
    var logs = $scope;
}