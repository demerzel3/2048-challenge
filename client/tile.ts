export interface Position {
    x:number;
    y:number;
}

export class Tile {
    public x:number;
    public y:number;
    public value:number;

    public previousPosition:Position;
    public mergedFrom:Tile;

    constructor(position:Position, value:number) {
        this.x = position.x;
        this.y = position.y;
        this.value = value || 2;

        this.previousPosition = null;
        this.mergedFrom = null; // Tracks tiles that merged together
    }

    public savePosition() {
        this.previousPosition = {x: this.x, y: this.y};
    }

    public updatePosition(position:Position) {
        this.x = position.x;
        this.y = position.y;
    }

    public serialize() {
        return {
            position: {
                x: this.x,
                y: this.y
            },
            value: this.value
        };
    }
}
