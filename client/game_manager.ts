import {Inject} from 'angular2/angular2';
import {Tile} from './tile';
import {Grid} from './grid';
import {LevelManager} from './service/level_manager';
import {HTMLActuator} from './html_actuator';
import {KeyboardInputManager} from './keyboard_input_manager';
import {LocalStorageManager} from './local_storage_manager';

export class GameManager {
    private level:ILevel;

    private levelManager:LevelManager;
    private inputManager;
    private storageManager;
    private actuator;

    private grid:Grid;
    private score:number = 0;
    private over:boolean = false;
    private won:boolean = false;
    private boundToInputManager:boolean = false;

    constructor(@Inject(LevelManager) levelManager:LevelManager,
                @Inject(KeyboardInputManager) inputManager,
                @Inject(HTMLActuator) actuator,
                @Inject(LocalStorageManager) storageManager) {
        this.levelManager = levelManager;
        this.inputManager = inputManager;
        this.storageManager = storageManager;
        this.actuator = actuator;
    }

    public setLevel(level) {
        this.level = level;
        this.bindInput();
        this.restart();
    }

    private bindInput() {
        if (this.boundToInputManager) {
            return;
        }

        this.boundToInputManager = true;
        this.inputManager.on("move", this.move.bind(this));
        this.inputManager.on("restart", this.restart.bind(this));
    }

    // Restart the game
    public restart() {
        this.storageManager.clearGameState();
        this.actuator.continueGame(); // Clear the game won/lost message
        this.setup();
    }

    // Return true if the game is lost, or has won and the user hasn't kept playing
    public isGameTerminated() {
        return this.over || this.won;
    }

    // Set up the game
    public setup() {
        // TODO: figure out how to handle resume.
        var previousState = null; //this.storageManager.getGameState();

        // Reload the game from a previous game if present
        if (previousState) {
            this.grid = new Grid(previousState.grid.size,
                previousState.grid.cells); // Reload grid
            this.score = previousState.score;
            this.over = previousState.over;
            this.won = previousState.won;
        } else {
            this.grid = this.levelManager.getGridForLevel(this.level);
            this.score = 0;
            this.over = false;
            this.won = false;
        }

        // Update the actuator
        this.actuate();
    }

    // Adds a tile in a random position
    public addRandomTile() {
        if (this.grid.cellsAvailable()) {
            var value = Math.random() < 0.9 ? 2 : 4;
            var tile = new Tile(this.grid.randomAvailableCell(), value);

            this.grid.insertTile(tile);
        }
    }

    // Sends the updated grid to the actuator
    public actuate() {
        if (this.storageManager.getBestScore() < this.score) {
            this.storageManager.setBestScore(this.score);
        }

        // Clear the state when the game is over (game over only, not win)
        if (this.over) {
            this.storageManager.clearGameState();
        } else {
            this.storageManager.setGameState(this.serialize());
        }

        this.actuator.actuate(this.grid, {
            score: this.score,
            over: this.over,
            won: this.won,
            bestScore: this.storageManager.getBestScore(),
            terminated: this.isGameTerminated()
        });

    }

    // Represent the current game as an object
    public serialize() {
        return {
            grid: this.grid.serialize(),
            score: this.score,
            over: this.over,
            won: this.won,
        };
    }

    // Save all tile positions and remove merger info
    public prepareTiles() {
        this.grid.eachCell(function (x, y, tile) {
            if (tile) {
                tile.mergedFrom = null;
                tile.savePosition();
            }
        });
    }

    // Move a tile and its representation
    public moveTile(tile, cell) {
        this.grid.cells[tile.x][tile.y] = null;
        this.grid.cells[cell.x][cell.y] = tile;
        tile.updatePosition(cell);
    }

    // Move tiles on the grid in the specified direction
    public move(direction) {
        // 0: up, 1: right, 2: down, 3: left
        var self = this;

        if (this.isGameTerminated()) return; // Don't do anything if the game's over

        var cell, tile;

        var vector = this.getVector(direction);
        var traversals = this.buildTraversals(vector);
        var moved = false;

        // Save the current tile positions and remove merger information
        this.prepareTiles();

        // Traverse the grid in the right direction and move tiles
        traversals.x.forEach(x => {
            traversals.y.forEach(y => {
                cell = {x: x, y: y};
                tile = self.grid.cellContent(cell);

                if (tile) {
                    var positions = self.findFarthestPosition(cell, vector);
                    var next = self.grid.cellContent(positions.next);

                    // Only one merger per row traversal?
                    if (next && next.value === tile.value && !next.mergedFrom) {
                        var merged = new Tile(positions.next, tile.value * 2);
                        merged.mergedFrom = [tile, next];

                        self.grid.insertTile(merged);
                        self.grid.removeTile(tile);

                        // Converge the two tiles' positions
                        tile.updatePosition(positions.next);

                        // Update the score
                        self.score += merged.value;

                        // Target tile reached
                        if (merged.value === this.level.target) self.won = true;
                    } else {
                        self.moveTile(tile, positions.farthest);
                    }

                    if (!self.positionsEqual(cell, tile)) {
                        moved = true; // The tile moved from its original cell!
                    }
                }
            });
        });

        if (moved) {
            this.addRandomTile();

            if (!this.movesAvailable()) {
                this.over = true; // Game over!
            }

            this.actuate();
        }
    }

    // Get the vector representing the chosen direction
    public getVector(direction) {
        // Vectors representing tile movement
        var map = {
            0: {x: 0, y: -1}, // Up
            1: {x: 1, y: 0},  // Right
            2: {x: 0, y: 1},  // Down
            3: {x: -1, y: 0}   // Left
        };

        return map[direction];
    }

    // Build a list of positions to traverse in the right order
    public buildTraversals(vector) {
        var traversals = {x: [], y: []};

        for (var pos = 0; pos < this.grid.size; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }

        // Always traverse from the farthest cell in the chosen direction
        if (vector.x === 1) traversals.x = traversals.x.reverse();
        if (vector.y === 1) traversals.y = traversals.y.reverse();

        return traversals;
    }

    public findFarthestPosition(cell, vector) {
        var previous;

        // Progress towards the vector direction until an obstacle is found
        do {
            previous = cell;
            cell = {x: previous.x + vector.x, y: previous.y + vector.y};
        } while (this.grid.withinBounds(cell) &&
        this.grid.cellAvailable(cell));

        return {
            farthest: previous,
            next: cell // Used to check if a merge is required
        };
    }

    public movesAvailable() {
        return this.grid.cellsAvailable() || this.tileMatchesAvailable();
    }

    // Check for available matches between tiles (more expensive check)
    public tileMatchesAvailable() {
        var self = this;

        var tile;

        for (var x = 0; x < this.grid.size; x++) {
            for (var y = 0; y < this.grid.size; y++) {
                tile = this.grid.cellContent({x: x, y: y});

                if (tile) {
                    for (var direction = 0; direction < 4; direction++) {
                        var vector = self.getVector(direction);
                        var cell = {x: x + vector.x, y: y + vector.y};

                        var other = self.grid.cellContent(cell);

                        if (other && other.value === tile.value) {
                            return true; // These two tiles can be merged
                        }
                    }
                }
            }
        }

        return false;
    }

    public positionsEqual(first, second) {
        return first.x === second.x && first.y === second.y;
    }
}