export function createElement(type,attrs,...children){
    let element;
    if(typeof type === "string")
        element= new ElementWarpper(type);
    else
        element = new type;
    
    for(let name in attrs){
        element.setAttribute(name,attrs[name]);
    }

    let processChildren = (children)=>{
        for(let child of children){
            console.log("child",child)
            if((typeof child === "object") && (child instanceof Array)){
                processChildren(child);
                continue;
            }
            if(typeof child === "string"){
                child = new TextNodeWarpper(child);
            }
            element.appendChild(child);
        }
    }
    processChildren(children);
    return element;
}
export const STATESYMBOL = Symbol('state');
export const ATTRSSYMBOL = Symbol('state');

export class Component{
    constructor(){
        this[ATTRSSYMBOL] = Object.create(null);
        this[STATESYMBOL] = Object.create(null);
    }
    render(){
        return this.root;
    }
    setAttribute(name, value) {
        this[ATTRSSYMBOL][name] = value;
    }
    appendChild(child){
        child.mountTo(this.root);
    }
    mountTo(parent){
        if(!this.root)
            this.render();
        parent.appendChild(this.root);
    }
    triggerEvent(type,args){
        this[ATTRSSYMBOL]["on"+type.replace(/^[\s\S]/,s=>s.toUpperCase())](new CustomEvent(type,{detail:args}))
    }
}

class ElementWarpper extends Component{
    constructor(type){
        super();
        this.root = document.createElement(type);
    }
    setAttribute(name, value) {
        this.root.setAttribute(name,value);
    }
}

class TextNodeWarpper extends Component{
    constructor(content){
        super();
        this.root = document.createTextNode(content);
    }
}