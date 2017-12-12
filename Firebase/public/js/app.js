//Script for connecting to Firebase database and changing data.

var app = angular.module("PiLock", ["firebase"]);

app.service('userService', function(){
    this.currentUser = { uid: ""};

    this.user = function(){
        return this.currentUser;
    };

    this.getUserID = function(){
        return this.currentUser.uid;
    };

    this.setUserID = function (userId) {
        console.log("User Service " + userId);
        this.currentUser.uid = userId;
        console.log(this.currentUser);
    };

    this.setUser = function (userData) {
        console.log("User Service " + userData.uid);
        this.currentUser = userData;
    };
});

app.controller('lockController', ["$scope", 'userService', function($scope, userService, $location){
    var locker = $scope;
    var lockStatus = -1;//initially -1 as we still need to get the current status from Firebase

    locker.buttonIcon = "";

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

    var lockButton = $('#lock-fab');
    var lockIcon = $('#lock-icon');
    var lock_status_text = $("#lock-status-text");
    console.log("Trace");
    var currentUserID = localStorage.getItem("userid");
    console.log(currentUserID);
    database.ref(currentUserID).on('value', function (snapshot) {
        console.log(snapshot.val());
        lockStatus = snapshot.val().lockStatus;
        console.log("Lock status =" + lockStatus);
        if (lockStatus == 1) {
            // lockButton.empty();
            lockButton.removeClass('grey');
            lockButton.removeClass('green');
            lockButton.addClass('red');
            lockButton.html('Lock');
            lockIcon.html("lock_open");
            lock_status_text.html("Your locker is unlocked");

        }
        // Unlocked
        else if (lockStatus == 0) {
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
    locker.lockUnlock = function () {
        if (lockStatus == 1) {
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
        else if (lockStatus == 0) {
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
    locker.pushChanges = function (lock_key, value) {
        var updates = {};
        updates["/lockStatus"] = value;
        var uID = localStorage.getItem("userid");
        database.ref(uID).update(updates);
    }
}]);

app.controller('loginController', ["$scope", 'userService', "$location", function($scope, userService, $location){
    var login = $scope;

    var email = document.getElementById("email_field");
    var password = document.getElementById("password_field");
    var circle = $("#loading-circle");
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

    login.emailSignUp = function () {
        var confirm_password = document.getElementById("password_field_confirm");
        console.log(email.value + " " + password.value);
        var password_error = $("#sign-in-error");
        console.log(typeof String(confirm_password));
        if (confirm_password.value !== password.value) {
            password_error.removeClass("hide");
            console.log(password_error.html());
        } else {
            firebaseApp.auth().createUserWithEmailAndPassword(email.value, password.value).then(function (result) {
                console.log("Signed in");
                userService.setUser(result);
                circle.addClass("hide");
                localStorage.setItem("userid", result.uid);
                window.location.href = 'home.html';
            }).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode + ": " + errorMessage);
                window.location.href = 'sign_up.html';
            });
        }
    };

    login.emailSignIn = function () {
        circle.removeClass("hide"); //show loading sign
        firebaseApp.auth().signInWithEmailAndPassword(email.value, password.value).then(function (result) {
            console.log("Signed in " + result.uid);
            userService.setUserID(result.uid);
            circle.addClass("hide");
            localStorage.setItem("userid", result.uid);
            window.location.href = 'home.html';
        }).catch(function (error) {
            // Handle Errors here.
            console.log("Error");
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode + ": " + errorMessage);
            circle.addClass("hide");
            window.location.href = 'login.html';
        });

    };
}]);

app.controller('logsController', ["$scope", 'userService', function($scope, userService, $location){
    var logs = $scope;

    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15, // Creates a dropdown of 15 years to control year,
        today: 'Today',
        clear: 'Clear',
        close: 'Ok',
        closeOnSelect: false // Close upon selecting a date,
    });
}]);