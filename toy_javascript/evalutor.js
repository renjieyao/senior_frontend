import {Realm, Reference, EnvironmentRecord, ExecutionContext} from './runTime.js';

export class Evalutor{
    constructor(){
        this.realm = new Realm();
        this.globalObject = {}
        this.ecs = [new ExecutionContext(this.realm,this.globalObject)];
    }
    evalute(node) {
        if (this[node.type]) {
            let result = this[node.type](node);
            return result;
        }
    }
    Program(node) {
        return this.evalute(node.children[0]);
    }
    StatementList(node) {
        if (node.children.length === 1) {
            return this.evalute(node.children[0]);
        } else {
            this.evalute(node.children[0]);
            return this.evalute(node.children[1]);
        }
    }
    Statement(node) {
        return this.evalute(node.children[0]);
    }
    VariableDeclaration(node) {
        let runningExecutionContext = this.ecs[this.ecs.length - 1];
        runningExecutionContext.variableEnvironment[node.children[1].name];
    }
    ExpressionStatement(node) {
        return this.evalute(node.children[0]);
    }
    Expression(node) {
        return this.evalute(node.children[0]);
    }
    AdditiveExpression(node) {
        if (node.children.length === 1)
            return this.evalute(node.children[0]);
        else {
            // TODO
        }
    }
    MultiplicativeExpression(node) {
        if (node.children.length === 1)
            return this.evalute(node.children[0]);
        else {
            // TODO
        }
    }
    PrimaryExpression(node) {
        if (node.children.length === 1)
            return this.evalute(node.children[0]);
    }
    Literal(node) {
        return this.evalute(node.children[0]);
    }
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

            if (c >= "A".charCodeAt(0)) {
                c = c - "A".charCodeAt(0) + 10;
            } else if (c >= "a".charCodeAt(0)) {
                c = c - "a".charCodeAt(0) + 10;
            } else if (c >= "0".charCodeAt(0)) {
                c = c - "0".charCodeAt(0);
            }
            // charCodeAt() returns an integer between 0 and 65535
            // representing the UTF-16 code unit at the given index.
            value = value * n + c;
        }
        return value;
    }
    StringLiteral(node) {
        let str = node.value;
        let result = [];
        for (let i = 1; i < str.length - 1; i++) {
            if (str[i] === "\\") {
                ++i;
                let c = str[i];
                let map = {
                    "\"": "\"",
                    "\'": "\'",
                    "\\": "\\",
                    "0": String.fromCharCode(0x0000),
                    "b": String.fromCharCode(0x0008),
                    "t": String.fromCharCode(0x0009),
                    "n": String.fromCharCode(0x000A),
                    "v": String.fromCharCode(0x000B),
                    "f": String.fromCharCode(0x000C),
                    "r": String.fromCharCode(0x000D)
                }
                if (c in map) {
                    result.push(map[c]);
                } else {
                    result.push(c);
                }
            } else {
                result.push(str[i]);
            }
        }

        return result.join();
    }
    ObjectLiteral(node) {
        if (node.children.length === 2) {
            return {}
        } else if (node.children.length === 3) {
            let obj = new Map();
            this.PropertyList(node.children[1], obj);
            // obj.prototype=
            return obj;
        }
    }
    PropertyList(node, object) {
        if (node.children.length === 1) {
            this.Property(node.children[0], object);
        } else {
            this.PropertyList(node.children[0], object);
            this.Property(node.children[2], object);
        }
    }
    Property(node, object) {
        let name;
        if (node.children[0].type === "Identifier") {
            name = node.children[0].name;
        } else if (node.children[0].type === "StringLiteral") {
            name = this.evalute(node.children[0])
        }
        object.set(name, {
            value: this.evalute(node.children[2]),
            wirtable: true,
            enumerable: true,
            configurable: true,
        })
    }
    Identifier(node) {
        let runningExecutionContext = this.ecs[this.ecs.length - 1];
        return new Reference(
            runningExecutionContext.lexicalEnvironment,
            node.name
        )
    }
    AssignmentExpression(node) {
        if (node.children.length === 1) {
            return this.evalute(node.children[0]);
        }
        let left = this.evalute(node.children[0]);
        let right = this.evalute(node.children[2]);
        left.set(right);
    }
}