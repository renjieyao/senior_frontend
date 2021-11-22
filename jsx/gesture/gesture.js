let element = document.documentElement;

let isListening = false;

element.addEventListener('mousedown', event => {
    let context = Object.create(null);
    contexts.set('mouse' + (1 << event.button), context);
    start(event,context);

    let mousemove = event =>{
        let button = 1;
        
        while(button <= event.buttons){
            if(button && event.buttons){
                // order of buttons & button property is not same
                let key;
                if(key === 2)
                    button = 4;
                else if(key === 4)
                    button = 2;
                else
                    key = button;
                let context = contexts.get('mouse' + key);
                move(event,context); 
            }
            button = button << 1;
        }
    }
    let mouseup = event => {
        let context = contexts.get('mouse' + (1 << event.button));
        end(event, context);
        contexts.delete('mouse' + (1 << event.button));
        if(event.buttons === 0){
            element.removeEventListener('mousemove',mousemove);
            element.removeEventListener('up',mouseup);
            isListening = false;
        }
    }
    if(!isListening){
        element.addEventListener('mousemove',mousemove);
        element.addEventListener('mouseup', mouseup);
        isListening = true;
    }
});
let contexts = new Map();
element.addEventListener("touchstart", event => {
    for(let touch of event.changedTouches){
        let context = Object.create(null);
        contexts.set(touch.identifier, context);
        start(touch,context);
    }
})

element.addEventListener("touchmove", event => {
    for(let touch of event.changedTouches){
        let context = contexts.get(touch.identifier);
        move(touch,context);
    }
})

element.addEventListener("touchend", event => {
    for(let touch of event.changedTouches){
        let context = contexts.get(touch.identifier);
        end(touch, context);
        contexts.delete(touch.identifier);
    }
})

element.addEventListener("touchcancel", event => {
    for(let touch of event.changedTouches){
        let context = contexts.get(touch.identifier);
        cancel(touch,context);
    }
})

let start = (point,context)=>{
    // console.log('mousedown');
    context.startX = point.clientX, context.startY = point.clientY;

    context.isPan = false;
    context.isTap = true;
    context.isPress = false;

    context.handler = setTimeout(() => {
        context.isPan = false;
        context.isTap = false;
        context.isPress = true;
        context.handler = null;
        console.log('press');
    }, 500);
}
let move = (point,context) => {
    let dx = point.clientX - context.startX,dy = point.clientY - context.startY;

    if(!context.isPan && dx ** 2 + dy ** 2 > 100){
        context.isPan = true;
        context.isTap = false;
        context.isPress = false;
        console.log('panstart');
        clearTimeout(context.handler);
    }

    if(context.isPan){
        console.log('pan')
    }
    // console.log('mousemove',point.clientX,point.clientY);
}
let end = (point,context) => {
    if(context.isPan){
        console.log('panend');
        clearTimeout(context.handler);
    }
    if(context.isTap){
        console.log('tap')
    }
    if(context.isPress){
        console.log('pressend')
    }
    
}
let cancel = (point,context) =>{
    clearTimeout(context.handler);
    console.log('cancel',point.clientX,point.clientY)
}
