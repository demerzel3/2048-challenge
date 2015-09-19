declare var Levels:Mongo.Collection<ILevel>;

interface ILevel {
    _id:string;
    target:number;
    type:string;
}

interface IPosition {
    x:number;
    y:number;
}
