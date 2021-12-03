import { Component, createElement, STATESYMBOL, ATTRSSYMBOL } from './framework.js';
import { enableGesture } from './gesture/gesture.js';

export { STATESYMBOL, ATTRSSYMBOL } from './framework.js';

export class List extends Component {
    constructor() {
        super();
    }

    render() {
        debugger
        this.children = this[ATTRSSYMBOL].data.map(this.template);
        this.root = (<div>{this.children}</div>).render();
        return this.root;
    }
    appendChild(child){
        this.template = (child);
    }
}