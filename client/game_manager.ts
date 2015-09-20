import {Inject} from 'angular2/angular2';
import {Tile} from './tile';
import {Grid} from './grid';
import {LevelManager} from './service/level_manager';
import {HTMLActuator} from './html_actuator';
import {KeyboardInputManager} from './keyboard_input_manager';

export class GameManager {
    private game:IGame;
    private level:ILevel;
    private gameTracker:Tracker.Computation;

    private levelManager:LevelManager;
    private inputManager;
    private actuator;

    private grid:Grid;
    private nMoves:number = 0;
    private over:boolean = false;
    private won:boolean = false;
    private boundToInputManager:boolean = false;

    constructor(@Inject(LevelManager) levelManager:LevelManager,
                @Inject(KeyboardInputManager) inputManager,
                @Inject(HTMLActuator) actuator) {
        this.levelManager = levelManager;
        this.inputManager = inputManager;
        this.actuator = actuator;
    }

    public setGame(game:IGame) {
        if (this.gameTracker) {
            this.gameTracker.stop();
        }

        if (game) {
            this.gameTracker = Tracker.autorun(() => {
                this.game = Games.findOne(game._id);
            });
            this.level = this.levelManager.getById(game.levelId);
            this.bindInput();
            this.restart();
        }
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
        this.actuator.continueGame(); // Clear the game won/lost message
        this.setup();
    }

    // Return true if the game is lost, or has won and the user hasn't kept playing
    public isGameTerminated() {
        return this.over || this.won;
    }

    // Set up the game
    public setup() {
        let gridState = this.game.lastGridState || this.level._id;

        this.grid = Grid.deserialize(gridState);
        this.over = false;
        this.won = false;
        this.nMoves = this.game.nMoves;

        // Update the actuator
        this.actuate();
    }

    // Adds a tile in a random position
    public addRandomTile() {
        let insertedTile:Tile = null;
        if (this.grid.cellsAvailable()) {
            var value = Math.random() < 0.9 ? 2 : 4;
            var tile = new Tile(this.grid.randomAvailableCell(), value);

            this.grid.insertTile(tile);
            insertedTile = tile;
        }

        return insertedTile;
    }

    // Sends the updated grid to the actuator
    public actuate() {
        this.actuator.actuate(this.grid, {
            nMoves: this.nMoves,
            over: this.over,
            won: this.won,
            terminated: this.isGameTerminated()
        });

    }

    // Represent the current game as an object
    public serialize() {
        return {
            grid: this.grid.serialize(),
            nMoves: this.nMoves,
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
                tile = this.grid.cellContent(cell);

                if (tile) {
                    var positions = this.findFarthestPosition(cell, vector);
                    var next = this.grid.cellContent(positions.next);

                    // Only one merger per row traversal?
                    if (next && next.value === tile.value && !next.mergedFrom) {
                        var merged = new Tile(positions.next, tile.value * 2);
                        merged.mergedFrom = [tile, next];

                        this.grid.insertTile(merged);
                        this.grid.removeTile(tile);

                        // Converge the two tiles' positions
                        tile.updatePosition(positions.next);

                        // Target tile reached
                        if (merged.value === this.level.target) this.won = true;
                    } else {
                        this.moveTile(tile, positions.farthest);
                    }

                    if (!this.positionsEqual(cell, tile)) {
                        moved = true; // The tile moved from its original cell!
                    }
                }
            });
        });

        if (moved) {
            this.nMoves++;
            let spawnTile = this.addRandomTile();

            if (!this.movesAvailable()) {
                this.over = true; // Game over!
            }

            // Save the new state of the game
            Games.update(this.game._id, {
                $inc: {
                    nMoves: 1,
                },
                $set: {
                    lastMovedAt: new Date(),
                    lastGridState: this.grid.serialize(),
                    won: this.won,
                    over: this.over,
                },
                $push: {
                    turns: {
                        direction: direction,
                        spawnTile: spawnTile ? spawnTile.serialize() : null,
                    }
                }
            });

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
        var tile;

        for (var x = 0; x < this.grid.size; x++) {
            for (var y = 0; y < this.grid.size; y++) {
                tile = this.grid.cellContent({x: x, y: y});

                if (tile) {
                    for (var direction = 0; direction < 4; direction++) {
                        var vector = this.getVector(direction);
                        var cell = {x: x + vector.x, y: y + vector.y};

                        var other = this.grid.cellContent(cell);

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