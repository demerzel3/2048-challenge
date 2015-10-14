import {Component, View, Inject, ViewEncapsulation, NgClass, OpaqueToken, AppViewManager, ElementRef, OnInit} from 'angular2/angular2';
import {Modal, BaseModal} from './modal';
import {Deferred} from '../deferred';

interface IBeforeGameModalParams {
    level:ILevel;
    game:IGame;
}
export const IBeforeGameModalParams = new OpaqueToken();

@Component({
    selector: 'before-game-modal',
})
@View({
    templateUrl: '/client/component/before_game_modal.ng.html',
    directives: [Modal],
})
export class BeforeGameModal extends BaseModal {
    private level:ILevel;
    private game:IGame;

    public static ACTION_PLAY = new OpaqueToken();
    public static ACTION_SKIP = new OpaqueToken();

    constructor(
        @Inject(IBeforeGameModalParams) params:IBeforeGameModalParams,
        @Inject(AppViewManager) appViewManager:AppViewManager,
        @Inject(ElementRef) elementRef:ElementRef
    ) {
        super(appViewManager, elementRef);

        this.level = params.level;
        this.game = params.game;
    }

    public play() {
        this.close(BeforeGameModal.ACTION_PLAY);
    }

    public skip(event) {
        event.preventDefault();
        this.close(BeforeGameModal.ACTION_SKIP, Modal.POSITION_OUT_LEFT);
    }
}