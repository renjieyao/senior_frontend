export function createElement(type,attrs,...children){
    let element;
    if(typeof type === "string")
        element= new ElementWarpper(type);
    else
        element = new type;
    
    for(let name in attrs){
        element.setAttribute(name,attrs[name]);
    }

    for(let child of children){
        if(typeof child === "string"){
            child = new TextNodeWarpper(child);
        }
        element.appendChild(child);
    }
    return element;
}

export class Component{
    constructor(){

    }
    setAttribute(name,value){
        this.root.setAttribute(name,value);
    }
    appendChild(child){
        child.mountTo(this.root);
    }
    mountTo(parent){
        parent.appendChild(this.root);
    }
}

class ElementWarpper extends Component{
    constructor(type){
        super();
        this.root = document.createElement(type);
    }
}

class TextNodeWarpper extends Component{
    constructor(content){
        super();
        this.root = document.createTextNode(content);
    }
}