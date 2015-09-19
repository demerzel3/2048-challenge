Meteor.publish("all-levels", function() {
    if (this.userId) {
        return Levels.find(); // everything
    } else {
        return [];
    }
});

Meteor.publish("user-levels", function() {
    return UserLevels.find({userId: this.userId});
});

Meteor.publish("user-games", function() {
    return Games.find({userId: this.userId});
});