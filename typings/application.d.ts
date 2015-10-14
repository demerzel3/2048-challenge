declare var Levels:Mongo.Collection<ILevel>;
declare var UserLevels:Mongo.Collection<IUserLevel>;
declare var Games:Mongo.Collection<IGame>;

declare var zone;

declare var StateMachine:IStateMachineStatic;

interface IStateMachineDefinition {
    initial:string;
    events:any;
}

interface IStateMachineStatic {
    create(def:IStateMachineDefinition):IStateMachine;
}

interface IStateMachine {
    current:string;
    is(event:string):boolean;
    can(event:string):boolean;
    cannot(event:string):boolean;
    transitions():string[];
}

interface ILevel {
    _id:string;
    target:number;
    type:string;
}

interface IUserLevel {
    _id:string;
    userId:string;
    levelId:string;
    createdAt:Date;
    rating?:string;
}

interface IGameTurn {
    direction:number;
    spawnTile: {x:number, y:number, value:number}
}

interface IGame {
    _id:string;
    userId:string;
    levelId:string;
    createdAt:Date;
    won:boolean;
    over:boolean;
    nMoves:number;
    time:number;
    lastMovedAt:Date;
    lastGridState:string;
    turns:IGameTurn[];
}

interface IPosition {
    x:number;
    y:number;
}
