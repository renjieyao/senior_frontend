const EOF = Symbol('EOF');//end of file
const css = require('css');
// const layout =require('./layout.js');

let currentToken;
let currentAttr;
let currentTextNode;
let stack;

let endConditionArr = ['/', '>', EOF];


let rules = [];
function addCSSRule(text) {
    let ast = css.parse(text);
    rules.push(...ast.stylesheet.rules);
}
function match(element, selector) {
    if (!selector || !element.attrs)
        return false;
    // simple selector
    if (selector.charAt(0) == '#') {
        var attr = element.attrs.filter(attr => attr.name === 'id')[0];
        if (attr && attr.value === selector.replace('#', ''))
            return true;
    } else if (selector.charAt(0) == '.') {
        var attr = element.attrs.filter(attr => attr.name === 'class')[0];
        if (attr && attr.value === selector.replace('.', ''))
            return true;
    } else {
        if (element.tagName === selector)
            return true;
    }
    return false;
}
function specificity(selector) {
    //      style #id  .class tag 
    // p = [0,    0,    0,    0,];
    // no carry  array
    var p = [0, 0, 0, 0,];
    var selectorsParts = selector.split(' ');
    for (var part of selectorsParts) {
        if (part.charAt(0) == '#') {
            p[1] += 1;
        } else if (part.charAt(0) == '.') {
            p[2] += 1;
        } else {
            p[3] += 1;
        }
    }
    return p;
}
function compare(pre, cur) {
    if (pre[0] - cur[0])
        return pre[0] - cur[0];
    if (pre[1] - cur[1])
        return pre[1] - cur[1];
    if (pre[2] - cur[2])
        return pre[2] - cur[2];
    return pre[3] - cur[2]
}

function computeCSS(element) {
    // we must estimate the match between the rule and the element by all elements' parent.
    // all elements' parent in stack.
    // because the stack is variable,using the function of slice to copy the orginal array.
    // the order of matching tag: from current element to its parent level by level. 
    var elements = stack.slice().reverse();
    if (!element.computedStyle)
        element.computedStyle = {};

    for (let rule of rules) {
        // The function of reverse to keep the order with the parent element.
        // ignore the comlicated selectors
        var selectorParts = rule.selectors[0].split(' ').reverse();

        if (!match(element, selectorParts[0]))
            continue;

        let matched = false;
        var j = 1;
        for (var i = 0; i < elements.length; i++) {
            // 
            if (match(elements[i], selectorParts[j])) {
                j++;
            }
        }
        if (j >= selectorParts.length) {
            matched = true;
        }
        if (matched) {
            var sp = specificity(rule.selectors[0]);
            var computedStyle = element.computedStyle;
            for (var declaration of rule.declarations) {
                if (!computedStyle[declaration.property]) {
                    computedStyle[declaration.property] = {};
                }
                if (!computedStyle[declaration.property].specificity) {
                    computedStyle[declaration.property].specificity = sp;
                } else if (compare(computedStyle[declaration.property].specificity, sp)) {
                    computedStyle[declaration.property].specificity = sp;
                }
                computedStyle[declaration.property].value = declaration.value;
            }
        }
    }
}
function emit(token) {
    let top = stack[stack.length - 1];
    if (token.type === 'startTag') {
        let element = {
            type: 'element',
            children: [],
            attrs: [],
        }

        element.tagName = token.tagName;

        for (let p in token) {
            if (p !== 'type' && p !== 'tagName') {
                element.attrs.push({
                    name: p,
                    value: token[p]
                })
            }
        }
        //parse startTag with computing CSS rules
        computeCSS(element);

        top.children.push(element);
        element.parent = top;

        if (!token.isSelfCloseTag) {
            stack.push(element);
        }

        currentTextNode = null;
    } else if (token.type === 'endTag') {
        if (top.tagName !== token.tagName) {
            throw new Error('tag start doesn\'t match')
        } else {
            // when the tag of style appeared,add css rule
            if (top.tagName === 'style') {
                addCSSRule(top.children[0].content);
            }
            // layout(top);
            stack.pop();
        }
        currentTextNode = null;
    } else if (token.type === 'text') {
        if (currentTextNode == null) {
            currentTextNode = {
                type: 'text',
                content: ''
            }
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}

function data(c) {
    if (c === '<') {
        return tagOpen;
    } else if (c == EOF) {
        emit({
            type: 'EOF',
        })
        return;
    } else {
        emit({
            type: 'text',
            content: c,
        })
        return data;
    }
}

function tagOpen(c) {
    if (c === '/') {
        return endTagOpen;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'startTag',
            tagName: '',
        }
        // reConsume
        return tagName(c);
    } else {
        return;
    }
}

function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: ''
        }
        return tagName(c);
    } else if (c === '>') {

    } else if (c == EOF) {

    } else {

    }
}

