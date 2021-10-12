import {scan} from './LexParser.js';
// EOF ::= end of file
let syntax = {
    Program: [["StatementList","EOF"]],
    StatementList: [
        ["Statement"],
        ["Statement","StatementList"]
    ],
    Statement: [
        ["ExpressionStatement"],
        ["IfStatement"],
        ["VariableDeclaration"],
        ["FunctionDeclaration"],
    ],
    IfStatement: [
        ["if","(","Expression",")","Statement"]
    ],
    VariableDeclaration:[
        ["var","Identifier",";"],
        ["let","Identifier",";"],
    ],
    FunctionDeclaration: [
        ["function","Identifier","(",")","{","StatementList","}"]
    ],
    ExpressionStatement:[
        ["Expression",";"]
    ],
    Expression: [
        ["AdditiveExpression"]
    ],
    AdditiveExpression: [
        ["MultiplicativeExpression"],
        ["AdditiveExpression","+","MultiplicativeExpression"],
        ["AdditiveExpression","-","MultiplicativeExpression"],
    ],
    MultiplicativeExpression: [
        ["PrimaryExpression"],
        ["MultiplicativeExpression","*","PrimaryExpression"],
        ["MultiplicativeExpression","/","PrimaryExpression"],
    ],
    PrimaryExpression: [
        ["(","Expression",")"],
        ["Literal"],
        ["Identifier"],
    ],
    Literal: [
        ["Number"]
    ]
}

let hash = {

}

function closure(state){
    let queue = [];
    hash[JSON.stringify(state)] = state;
    for(let symbol in state){
        // Enqueue
        queue.push(symbol);
    }
    while(queue.length){
        // Dequeue
        let symbol = queue.shift();
        if(syntax[symbol]){
            for(let rule of syntax[symbol]){
                if(!state[rule[0]])
                    queue.push(rule[0]);
                let current = state;
                for(let part of rule){
                    if(!current[part])
                        current[part] = {};
                    current = current[part];
                }
                current.$isRuleEnd = true;
            } 
        }
    }

    for(let symbol in state){
         if(hash[JSON.stringify(state[symbol])])
            state[symbol] = hash[JSON.stringify(state[symbol])];
        else closure(state[symbol]);
    }
}

let end = {
    $isEnd: true,
};
let start = {
    "Program":end
}

closure(start);

let source = (`
    let a;
`)

function parse(source){
    let state = start;
    for(let symbol of scan(source)){
        if(symbol.type in state){
            console.log(state);
            state = state[symbol.type];
        }
        else{
            debugger
        }
    }
}

parse(source);
