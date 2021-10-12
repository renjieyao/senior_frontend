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
        ["Number"]
    ]
}

let hash = {

}

function closure(state) {
    let queue = [];
    hash[JSON.stringify(state)] = state;
    for (let symbol in state) {
        // filter reduceType
        if(symbol.match(/^\$/))
            return;
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
        if(symbol.match(/^\$/))
            return;
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

let source = (`
    let a;
`)

function parse(source) {
    let stack = [start];
    let symbolStack = [];
    function reduce(){
        let state = stack[stack.length-1];

        if(state.$reduceType){
            let children = [];
            for(let i = 0;i<state.$reduceLength;i++){
                stack.pop()
                children.push(symbolStack.pop());
            }

            // create a non-terminal symbol and shift it
            return {
                type: state.$reduceType,
                children:children.reverse(),
            }
        }else{
            throw new Error('unexpected token')
        }
        
    }
    function shift(symbol){
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

parse(source);
