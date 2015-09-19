
Levels = new Mongo.Collection<ILevel>('levels', {
    /*
    transform: function(data:LevelDataInterface) {
        return new Level(data);
    }
    */
});

Levels.allow({
    insert: function (level) {
        return true;
    },
    update: function (level, fields, modifier) {
        return false;
    },
    remove: function (level) {
        return false;
    }
});