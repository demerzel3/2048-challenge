import {Component, View, Inject, ViewEncapsulation, NgClass, OpaqueToken} from 'angular2/angular2';
import {Modal} from './modal';

interface IBeforeGameModalParams {
    level:ILevel;
    game:IGame;
}
export const IBeforeGameModalParams = new OpaqueToken();

@Component({
    selector: 'before-game-modal',
    properties: [
        'isVisible: visible'
    ],
})
@View({
    templateUrl: '/client/component/before_game_modal.ng.html',
    directives: [Modal],
})
export class BeforeGameModal extends Modal {
    private level:ILevel;
    private game:IGame;

    constructor(@Inject(IBeforeGameModalParams) params:IBeforeGameModalParams) {
        this.level = params.level;
        this.game = params.game;
    }
}