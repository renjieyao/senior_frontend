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
        ["WhileStatement"],
        ["VariableDeclaration"],
        ["FunctionDeclaration"],
        ["Block"],
        ["BreakStatement"],
        ["ContinueStatement"]
    ],
    BreakStatement:[
        ["break",";"]
    ],
    ContinueStatement:[
        ["continue",";"]
    ],
    Block:[
        ["{","StatementList","}"],
        ["{","}"]
    ],
    IfStatement: [
        ["if", "(", "Expression", ")", "Statement"]
    ],
    WhileStatement: [
        ["while", "(", "Expression", ")", "Statement"]
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
        ["AssignmentExpression"]
        // ["LogicalORExpression"]
    ],
    AssignmentExpression: [
        ["LeftSideHandExpression", "=", "LogicalORExpression"],
        ["LogicalORExpression"]
    ],
    LogicalORExpression: [
        ["LogicalANDExpression"],
        ["LogicalORExpression", "||", "LogicalANDExpression"]
    ],
    LogicalANDExpression: [
        ["AdditiveExpression"],
        ["LogicalANDExpression", "&&", "AdditiveExpression"]
    ],
    AdditiveExpression: [
        ["MultiplicativeExpression"],
        ["AdditiveExpression", "+", "MultiplicativeExpression"],
        ["AdditiveExpression", "-", "MultiplicativeExpression"],
    ],
    MultiplicativeExpression: [
        ["LeftSideHandExpression"],
        ["MultiplicativeExpression", "*", "LeftSideHandExpression"],
        ["MultiplicativeExpression", "/", "LeftSideHandExpression"],
    ],
    LeftSideHandExpression: [
        ["CallExpression"],
        ["NewExpression"]
    ],
    CallExpression: [
        ["MemberExpression", "Arguments"],
        ["CallExpression", "Arguments"],
    ],
    Arguments:[
        ["(",")"],
        ["(","ArgumentList",")"]
    ],
    ArgumentList:[
        ["AssignmentExpression"],
        ["ArgumentList",",","AssignmentExpression",]
    ],
    NewExpression: [
        ["MemberExpression"],
        ["new", "NewExpression"]
    ],
    MemberExpression: [
        ["PrimaryExpression"],
        ["PrimaryExpression", ".", "Identifier"],
        ["PrimaryExpression", "[", "Expression", "]"],
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
    ObjectLiteral: [
        ["{", "}"],
        ["{", "PropertyList", "}"]
    ],
    PropertyList: [
        ["Property"],
        ["PropertyList", ",", "Property"]
    ],
    Property: [
        ["StringLiteral", ":", "AdditiveExpression"],
        ["Identifier", ":", "AdditiveExpression"],
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

export function parse(source) {
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