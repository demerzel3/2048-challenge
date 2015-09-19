Games = new Mongo.Collection<IGame>('games');

Games.allow({
    insert: function (userId:string, game:IGame) {
        return userId && userId === game.userId;
    },
    update: function (userId:string, game:IGame, fields, modifier) {
        return userId && userId === game.userId;
    },
    remove: function (userId:string, game:IGame) {
        return false;
    }
});