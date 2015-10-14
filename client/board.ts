import {Component, View, Inject, Injector, Binding, bind, bootstrap, ElementRef, ComponentRef, DynamicComponentLoader} from 'angular2/angular2';
import {ROUTER_DIRECTIVES, Router, RouteParams, CanActivate, OnDeactivate} from 'angular2/router';
import {GameManager} from './game_manager';
import {KeyboardInputManager} from './keyboard_input_manager';
import {HTMLActuator} from './html_actuator';
import {LocalStorageManager} from './local_storage_manager';
import {LevelManager} from './service/level_manager';
import {BeforeGameModal, IBeforeGameModalParams} from './component/before_game_modal';
//import {WonModal, IWonModalParams} from './component/won_modal';
import {Home} from './home';

@Component({selector: 'board'})
@View({
    templateUrl: '/client/view/board.ng.html',
    directives: [ROUTER_DIRECTIVES],
})
@CanActivate(() => !!Meteor.userId())
export class Board implements OnDeactivate
{
    private elementRef:ElementRef;
    private router;
    private gameManager:GameManager;
    private levelManager:LevelManager;
    private game:IGame;
    private level:ILevel;
    private componentLoader:DynamicComponentLoader;

    private levelTracker:Tracker.Computation;
    private gameTracker:Tracker.Computation;

    constructor(
        @Inject(ElementRef) elementRef,
        @Inject(Router) router,
        @Inject(RouteParams) routeParams,
        @Inject(LevelManager) levelManager:LevelManager,
        @Inject(GameManager) gameManager:GameManager,
        @Inject(DynamicComponentLoader) componentLoader:DynamicComponentLoader
    ) {
        this.componentLoader = componentLoader;
        this.router = router;
        this.levelManager = levelManager;
        this.gameManager = gameManager;
        this.elementRef = elementRef;

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

        this.game = game;
        this.levelManager.getById(levelId);
        this.gameManager.setGame(this.game);

        this.gameTracker = Tracker.autorun(zone.bind(() => {
            let game = this.getLatestGame();
            if (game._id !== this.game._id && game.levelId !== this.game.levelId) {
                this.goToLevel(game.levelId);
            } else {
                this.game = game;
                this.gameManager.setGame(this.game);
            }
        }));

        this.levelTracker = Tracker.autorun(zone.bind(() => {
            this.level = Levels.findOne(levelId);
        }));

        const bindings = Injector.resolve([
            bind(IBeforeGameModalParams).toValue({
                level: this.level,
                game: this.game,
            }),
        ]);

        this.componentLoader.loadNextToLocation(new Binding(BeforeGameModal, {toClass: BeforeGameModal}), elementRef, bindings).then((modalRef:ComponentRef) => {
            return modalRef.instance.getResult();
        }).then((result) => {
            console.log('Modal result', result === BeforeGameModal.ACTION_PLAY ? 'play' : 'skip');
        });

        /*
        const bindings = Injector.resolve([
            bind(IWonModalParams).toValue({
                level: this.level,
                game: this.game,
            }),
        ]);

        this.componentLoader.loadNextToLocation(new Binding(WonModal, {toClass: WonModal}), elementRef, bindings).then((modalRef:ComponentRef) => {
            modalRef.instance.show();
        })
        */
    }

    public onDeactivate() {
        if (this.gameTracker) {
            this.gameTracker.stop();
            this.gameTracker = null;
        }
        if (this.levelTracker) {
            this.levelTracker.stop();
            this.levelTracker = null;
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
        this.createNewGame(this.level);
    }

    public nextLevel() {
        let game = this.createNewGame(this.levelManager.getRandomLevel());
        this.goToLevel(game.levelId);
    }
}
