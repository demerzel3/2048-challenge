import {Component, View, Inject, bootstrap} from 'angular2/angular2';
import {ROUTER_DIRECTIVES, Router, RouteParams, CanActivate, OnDeactivate} from 'angular2/router';
import {GameManager} from './game_manager';
import {KeyboardInputManager} from './keyboard_input_manager';
import {HTMLActuator} from './html_actuator';
import {LocalStorageManager} from './local_storage_manager';
import {LevelManager} from './service/level_manager';

@Component({selector: 'board'})
@View({
    templateUrl: '/client/view/board.ng.html',
    directives: [ROUTER_DIRECTIVES],
})
@CanActivate(() => !!Meteor.userId())
export class Board implements OnDeactivate
{
    private router;
    private gameManager:GameManager;
    private levelManager:LevelManager;
    private game:IGame;
    private level:ILevel;

    private levelTracker:Tracker.Computation;
    private gameTracker:Tracker.Computation;

    constructor(
        @Inject(Router) router,
        @Inject(RouteParams) routeParams,
        @Inject(LevelManager) levelManager:LevelManager,
        @Inject(GameManager) gameManager:GameManager
    ) {
        this.router = router;
        this.levelManager = levelManager;
        this.gameManager = gameManager;

        let game = this.getLatestGame();
        let levelId = routeParams.params.levelId;

        // First played game ever, create a new game from a random level.
        if (!game) {
            game = this.createNewGame(this.levelManager.getRandomLevel());
        } else if (levelId) {
            if (game.won || game.over) {
                // TODO: start a new game of the selected level
            } else {
                // TODO: ask if the user wants to resume or start a new game of the given level
            }
        }

        // Redirect from any URL to the latest played one.
        if (game.levelId !== levelId) {
            this.goToLevel(game.levelId);
            return;
        }

        this.levelManager.getById(levelId);
        this.gameManager.setGame(game);

        this.gameTracker = Tracker.autorun(zone.bind(() => {
            this.game = Games.findOne(game._id);
        }));

        this.levelTracker = Tracker.autorun(zone.bind(() => {
            this.level = Levels.findOne(levelId);
        }));
    }

    public onDeactivate() {
        if (this.gameTracker) {
            this.gameTracker.stop();
        }
        if (this.levelTracker) {
            this.levelTracker.stop();
        }
    }

    private getLatestGame() {
        return Games.findOne({ userId: Meteor.userId() }, { sort: {lastMovedAt: -1} });
    }

    private createNewGame(level:ILevel) {
        return Games.findOne(Games.insert({
            userId: Meteor.userId(),
            levelId: level._id,
            won: false,
            over: false,
            nMoves: 0,
            time: 0,
            createdAt: new Date(),
            lastMovedAt: new Date(),
            lastGridState: null,
            turns: [],
        }));
    }

    private goToLevel(id:string) {
        this.router.navigateInstruction(this.router.generate(['/play_level', {levelId: id}]));
    }

    public retryLevel() {
        let game = this.createNewGame(this.level);
        this.gameManager.setGame(game);

        this.gameTracker.stop();
        this.gameTracker = Tracker.autorun(zone.bind(() => {
            this.game = Games.findOne(game._id);
        }));
    }

    public nextLevel() {
        let game = this.createNewGame(this.levelManager.getRandomLevel());
        this.goToLevel(game.levelId);
    }
}
