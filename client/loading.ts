import {Component, View, Inject} from 'angular2/angular2';
import {ROUTER_DIRECTIVES, Router} from 'angular2/router';

@Component({selector: 'loading'})
@View({
    template: '<h1>loading...</h1>',
})
export class Loading {
    constructor() {
        console.log('DA FUCK');
    }
}