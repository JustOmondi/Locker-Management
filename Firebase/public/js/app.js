//Script for connecting to Firebase database and changing data.

var app = angular.module("PiLock", ["firebase"]);
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

function lockController($scope)
{
    var locker = $scope;
    var lockStatus = -1;//initially -1 as we still need to get the current status from Firebase

    locker.buttonIcon = "";



    var lockButton = $('#lock-fab');
    var lockIcon = $('#lock-icon');
    var lock_status_text = $("#lock-status-text");

    // Listen for change to database, and change relevant UI.
    database.ref('lock').on('value', function(snapshot)
    {
        console.log(snapshot.val());
        lockStatus = snapshot.val().lockStatus;
        console.log("Lock status ="+lockStatus);
        if(lockStatus == 1)
        {
            // lockButton.empty();

            lockButton.removeClass('grey');
            lockButton.removeClass('green');
            lockButton.addClass('red');
            lockButton.html('Lock');
            lockIcon.html("lock_open");
            lock_status_text.html("Your locker is unlocked");

        }
        // Unlocked
        else if (lockStatus == 0)
        {
            lockButton.removeClass('grey');
            lockButton.removeClass('red');
            lockButton.addClass('green');
            lockButton.html('Unlock');
            lockIcon.html("lock_outline");
            lock_status_text.html("Your locker is locked");
        }
        // alert("Lock status = "+lockStatus);
    });

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
            locker.generateLog(1);
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
            locker.generateLog(0);

        }
    };

    //push a list of updates to database
    locker.pushChanges = function(lock_key, value)
    {
        var updates = {};
        updates["/lockStatus"] = value;
        database.ref('lock').update(updates);
    };


    var email = document.getElementById("email_field");
    var password = document.getElementById("password_field");
    var circle = $("#loading-circle");

    locker.emailSignUp = function()
    {
        var confirm_password = document.getElementById("password_field_confirm");
        console.log(email.value + " " + password.value);
        var password_error = $("#sign-in-error");
        console.log(typeof String(confirm_password));
        if (confirm_password.value !== password.value) {
            password_error.removeClass("hide");
            console.log(password_error.html());
        } else {
            firebase.auth().createUserWithEmailAndPassword(email.value, password.value).then(function(result){
                console.log("Signed in");
                circle.addClass("hide");
                window.location.href = 'home.html';
            }).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode + ": " + errorMessage);
                window.location.href = 'sign_up.html';
            });
        }
    };

    locker.emailSignIn = function()
    {
        circle.removeClass("hide"); //show loading sign

        console.log(email.value + " " + password.value);
        firebase.auth().signInWithEmailAndPassword(email.value, password.value).then(function(result){
            console.log("Signed in");
            circle.addClass("hide");
            window.location.href = 'home.html';
        }).catch(function(error) {
            // Handle Errors here.
            console.log("Error");
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode + ": " + errorMessage);
            circle.addClass("hide");
            window.location.href = 'login.html';
        });

    };
    
    locker.generateLog = function(lockStatus)
    {
        var date = new Date();
        var month = date.getMonth()+1;
        var year = date.getFullYear();
        var day = date.getDate();
        var hour = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();

        if(hour < 10)
        {
            hour = "0"+hour;
        }
        if(min < 10)
        {
            min = "0"+min;
        }
        if(sec < 10)
        {
            sec = "0"+sec;
        }
        if(month < 10)
        {
            month = "0"+month;
        }
        if(day < 10)
        {
            day = "0"+day;
        }

        var dateString = year+"-"+month+"-"+day;
        var timeString = hour+":"+min+":"+sec;

        var userid = "PCWsFlrZqWPPnUACRDm4MFe5Zk13";
        console.log(userid);

        var updates = {};
        updates["/logs/"+dateString+"/"+timeString] = lockStatus;
        database.ref(userid).update(updates);

    };
}

function logsController($scope)
{
    var logs = $scope;

    var selectedDate;
    var date_text = $("#date-text");

    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15, // Creates a dropdown of 15 years to control year,
        today: 'Today',
        clear: 'Clear',
        close: 'Ok',
        closeOnSelect: true, // Close upon selecting a date,
        onClose: function()
        {
            // console.log(this.get('select', 'yyyy-mm-dd'));
            selectedDate = this.get('select', 'yyyy-mm-dd');
            date_text.html("<b>Showing history for " + selectedDate + "</b>");
            retrieveList(selectedDate);
        }
    });
    //temp var for testing
    logs.loglist = [];
    tempList = [];
    var userID = 'PCWsFlrZqWPPnUACRDm4MFe5Zk13';
    function retrieveList(date) {
        $scope.$apply(function () {logs.loglist=[];});
        tempList=[];
        firebase.database().ref(userID + "/logs/" + date + "/").once('value').then(function(snapshot) {
            var list = snapshot.val();
            for(var key in list)
            {
                if (list.hasOwnProperty(key)) {
                    var object = {};
                    object["lockStatus"] = list[key];
                    object["lock_time"] = key;
                    tempList.push(object);
                }
            }
            display_list();

        });
    }
    function display_list() {
        for(var i=0;i<tempList.length;i++)
        {
            var obj = tempList[i];
            if(obj["lockStatus"] === 0)
            {
                object = {};
                object["lockStatus"] = 0;
                object["lock_time"] = obj["lock_time"];
                object["lock_icon"] = "lock_outline";
                object["lock_title"] = "Locked";
                object["color"] = "material-icons circle red";
                $scope.$apply(function () {
                    logs.loglist.push(object);
                });
            }
            else
            {
                object = {};
                object["lockStatus"] = 1;
                object["lock_time"] = obj["lock_time"];
                object["lock_icon"] = "lock_open";
                object["lock_title"] = "Unlocked";
                object["color"] = "material-icons circle green";
                $scope.$apply(function () {
                    logs.loglist.push(object);
                });
            }//end else
        }
    }

}
