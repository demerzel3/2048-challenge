import {Tile} from './tile';

export class Grid {
    public size;
    public cells;

    constructor(size, previousState = null) {
        this.size = size;
        this.cells = previousState ? this.fromState(previousState) : this.empty();
    }

    // Build a grid of the specified size
    public empty() {
        var cells = [];

        for (var x = 0; x < this.size; x++) {
            var row = cells[x] = [];

            for (var y = 0; y < this.size; y++) {
                row.push(null);
            }
        }

        return cells;
    }

    public fromState(state) {
        var cells = [];

        for (var x = 0; x < this.size; x++) {
            var row = cells[x] = [];

            for (var y = 0; y < this.size; y++) {
                var tile = state[x][y];
                row.push(tile ? new Tile(tile.position, tile.value) : null);
            }
        }

        return cells;
    }

    // Find the first available random position
    public randomAvailableCell() {
        var cells = this.availableCells();

        if (cells.length) {
            return cells[Math.floor(Math.random() * cells.length)];
        }
    }

    public availableCells() {
        var cells = [];

        this.eachCell(function (x, y, tile) {
            if (!tile) {
                cells.push({x: x, y: y});
            }
        });

        return cells;
    }

    // Call callback for every cell
    public eachCell(callback) {
        for (var x = 0; x < this.size; x++) {
            for (var y = 0; y < this.size; y++) {
                callback(x, y, this.cells[x][y]);
            }
        }
    }

    public mapCells(callback) {
        let eachCallback = (x, y, tile) => {
            var result = callback(x, y, tile);
            if (tile && !result) {
                this.cells[x][y] = null;
            } else if (result) {
                this.insertTile(result);
            }
        };
        this.eachCell(eachCallback);
    }

    // Check if there are any cells available
    public cellsAvailable() {
        return !!this.availableCells().length;
    }

    // Check if the specified cell is taken
    public cellAvailable(cell) {
        return !this.cellOccupied(cell);
    }

    public cellOccupied(cell) {
        return !!this.cellContent(cell);
    }

    public cellContent(cell) {
        if (this.withinBounds(cell)) {
            return this.cells[cell.x][cell.y];
        } else {
            return null;
        }
    }

    // Inserts a tile at its position
    public insertTile(tile) {
        this.cells[tile.x][tile.y] = tile;
    }

    public removeTile(tile) {
        this.cells[tile.x][tile.y] = null;
    }

    public withinBounds(position) {
        return position.x >= 0 && position.x < this.size &&
            position.y >= 0 && position.y < this.size;
    }

    public serialize() {
        var cellState = [];

        for (var x = 0; x < this.size; x++) {
            var row = cellState[x] = [];

            for (var y = 0; y < this.size; y++) {
                row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
            }
        }

        return {
            size: this.size,
            cells: cellState
        };
    }
}
