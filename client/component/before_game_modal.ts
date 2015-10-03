import {Component, View, Inject, ViewEncapsulation, NgClass, OpaqueToken, AppViewManager, ElementRef, OnInit} from 'angular2/angular2';
import {Modal} from './modal';

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
export class BeforeGameModal implements OnInit {
    private elementRef:ElementRef;
    private appViewManager:AppViewManager;
    private modalRef:Modal;
    private resultPromise:Promise;

    private onSuccess:(result:any) => void;
    private onError:(e:Error) => void;

    private level:ILevel;
    private game:IGame;

    public static ACTION_PLAY = new OpaqueToken();
    public static ACTION_SKIP = new OpaqueToken();

    constructor(
        @Inject(IBeforeGameModalParams) params:IBeforeGameModalParams,
        @Inject(AppViewManager) appViewManager:AppViewManager,
        @Inject(ElementRef) elementRef:ElementRef
    ) {
        this.level = params.level;
        this.game = params.game;
        this.elementRef = elementRef;
        this.appViewManager = appViewManager;

        this.resultPromise = new Promise((resolve, reject) => {
            this.onSuccess = resolve;
            this.onError = reject;
        });
    }

    public onInit() {
        console.log(this.elementRef.nativeElement);
        const modalElementRef = this.appViewManager.getNamedElementInComponentView(this.elementRef, 'modal');
        console.log(modalElementRef.nativeElement);
        this.modalRef = this.appViewManager.getComponent(modalElementRef);
        console.log('modal ref:', this.modalRef);

        this.modalRef.show();
    }

    public getResult() {
        return this.resultPromise;
    }

    private close(result:any) {
        this.modalRef.hide().then(() => this.onSuccess(result));
    }

    public play() {
        this.close(BeforeGameModal.ACTION_PLAY);
    }

    public skip() {
        this.onSuccess(BeforeGameModal.ACTION_SKIP);
    }
}