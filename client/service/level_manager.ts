import {Grid} from '../grid';
import {Tile} from '../tile';

export class LevelManager {

    public getById(id:string, type:string = 'user_generated'):ILevel {
        let level = Levels.findOne(id);
        if (!level) {
            Levels.insert({
                _id: id,
                target: Grid.deserialize(id).getMaxValue() * 2,
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

        return this.getById(grid.serialize(), 'random');
    }
}