import { scan } from './LexParser.js';
// EOF ::= end of file
let syntax = {
    Program: [["StatementList", "EOF"]],
    StatementList: [
        ["Statement"],
        ["Statement", "StatementList"]
    ],
    Statement: [
        ["ExpressionStatement"],
        ["IfStatement"],
        ["VariableDeclaration"],
        ["FunctionDeclaration"],
    ],
    IfStatement: [
        ["if", "(", "Expression", ")", "Statement"]
    ],
    VariableDeclaration: [
        ["var", "Identifier", ";"],
        ["let", "Identifier", ";"],
    ],
    FunctionDeclaration: [
        ["function", "Identifier", "(", ")", "{", "StatementList", "}"]
    ],
    // ";" is necessary for now
    ExpressionStatement: [
        ["Expression", ";"]
    ],
    Expression: [
        ["AdditiveExpression"]
    ],
    AdditiveExpression: [
        ["MultiplicativeExpression"],
        ["AdditiveExpression", "+", "MultiplicativeExpression"],
        ["AdditiveExpression", "-", "MultiplicativeExpression"],
    ],
    MultiplicativeExpression: [
        ["PrimaryExpression"],
        ["MultiplicativeExpression", "*", "PrimaryExpression"],
        ["MultiplicativeExpression", "/", "PrimaryExpression"],
    ],
    PrimaryExpression: [
        ["(", "Expression", ")"],
        ["Literal"],
        ["Identifier"],
    ],
    Literal: [
        ["NumericLiteral"],
        ["StringLiteral"],
        ["BooleanLiteral"],
        ["NullLiteral"],
        ["RegularExpressionLiteral"],
        ["ObjectLiteral"],
        ["ArrayLiteral"],
    ],
    ObjectLiteral:[
        ["{","}"],
        ["{","PropertyList","}"]
    ],
    PropertyList:[
        ["Property"],
        ["PropertyList",",","Property"]
    ],
    Property:[
        ["StringLiteral",":","AdditiveExpression"],
        ["Identifier",":","AdditiveExpression"],
    ],
}

let hash = {

}

function closure(state) {
    let queue = [];
    hash[JSON.stringify(state)] = state;
    for (let symbol in state) {
        // filter reduceType
        if (symbol.match(/^\$/))
            continue;
        // Enqueue
        queue.push(symbol);
    }
    while (queue.length) {
        // Dequeue
        let symbol = queue.shift();
        if (syntax[symbol]) {
            for (let rule of syntax[symbol]) {
                if (!state[rule[0]])
                    queue.push(rule[0]);
                let current = state;
                for (let part of rule) {
                    if (!current[part])
                        current[part] = {};
                    current = current[part];
                }
                current.$reduceType = symbol;
                current.$reduceLength = rule.length;
            }
        }
    }

    for (let symbol in state) {
        // filter reduceType
        if (symbol.match(/^\$/))
            continue;
        if (hash[JSON.stringify(state[symbol])])
            state[symbol] = hash[JSON.stringify(state[symbol])];
        else closure(state[symbol]);
    }
}

let end = {
    $isEnd: true,
};
let start = {
    "Program": end
}

closure(start);

function parse(source) {
    let stack = [start];
    let symbolStack = [];
    function reduce() {
        let state = stack[stack.length - 1];

        if (state.$reduceType) {
            let children = [];
            for (let i = 0; i < state.$reduceLength; i++) {
                stack.pop()
                children.push(symbolStack.pop());
            }

            // create a non-terminal symbol and shift it
            return {
                type: state.$reduceType,
                children: children.reverse(),
            }
        } else {
            throw new Error('unexpected token')
        }

    }
    function shift(symbol) {
        let state = stack[stack.length - 1];
        if (symbol.type in state) {
            stack.push(state[symbol.type]);
            symbolStack.push(symbol);
        } else {
            /*reudce to non-terminal symbol*/
            shift(reduce());
            shift(symbol);
        }
    }
    for (let symbol/*terminal symbol*/ of scan(source)) {
        shift(symbol);
    }
    return reduce();
}

