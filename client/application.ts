import {Component, View, bootstrap} from 'angular2/angular2';
import {GameManager} from './game_manager';
import {KeyboardInputManager} from './keyboard_input_manager';
import {HTMLActuator} from './html_actuator';
import {LocalStorageManager} from './local_storage_manager';

@Component({selector: 'application'})
@View({templateUrl: '/client/view/index.ng.html'})
class Application
{
    private gameManager;

    constructor() {
        // Wait till the browser is ready to render the game (avoids glitches)
        window.requestAnimationFrame(() => {
            this.gameManager = new GameManager(
                4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
        });
    }
}

bootstrap(Application);