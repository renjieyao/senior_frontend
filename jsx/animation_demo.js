import {Timeline , Animation} from './animation.js';
import {linear,ease,easeIn,easeInOut,easeOut} from './cubicBezier.js'

let tl = new Timeline();

tl.start();

tl.add(new Animation(document.querySelector("#target").style,"transform",0,500,2000,0,ease,v => `translateX(${v}px)`))
document.querySelector("#target2").style.transition = 'transform ease 2s';
document.querySelector("#target2").style.transform = 'translateX(500px)';

document.querySelector("#pause").addEventListener('click', e => {
    tl.pause();
})

document.querySelector("#resume").addEventListener('click', e => {
    tl.resume();
})