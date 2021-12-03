import { Component, createElement, STATESYMBOL, ATTRSSYMBOL } from './framework.js';
import { enableGesture } from './gesture/gesture.js';
import { Animation, Timeline } from './animation.js';
import { ease } from './cubicBezier.js';

export { STATESYMBOL, ATTRSSYMBOL } from './framework.js';

export class Carousel extends Component {
    constructor() {
        super();
    }

    render() {
        this.root = document.createElement("div");
        this.root.classList.add('crasoul');
        for (let record of this[ATTRSSYMBOL].src) {
            // img can be dragged,so use div
            let child = document.createElement('div');
            child.style.backgroundImage = `url(${record.img} )`;
            this.root.appendChild(child);
        }
        enableGesture(this.root);
        this[STATESYMBOL].position = 0;
        let children = this.root.children;
        let timeline = new Timeline;
        timeline.start();


        let ax = 0;
        let t = 0;
        let handler = null;

        this.root.addEventListener('start', event => {
            timeline.pause();
            clearInterval(handler);
            let progress = (Date.now() - t) / 500;
            ax = ease(progress) * 500 - 500;
        })
        this.root.addEventListener('tap', event => {
            this.triggerEvent('click',{
                data: this[ATTRSSYMBOL].src[this[STATESYMBOL].position],
                position:this[STATESYMBOL].position
            });
        })
        this.root.addEventListener('pan', event => {
            let x = event.clientX - event.startX - ax;
            let current = this[STATESYMBOL].position + ((x - x % 500) / 500);
            for (let offset of [-2, -1, 0, 1, 2]) {
                let pos = current + offset;
                pos = (pos % children.length + children.length) % children.length;

                children[pos].style.transition = "none";
                children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 + x % 500}px)`;
            }
        })
        this.root.addEventListener('end', event => {
            timeline.reset();
            timeline.start();
            handler = setInterval(nextPicture, 3000);

            let x = event.clientX - event.startX - ax;
            let current = this[STATESYMBOL].position - ((x - x % 500) / 500);

            let direction = Math.round((x % 500) / 500);

            if (event.isFlick) {
                if (event.velocity < 0) {
                    direction = Math.ceil((x % 500) / 500);
                } else {
                    direction = Math.floor((x % 500) / 500);
                }
            }

            for (let offset of [-2, -1, 0, 1, 2]) {
                let pos = current + offset;
                pos = (pos % children.length + children.length) % children.length;

                children[pos].style.transition = "none";

                timeline.add(new Animation(children[pos].style, "transform",
                    - pos * 500 + offset * 500 + x % 500,
                    - pos * 500 + offset * 500 + direction * 500,
                    500, 0, ease, v => `translateX(${v}px)`));
            }

            this[STATESYMBOL].position = this[STATESYMBOL].position - ((x - x % 500) / 500) - direction;
            this[STATESYMBOL].position = (this[STATESYMBOL].position % children.length + children.length) % children.length;
            this.triggerEvent('change',{position:this[STATESYMBOL].position});
        })

        let nextPicture = () => {
            let children = this.root.children;
            // % to promise the circulation
            let nextPosition = (this[STATESYMBOL].position + 1) % children.length;

            let current = children[this[STATESYMBOL].position];
            let next = children[nextPosition];

            t = Date.now();
            // next.style.transition = "none";
            // next.style.transform = `translateX(${500 - nextPosition * 500}px)`;

            timeline.add(new Animation(current.style, "transform",
                - this[STATESYMBOL].position * 500, -500 - this[STATESYMBOL].position * 500, 500, 0, ease, v => `translateX(${v}px)`))
            timeline.add(new Animation(next.style, "transform",
                500 - nextPosition * 500, - nextPosition * 500, 500, 0, ease, v => `translateX(${v}px)`));

            this[STATESYMBOL].position = nextPosition;
            this.triggerEvent('change',{position:this[STATESYMBOL].position});
        }
        handler = setInterval(nextPicture, 3000);
        // this.root.addEventListener("mousedown", event => {
        //     let children = this.root.children;
        //     let startX = event.clientX;//, startY = event.clientY;

        //     let move = event => {
        //         let x = event.clientX - startX;//, y = event.clientY - startY;

        //         let current = position + ((x - x % 500) / 500);
        //         for (let offset of [-2, -1, 0, 1, 2]) {
        //             let pos = current + offset;
        //             pos = (pos + children.length) % children.length;

        //             children[pos].style.transition = "none";
        //             children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 + x % 500}px)`;
        //         }
        //     }
        //     let up = event => {
        //         let x = event.clientX - startX;
        //         position = position - Math.round(x / 500);

        //         for (let offset of [0, - Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]) {
        //             let pos = position + offset;
        //             pos = (pos + children.length) % children.length;

        //             children[pos].style.transition = "";
        //             children[pos].style.transform = `translateX(${- pos * 500 + offset * 500}px)`;
        //         }
        //         document.removeEventListener("mousemove", move);
        //         document.removeEventListener("mouseup", up);
        //     }

        //     document.addEventListener("mousemove", move);
        //     document.addEventListener("mouseup", up);
        // })


        /*let currentIndex = 0;
        setInterval(() => {
            let children = this.root.children;
            // % to promise the circulation
            let nextIndex = (currentIndex+1) % children.length;

            let current = children[currentIndex];
            let next = children[nextIndex];

            next.style.transition = "none";
            next.style.transform = `translateX(${100 - nextIndex * 100}%)`;

            // 16ms/frame in browser
            setTimeout(() => {
                next.style.transition = "";//get JS rule empty to make CSS rule work 
                current.style.transform = `translateX(${-100 - currentIndex * 100}%)`;
                next.style.transform = `translateX(${- nextIndex * 100}%)`;
                //promise the next picture change
                currentIndex = nextIndex;
            }, 16);
        }, 3000);
        */

        return this.root;
    }
}