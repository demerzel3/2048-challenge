interface LevelDataInterface {
    _id:string;
    target:number;
    type:string;
}

class Level {
    private _id;
    public target;
    public type;

    constructor(data:LevelDataInterface) {
        this._id = data._id;
        this.target = data.target;
        this.type = data.type;
    }

    public get id() {
        return this._id;
    }
}

Levels = new Mongo.Collection('levels', {
    transform: function(data:LevelDataInterface) {
        return new Level(data);
    }
});

Levels.allow({
    insert: function (level:Level) {
        return true;
    },
    update: function (level:Level, fields, modifier) {
        return false;
    },
    remove: function (level:Level) {
        return false;
    }
});