import {Component, View, Inject, ViewEncapsulation, NgClass, OpaqueToken} from 'angular2/angular2';
import {Modal} from './modal';

interface IWonModalParams {
    level:ILevel;
    game:IGame;
}
export const IWonModalParams = new OpaqueToken();

@Component({
    selector: 'won-modal',
    properties: [
        'isVisible: visible'
    ],
})
@View({
    templateUrl: '/client/component/won_modal.ng.html',
    directives: [Modal],
})
export class WonModal extends Modal {
    private level:ILevel;
    private game:IGame;

    constructor(@Inject(IWonModalParams) params:IWonModalParams) {
        this.level = params.level;
        this.game = params.game;
    }
}