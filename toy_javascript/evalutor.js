import {
    Realm, 
    Reference, 
    EnvironmentRecord, 
    ExecutionContext,
    JSObject,
    JSString,
    JSNumber,
    JSNull,
    JSUndefined,
    JSSymbol,
    JSBoolean,
} from './runTime.js';

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
    Block(node){
        if(node.children.length === 2)
            return;
        return this.evalute(node.children[1]);
    }
    Statement(node) {
        return this.evalute(node.children[0]);
    }
    VariableDeclaration(node) {
        let runningExecutionContext = this.ecs[this.ecs.length - 1];
        runningExecutionContext.variableEnvironment[node.children[1].name] = new JSUndefined;
    }
    ExpressionStatement(node) {
        return this.evalute(node.children[0]);
    }
    Expression(node) {
        return this.evalute(node.children[0]);
    }
    IfStatement(node){
        let condition = this.evalute(node.children[2]);
        if(condition instanceof Reference)
            condition = condition.get();
        if(condition.toBoolean().value)
            return this.evalute(node.children[4]);
    }
    WhileStatement(node){
        while(true){
            let condition = this.evalute(node.children[2]);
            if(condition instanceof Reference)
                condition = condition.get();
            if(condition.toBoolean().value){
                this.evalute(node.children[4]);
            }else{
                break;
            }
        }
    }
    AdditiveExpression(node) {
        if (node.children.length === 1)
            return this.evalute(node.children[0]);
        else {
            let left = this.evalute(node.children[0]);
            let right = this.evalute(node.children[0]);
            if(left instanceof Reference)
                left = left.get();
            if(right instanceof Reference)
                right = right.get();
            if(node.children[1].type === "+")
                return left + right;
            if(node.children[1].type === "-")
                return new JSNumber(left.value - right.value);
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
    BooleanLiteral(node){
        if(node.value === "true")
            return new JSBoolean(true);
        else if(node.value === "false")
            return new JSBoolean(false);
    }
    NullLiteral(node){

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
        return new JSNumber(node.value);
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

        return new JSString(result);
    }
    ObjectLiteral(node) {
        if (node.children.length === 2) {
            return {}
        } else if (node.children.length === 3) {
            let obj = new JSObject;
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
    LogicalORExpression(node){
        if(node.children.length === 1){
            return this.evalute(node.children[0]);
        }
        let result = this.evalute(node.children[0]);
        if(result){
            return result;
        }else{
            return this.evalute(node.children[2]);
        }
    }
    LogicalANDExpression(node){
        if(node.children.length === 1){
            return this.evalute(node.children[0]);
        }
        let result = this.evalute(node.children[0]);
        if(result){
            return result;
        }else{
            return this.evalute(node.children[2]);
        }
    }
    LeftSideHandExpression(node){
        return this.evalute(node.children[0]);
    }
    CallExpression(node){
        if(node.children.length === 1){
            return this.evalute(node.children[0]);
        }
        if(node.children.length === 2){
            let func = this.evalute(node.children[0]);
            let argus = this.evalute(node.children[1]);
            return func.call(argus);
        }
    }
    NewExpression(node){
        if(node.children.length === 1){
            return this.evalute(node.children[0]);
        }

    }
    MemberExpression(node){
        if(node.children.length === 1){
            return this.evalute(node.children[0]);
        }
        if(node.children.length === 3){
            let obj = this.evalute(node.children[0]).get();
            let prop = obj.get(node.children[2].name);
            if("value" in prop)
                return prop.value;
            if("get" in prop){
                return prop.get.call(obj);
            }
        }
    }
}