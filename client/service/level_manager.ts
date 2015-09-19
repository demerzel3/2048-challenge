import {Grid} from '../grid';
import {Tile} from '../tile';

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
};

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
};

export class LevelManager {

    public getById(id:string, type:string = 'user_generated'):ILevel {
        let level = Levels.findOne(id);
        if (!level) {
            let maxValue = 2;
            for (let i = 0, il = id.length; i < il; i++) {
                maxValue = Math.max(maxValue, INDEX_TO_VALUE[id[i]]);
            }

            Levels.insert({
                _id: id,
                target: maxValue * 2,
                type: type,
            });
            level = Levels.findOne(id);
        }
        return level;
    }

    public getRandomLevel():ILevel {
        let grid = new Grid(4);

        let possibleMaxValues = [256, 512, 1024];
        let maxValue = possibleMaxValues[Math.round(Math.random() * (possibleMaxValues.length - 1))];

        let possibleValues = [null, null];
        let value = 2;
        while (value < maxValue) {
            possibleValues.push(value);
            value *= 2;
        }

        // Generate a nice semi-random level
        let insertedCount = {};

        // Insert exactly one tile of the target value.
        grid.insertTile(new Tile(grid.randomAvailableCell(), maxValue));
        grid.mapCells((x, y, tile) => {
            if (tile) {
                return tile;
            }

            value = possibleValues[Math.round(Math.random() * possibleValues.length)];
            if (!value) {
                return null;
            }

            if (!insertedCount[value]) {
                insertedCount[value] = 0;
            }
            insertedCount[value]++;

            return new Tile({x: x, y: y}, value);
        });

        if (!insertedCount[maxValue / 2]) {
            grid.insertTile(new Tile(grid.randomAvailableCell(), maxValue / 2));
        }

        return this.getById(this.computeLevelId(grid), 'random');
    }

    public computeLevelId(grid:Grid):string {
        let id = [];
        grid.eachCell((x, y, tile:Tile) => {
            let pos = y*grid.size + x;
            id[pos] = tile ? VALUE_TO_INDEX[tile.value] : '0';
        });

        return id.join('');
    }

    public getGridForLevel(level:ILevel) {
        let grid = new Grid(4);
        let id = level._id;

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