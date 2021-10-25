class XRegExp {
    constructor(source, flag, root = "root") {
        this.table = new Map();
        this.regexp = new RegExp(
            this.compileRegExp(source, root, 0).source,
            flag
        );
    }
    // start is used to record the order   
    compileRegExp(source, name, start) {
        // only compile string
        if (source[name] instanceof RegExp) {
            return {
                source: source[name].source,
                length: 0,
            };
        }
        let length = 0;
        //match type
        let regexp = source[name].replace(/\<([^>]+)\>/g, (str, $1) => {
            this.table.set(start + length, $1);

            ++length;

            let r = this.compileRegExp(source, $1, start + length);

            length += r.length;
            // transform to regular expression
            return "(" + r.source + ")";
        });
        return {
            source: regexp,
            length: length,
        };
    }
    // 
    exec(string) {
        let r = this.regexp.exec(string);
        for (let i = 1; i < r.length; i++) {
            if (r[i] !== void 0) {
                // get type and replace teminal-symbol with type
                r[this.table.get(i - 1)] = r[i];
            }
        }
        return r;
    }
    get lastIndex() {
        return this.regexp.lastIndex;
    }
    set lastIndex(value) {
        return (this.regexp.lastIndex = value);
    }
}
export function* scan(str) {
    // to manage regular expression
    let regexp = new XRegExp(
        {
            InputElement: "<Whitespace>|<LineTerminator>|<Comments>|<Token>",
            Whitespace: / /,
            LineTerminator: /\n/,
            Comments: /\/\*(?:[^*]|\*[^\/])*\*\/|\/\/[^\n]*/,
            Token: "<Literal>|<Keywords>|<Identifier>|<Punctuator>",
            Literal: "<NumericLiteral>|<BooleanLiteral>|<StringLiteral>|<NullLiteral>",
            NumericLiteral: /0o[0-7]+|0x[0-9A-Za-z]+|0b[0-1]+|(?:[1-9][0-9]*|0)(?:\.[0-9]*)?|\.[0-9]+/,
            BooleanLiteral: /true|false/,
            StringLiteral: /\"(?:[^"\n]|\\[\s\S])*\"|\'(?:[^'\n]|\\[\s\S])*\'/,
            NullLiteral: /null/,
            Keywords: /if|else|for|function|let|var|new|while/,
            Identifier: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
            Punctuator: /\|\||\&\&|\;|\.|\+|\-|\+\+|\,|\:|\{|\}|\(|\)|\=|\<|\>|\=\=|\=\>|\*|\[|\]/,
        },
        "g",
        "InputElement"
    );

    while (regexp.lastIndex < str.length) {
        let r = regexp.exec(str);

        if (r.Whitespace) {

        } else if (r.LineTerminator) {

        } else if (r.Comments) {

        } else if (r.NumericLiteral) {
            yield {
                type: "NumericLiteral",
                value: r[0],
            }
        } else if (r.BooleanLiteral) {
            yield {
                type: "BooleanLiteral",
                value: r[0],
            }
        } else if (r.StringLiteral) {
            yield {
                type: "StringLiteral",
                value: r[0],
            }
        } else if (r.NullLiteral) {
            yield {
                type: "NullLiteral",
                value: null,
            }
        } else if (r.Identifier) {
            yield {
                type: "Identifier",
                name: r[0],
            }
        } else if (r.Keywords) {
            yield {
                type: r[0],
            }
        } else if (r.Punctuator) {
            yield {
                type: r[0],
            }
        } else {
            throw new Error("unexpected token" + r[0]);
        }

        if (!r[0].length) break;
    }
    yield {
        type: "EOF"
    }
}