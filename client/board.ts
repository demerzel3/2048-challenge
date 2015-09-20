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

        let levelId = routeParams.params.levelId;
        if (!levelId) {
            this.goToLatestGameLevel();
            return;
        }

        this.level = this.levelManager.getById(levelId);
        let game = this.getOrCreateGame(this.level);
        this.gameManager.setGame(game);

        this.gameTracker = Tracker.autorun(zone.bind(() => {
            this.game = Games.findOne(game._id);
        }));
    }

    public onDeactivate() {
        if (this.gameTracker) {
            this.gameTracker.stop();
        }
    }

    public getOrCreateGame(level:ILevel) {
        let game = Games.findOne({
            userId: Meteor.userId(),
            levelId: level._id,
            won: false,
            over: false,
        }, {
            sort: {lastMovedAt: -1},
        });
        if (!game) {
            game = Games.findOne(Games.insert({
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
        return game;
    }

    public goToLatestGameLevel() {
        let game = Games.findOne({
            userId: Meteor.userId(),
            won: false,
            over: false,
        }, {
            sort: {lastMovedAt: -1},
        });

        if (game) {
            this.goToLevel(game.levelId);
        } else {
            this.goToRandomLevel();
        }
    }

    public goToRandomLevel() {
        let randomLevel = this.levelManager.getRandomLevel();
        this.goToLevel(randomLevel._id);
    }

    public goToLevel(id:string) {
        this.router.navigateInstruction(this.router.generate(['/play_level', {levelId: id}]));
    }
}
