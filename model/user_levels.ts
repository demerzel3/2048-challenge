UserLevels = new Mongo.Collection<IUserLevel>('user_levels');

UserLevels.allow({
    insert: function (userId:string, userLevel:IUserLevel) {
        return userId && userId === userLevel.userId;
    },
    update: function (userId:string, userLevel:IUserLevel, fields, modifier) {
        return userId && userId === userLevel.userId;
    },
    remove: function (userId:string, userLevel:IUserLevel) {
        return false;
    }
});