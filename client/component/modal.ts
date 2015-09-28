import {Component, View, Inject, ViewEncapsulation, NgClass, OnChanges} from 'angular2/angular2';

@Component({
    selector: 'modal',
    properties: ['isVisible: visible']
})
@View({
    templateUrl: '/client/component/modal.ng.html',
    encapsulation: ViewEncapsulation.None,
    directives: [NgClass],
})
export class Modal implements OnChanges {
    private isVisible = false;
    private animate = false;

    show() {
        this.isVisible = true;
    }

    onChanges(changes: StringMap<string, any>) {
        if (changes['isVisible'] && changes['isVisible'].currentValue) {
            window.setTimeout(zone.bind(() => {
                this.animate = true;
            }), 100);
        }
    }
}