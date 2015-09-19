import {Component, View, bootstrap, Inject} from 'angular2/angular2';
import {ROUTER_BINDINGS, ROUTER_DIRECTIVES, Router, RouteConfig} from 'angular2/router';
import {LevelManager} from './service/level_manager';
import {HTMLActuator} from './html_actuator';
import {KeyboardInputManager} from './keyboard_input_manager';
import {LocalStorageManager} from './local_storage_manager';
import {GameManager} from './game_manager';
import {Home} from './home';
import {Board} from './board';

@Component({selector: 'application'})
@View({
    templateUrl: '/client/view/layout.ng.html',
    directives: [ROUTER_DIRECTIVES],
})
@RouteConfig([
    {path: '/', as: 'home', component: Home},
    {path: '/play', as: 'play', component: Board},
    {path: '/play/:levelId', as: 'play_level', component: Board},
])
class Application {
    constructor(@Inject(Router) router:Router) {

        Meteor.subscribe('all-levels');

        // Route user on login.
        Tracker.autorun(() => {
            if (Meteor.userId()) {
                router.navigateInstruction(router.generate(['/play']));
            } else {
                router.navigateInstruction(router.generate(['/home']));
            }
        });
    }
}

bootstrap(Application, [
    ROUTER_BINDINGS,
    LevelManager, HTMLActuator, KeyboardInputManager, LocalStorageManager, GameManager
]);