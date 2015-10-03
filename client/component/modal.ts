import {Component, View, Inject, ViewEncapsulation, NgClass} from 'angular2/angular2';

enum States {
    Hidden,
    Showing,
    Shown,
    Hiding,
    HidingLeft,
    HidingRight,
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
    // Used to control animation. When this is false, the modal is completely off screen.
    private isIn = false;
    private isCentered = false;

    private state:States = States.Hidden;

    show() {
        this.isIn = true;
        window.setTimeout(zone.bind(() => {
            this.isCentered = true;
        }));
    }

    hide() {
        this.isCentered = false;
    }

    onTransitionEnd(event) {
        console.log(event.target);
        console.log('modal animation end');
    }
}