function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttrName;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c;
        return tagName;
    } else if (c === '/') {
        return selfCloseStartTag;
    } else if (c === '>') {
        emit(currentToken);
        return data;
    } else {
        return tagName;
    }
}

function beforeAttrName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttrName;
    } else if (c === '=') {

    } else if (endConditionArr.includes(c)) {
        return afterAttrName(c);
    } else {
        currentAttr = {
            name: '',
            value: ''
        }
        return attrName(c);
    }
}

function attrName(c) {
    let attrConditionArr = ['\'', '<', '"'];
    if (c.match(/^[\t\n\f ]$/) || endConditionArr.includes(c)) {
        return afterAttrName;
    } else if (c === '=') {
        return beforeAttrValue;
    } else if (c === '\u0000') {

    } else if (attrConditionArr.includes(c)) {

    } else {
        currentAttr.name += c;
        return attrName;
    }
}

function beforeAttrValue(c) {
    if (c === '"') {
        return doubleQuotedAttrVal;
    } else if (c === '\'') {
        return singleQuotedAttrVal;
    } else if (c.match(/^[\t\n\f ]$/) || endConditionArr.includes(c)) {
        return beforeAttrValue;
    } else if (c === '>') {

    } else {
        return unquotedAttrValue(c);
    }
}

function doubleQuotedAttrVal(c) {
    if (c === '"') {
        currentToken[currentAttr.name] = currentAttr.value;
        return afterQuotedAttrValue;
    } else if (c === '\u0000') {

    } else if (c == EOF) {

    } else {
        currentAttr.value += c;
        return doubleQuotedAttrVal;
    }
}

function singleQuotedAttrVal(c) {
    if (c === '"') {
        currentToken[currentAttr.name] = currentAttr.value;
        return afterQuotedAttrValue;
    } else if (c === '\u0000') {

    } else if (c == EOF) {

    } else {
        currentAttr.value += c;
        return doubleQuotedAttrVal;
    }
}

function afterQuotedAttrValue(c) {
    if (c.match(/^[\t\f\n ]$/)) {
        return beforeAttrName;
    } else if (c === '/') {
        return selfCloseStartTag;
    } else if (c == EOF) {

    } else if (c === '>') {
        currentToken[currentAttr.name] = currentAttr.value;
        emit(currentToken);
        return data;
    } else {
        // currentAttr.value += c;
        // return doubleQuotedAttrVal;
        throw new Error("unexpected error")
    }
}

function unquotedAttrValue(c) {
    // The use of includes for semantic
    let conditionArr = ['\'', '\"', '`', '=', '<'];
    if (c.match(/^[\t\f\n ]$/)) {
        currentToken[currentAttr.name] = currentAttr.value;
        return beforeAttrName;
    } else if (c === '/') {
        currentToken[currentAttr.name] = currentAttr.value;
        return selfCloseStartTag;
    } else if (c === '>') {
        currentToken[currentAttr.name] = currentAttr.value;
        emit(currentToken);
        return data;
    } else if (c == EOF) {

    } else if (c == 'u0000') {

    } else if (conditionArr.includes(c)) {

    } else {
        currentAttr.value += c;
        return unquotedAttrValue;
    }
}
function afterAttrName(c) {
    if (c.match(/^[\t\f\n ]$/)) {
        return afterAttrName;
    } else if (c === '/') {
        return selfCloseStartTag;
    } else if (c === '=') {
        return beforeAttrValue;
    } else if (c === '>') {
        currentToken[currentAttr.name] = currentAttr.value;
        emit(currentToken);
        return data;
    } else {
        currentToken[currentAttr.name] = currentAttr.value;
        currentToken = {
            name: '',
            value: ''
        }
        return afterAttrName(c);
    }
}

function selfCloseStartTag(c) {
    if (c === '>') {
        currentToken.isSelfCloseTag = true;
        emit(currentToken);
        return data;
    } else if (c == EOF) {

    } else {

    }
}

export function parseHTML(html) {
    currentToken = null;
    currentAttr = null;
    currentTextNode = null;
    stack = [{ type: 'document', children: [] }];
    let state = data;
    for (let c of html) {
        state = state(c);
    }
    state = state(EOF);
    return stack[0];
}