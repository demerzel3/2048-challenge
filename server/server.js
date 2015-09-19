Meteor.publish("all-levels", function () {
    return Levels.find(); // everything
});