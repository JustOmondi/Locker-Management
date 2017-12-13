/*
  Francois stashes any function in here that might contain usefullness in the future,
  or any scripts that he uses for reference for cetian functionilty.

  Any script here is taken as is, and is not guaranteed to function. Use at own risk.
  Please do not remove any code, and rather duplicate and then fix when you believe a better solution has been found.
*/

// Code for cloud functions [untested]
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

//Idea for delaying execution
if (changedLock.time_out != -1) {
  setTimeout(shell.exec(pythonLockCode), changedLock.time_out);
}
setTimeout(setLockOn(changedLock), changedLock.time_out * 1000);

//Firebase value fetching
ref.once("value", function(snapshot) {
 console.log(snapshot.val());
});
