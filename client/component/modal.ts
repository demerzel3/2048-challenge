import {Component, View, Inject, ViewEncapsulation, NgClass, ElementRef, AppViewManager} from 'angular2/angular2';
import {Deferred} from '../deferred';

interface IModalStateMachine extends IStateMachine {
    show(fromPosition?:string);
    hide(toPosition?:string);
    transitionend();

    onentershowing:Function;
    onleaveshowing:Function;
    onshown:Function;
    onhiding:Function;
    onhidden:Function;
}

@Component({
    selector: 'modal',
    properties: ['isVisible: visible']
})
@View({
    templateUrl: '/client/component/modal.ng.html',
    encapsulation: ViewEncapsulation.None,
    directives: [NgClass],
})
export class Modal {
    public static POSITION_CENTERED = 'centered';
    public static POSITION_OUT_LEFT = 'out-left';
    public static POSITION_OUT_RIGHT = 'out-right';

    // Used to control animation. When this is false, the modal is completely off screen.
    private isIn:boolean = false;
    private position:string = null;

    private sm:IModalStateMachine;

    private showDeferred:Deferred;
    private hideDeferred:Deferred;

    constructor() {
        this.sm = <IModalStateMachine>StateMachine.create({
            initial: 'hidden',
            events: [
                {name: 'show', from: 'hidden', to: 'showing'},
                {name: 'transitionend', from: 'showing', to: 'shown'},
                {name: 'hide', from: 'shown', to: 'hiding'},
                {name: 'transitionend', from: 'hiding', to: 'hidden'},
            ],
        });

        // TODO: find a way to generalize the timeout behavior.
        let showingTimeout;
        this.sm.onentershowing = (event, from, to, fromPosition) => {
            showingTimeout = window.setTimeout(() => {
                this.sm.transitionend();
            }, 700);

            this.isIn = true;
            if (fromPosition) {
                this.position = fromPosition;
            }
            window.setTimeout(zone.bind(() => {
                this.position = Modal.POSITION_CENTERED;
            }));
        };
        this.sm.onleaveshowing = () => {
            window.clearTimeout(showingTimeout);
        };

        this.sm.onshown = () => {
            console.log('>>>>> SHOWN!!');
            if (this.showDeferred) {
                this.showDeferred.resolve(true);
            }
        };

        this.sm.onhiding = (event, from, to, toPosition) => {
            this.position = toPosition;
        };

        this.sm.onhidden = zone.bind(() => {
            this.isIn = false;
            console.log('<<<<< HIDDEN!');
            if (this.hideDeferred) {
                this.hideDeferred.resolve(true);
            }
        });
    }

    show(fromPosition:string = Modal.POSITION_CENTERED) {
        this.showDeferred = new Deferred();
        this.sm.show(fromPosition);

        return this.showDeferred.promise;
    }

    hide(toPosition:string = null) {
        this.hideDeferred = new Deferred();
        this.sm.hide(toPosition);

        return this.hideDeferred.promise;
    }

    onTransitionEnd(event) {
        if (this.sm.can('transitionend')) {
            this.sm.transitionend();
        }
    }
}

/**
 * In order to implement new modals you have to extend this class.
 */
export class BaseModal implements OnInit {
    private modalRef:Modal;
    private resultDeferred:Deferred;

    constructor(
        private appViewManager:AppViewManager,
        private elementRef:ElementRef,
        private modalRefName:string = 'modal') {
        this.resultDeferred = new Deferred();
    }

    public onInit() {
        console.log(this.elementRef.nativeElement);
        const modalElementRef = this.appViewManager.getNamedElementInComponentView(this.elementRef, this.modalRefName);
        console.log(modalElementRef.nativeElement);
        this.modalRef = this.appViewManager.getComponent(modalElementRef);
        console.log('modal ref:', this.modalRef);

        this.modalRef.show();
    }

    protected close(result:any, hidePosition:string = null) {
        this.modalRef.hide(hidePosition).then(() => this.resultDeferred.resolve(result));
    }

    public getResult() {
        return this.resultDeferred.promise;
    }
}
