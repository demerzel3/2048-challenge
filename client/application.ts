import {Component, View, bootstrap, Inject} from 'angular2/angular2';
import {ROUTER_BINDINGS, ROUTER_DIRECTIVES, Router, RouteConfig} from 'angular2/router';
import {LevelManager} from './service/level_manager';
import {KeyboardInputManager} from './keyboard_input_manager';
import {GameManager} from './game_manager';
import {Home} from './home';
import {Board} from './board';
import {Loading} from './loading';

@Component({selector: 'application'})
@View({
    templateUrl: '/client/view/layout.ng.html',
    directives: [ROUTER_DIRECTIVES],
})
@RouteConfig([
    {path: '/*', as: 'loading', component: Loading}
])
class Application {
    private router;

    constructor(@Inject(Router) router) {
        this.router = router;

        // When subscriptions are ready, configure the router.
        this.subscribe().then(() => {
            this.onReady();
        });
    }

    private subscribe() {
        let ready;
        Tracker.autorun(() => {
            ready = Promise.all([
                this.subscribePromise('all-levels'),
                this.subscribePromise('user-levels'),
                this.subscribePromise('user-games'),
            ]);
        });

        return ready;
    }

    private onReady() {
        this.router.config([
            {path: '/', as: 'home', component: Home},
            {path: '/play', as: 'play', component: Board},
            {path: '/play/:levelId', as: 'play_level', component: Board},
        ]);

        // Route user on login.
        Tracker.autorun(() => {
            if (Meteor.userId()) {
                if (this.router.lastNavigationAttempt.substr(0, 5) !== '/play') {
                    this.router.navigateInstruction(this.router.generate(['/play']));
                }
            } else {
                this.router.navigateInstruction(this.router.generate(['/home']));
            }
        });
    }

    private subscribePromise(subscriptionName) {
        return new Promise((resolve, reject) => {
            Meteor.subscribe(subscriptionName, {
                onReady: (result) => {
                    resolve(result);
                }, onStop: (error) => {
                    reject(error);
                }
            });
        });
    }
}

bootstrap(Application, [
    ROUTER_BINDINGS,
    LevelManager, KeyboardInputManager, GameManager
]);