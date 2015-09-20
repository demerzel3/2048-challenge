import {Tile} from './tile';

// Used during serialization
const VALUE_TO_INDEX = {
    0:      '0',
    2:      '1',
    4:      '2',
    8:      '3',
    16:     '4',
    32:     '5',
    64:     '6',
    128:    '7',
    256:    '8',
    512:    '9',
    1024:   'A',
    2048:   'B',
    4096:   'C',
    8192:   'D',
    16384:  'E',
    32768:  'F',
};

// Used during deserialization
const INDEX_TO_VALUE = {
    0: 0,
    1: 2,
    2: 4,
    3: 8,
    4: 16,
    5: 32,
    6: 64,
    7: 128,
    8: 256,
    9: 512,
    A: 1024,
    B: 2048,
    C: 4096,
    D: 8192,
    E: 16384,
    F: 32768,
};

export class Grid {
    public size;
    public cells;

    constructor(size) {
        this.size = size;
        this.cells = this.empty();
    }

    // Build a grid of the specified size
    private empty() {
        var cells = [];

        for (var x = 0; x < this.size; x++) {
            var row = cells[x] = [];

            for (var y = 0; y < this.size; y++) {
                row.push(null);
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

    public getMaxValue() {
        let max = 2;
        this.eachCell((x, y, tile) => {
            if (tile) {
                max = Math.max(max, tile.value);
            }
        });

        return max;
    }

    public serialize() {
        let id = [];
        this.eachCell((x, y, tile:Tile) => {
            let pos = y*this.size + x;
            id[pos] = tile ? VALUE_TO_INDEX[tile.value] : '0';
        });

        return id.join('');
    }

    public static deserialize(state:string) {
        let size = Math.sqrt(state.length);
        let grid = new Grid(size);
        let id = state;

        for (let i = 0, il = id.length; i < il; i++) {
            let value = INDEX_TO_VALUE[id[i]];
            let y = Math.floor(i / grid.size);
            let x = i % grid.size;

            if (value > 0) {
                grid.insertTile(new Tile({x: x, y: y}, value));
            }
        }

        return grid;
    }
}