/****************************** *******************************/

let evalutorTree = {
    Program(node) {
        return evalutor(node.children[0]);
    },
    StatementList(node) {
        if (node.children.length === 1) {
            return evalutor(node.children[0]);
        } else {
            evalutor(node.children[0]);
            return evalutor(node.children[1]);
        }
    },
    Statement(node) {
        return evalutor(node.children[0]);
    },
    VariableDeclaration(node) {
        console.log('declarate variable ' + node.children[1].name);
    },
    ExpressionStatement(node) {
        return evalutor(node.children[0]);
    },
    Expression(node) {
        return evalutor(node.children[0]);
    },
    AdditiveExpression(node) {
        if (node.children.length === 1)
            return evalutor(node.children[0]);
        else {
            // TODO
        }
    },
    MultiplicativeExpression(node) {
        if (node.children.length === 1)
            return evalutor(node.children[0]);
        else {
            // TODO
        }
    },
    PrimaryExpression(node) {
        if (node.children.length === 1)
            return evalutor(node.children[0]);
    },
    Literal(node) {
        return evalutor(node.children[0]);
    },
    NumericLiteral(node) {
        let valueStr = node.value;
        let value = 0;
        let len = valueStr.length;
        let n = 10;
        if (valueStr.match(/^0b/)) {
            n = 2;
            len -= 2;
        } else if (valueStr.match(/^0o/)) {
            n = 8;
            len -= 2;
        } else if (valueStr.match(/^0x/)) {
            n = 16;
            len -= 2;
        }

        while (len--) {
            let c = valueStr.charCodeAt(valueStr.length - 1 - len);

            if(c >= "A".charCodeAt(0)){
                c = c - "A".charCodeAt(0) + 10;
            }else if(c >= "a".charCodeAt(0)){
                c = c - "a".charCodeAt(0) + 10;
            }else if(c >= "0".charCodeAt(0)){
                c = c - "0".charCodeAt(0);
            }
            // charCodeAt() returns an integer between 0 and 65535
            // representing the UTF-16 code unit at the given index.
            value = value * n + c;
        }
        return value;
    },
    StringLiteral(node){
        let str = node.value;
        let result = [];
        for(let i = 1;i < str.length-1;i++){
            if(str[i] === "\\"){
                ++i;
                let c = str[i];
                let map = {
                    "\"":"\"",
                    "\'":"\'",
                    "\\":"\\",
                    "0":String.fromCharCode(0x0000),
                    "b":String.fromCharCode(0x0008),
                    "t":String.fromCharCode(0x0009),
                    "n":String.fromCharCode(0x000A),
                    "v":String.fromCharCode(0x000B),
                    "f":String.fromCharCode(0x000C),
                    "r":String.fromCharCode(0x000D),
                }
                if(c in map){
                    result.push(map[c]);
                }else{
                    result.push(c);
                }
            }else{
                result.push(str[i]);
            }
        }
        
        return result.join();
    },
    ObjectLiteral(node){
        if(node.children.length === 2){
            return {}
        }else if(node.children.length === 3){
            let obj = new Map();
            this.PropertyList(node.children[1],obj);
            // obj.prototype=
            return obj;
        }
    },
    PropertyList(node,object){
        if(node.children.length === 1){
            this.Property(node.children[0],object);
        }else{
            this.PropertyList(node.children[0],object);
            this.Property(node.children[2],object);
        }
    },
    Property(node,object){
        let name;
        if(node.children[0].type === "Identifier"){
            name = node.children[0].name;
        }else if(node.children[0].type === "StringLiteral"){
            name = evalutor(node.children[0])
        }
        object.set(name,{
            value: evalutor(node.children[2]),
            wirtable: true,
            enumerable: true,
            configurable: true,
        })
    }
}

function evalutor(node) {
    if (evalutorTree[node.type]) {
        return evalutorTree[node.type](node);
    }
}

window.js={
    parse,evalutor
}