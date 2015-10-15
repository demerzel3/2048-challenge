import {Component, View, Inject, ViewEncapsulation, NgClass, OpaqueToken, ElementRef, AppViewManager} from 'angular2/angular2';
import {BaseModal, Modal} from './modal';

interface IWonModalParams {
    level:ILevel;
    game:IGame;
}
export const IWonModalParams = new OpaqueToken();

@Component({
    selector: 'won-modal',
})
@View({
    templateUrl: '/client/component/won_modal.ng.html',
    directives: [Modal],
})
export class WonModal extends BaseModal {
    public static ACTION_RETRY = new OpaqueToken();
    public static ACTION_NEXT = new OpaqueToken();

    private level:ILevel;
    private game:IGame;

    constructor(
        @Inject(AppViewManager) appViewManager:AppViewManager,
        @Inject(ElementRef) elementRef:ElementRef,
        @Inject(IWonModalParams) params:IWonModalParams
    ) {
        super(appViewManager, elementRef);

        this.level = params.level;
        this.game = params.game;
    }

    public retry() {
        this.close(WonModal.ACTION_RETRY);
    }

    public next() {
        this.close(WonModal.ACTION_NEXT, Modal.POSITION_OUT_LEFT);
    }
}