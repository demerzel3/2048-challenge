import {Component, View, Inject} from 'angular2/angular2';
import {ROUTER_DIRECTIVES, Router} from 'angular2/router';

@Component({selector: 'home'})
@View({
    templateUrl: '/client/view/home.ng.html',
    directives: [ROUTER_DIRECTIVES],
})
export class Home {
    constructor(@Inject(Router) router) {
        if (Meteor.userId()) {
            router.navigateInstruction(router.generate(['/play']));
        }
    }
}