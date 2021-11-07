import { Component, createElement } from './framework.js';

class Carousel extends Component {
    constructor() {
        super();
        this.attrs = Object.create(null);
    }
    setAttribute(name, value) {
        this.attrs[name] = value;
    }
    render() {
        this.root = document.createElement("div");
        this.root.classList.add('crasoul');
        for (let record of this.attrs.src) {
            // img can be dragged,so use div
            let child = document.createElement('div');
            child.style.backgroundImage = `url(${record} )`;
            this.root.appendChild(child);
        }

        let position = 0;

        this.root.addEventListener("mousedown", event => {
            let children = this.root.children;
            let startX = event.clientX;//, startY = event.clientY;

            let move = event => {
                let x = event.clientX - startX;//, y = event.clientY - startY;

                let current = position + ((x - x % 500) / 500);
                for (let offset of [-2, -1, 0, 1, 2]) {
                    let pos = current + offset;
                    pos = (pos + children.length) % children.length;

                    children[pos].style.transition = "none";
                    children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 + x % 500}px)`;
                }
            }
            let up = event => {
                let x = event.clientX - startX;
                position = position - Math.round(x / 500);

                for (let offset of [0, - Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]) {
                    let pos = position + offset;
                    pos = (pos + children.length) % children.length;

                    children[pos].style.transition = "";
                    children[pos].style.transform = `translateX(${- pos * 500 + offset * 500}px)`;
                }
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", up);
            }

            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);
        })


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
    mountTo(parent) {
        parent.appendChild(this.render());
    }
}

let source = [
    "https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg",
    "https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg",
    "https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg",
    "https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg",
]

let a = <Carousel id="hello" src={source}>

</Carousel>

// document.body.appendChild(a);
a.mountTo(document.body);