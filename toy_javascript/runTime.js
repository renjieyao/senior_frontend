export class Realm {
    constructor() {
        this.global = new Map(),
        this.Object = new Map(),
        this.Object.call = function () {

        },
        this.Object_prototype = new Map()
    }
}

export class EnvironmentRecord {
    constructor() {
        this.thisValue,
        this.variables = new Map(),
        this.outer = null
    }
}

export class ExecutionContext {
    constructor(realm,lexicalEnvironment,variableEnvironment) {
        variableEnvironment = lexicalEnvironment || variableEnvironment;
        this.lexicalEnvironment = variableEnvironment;
        this.variableEnvironment = variableEnvironment;
        this.realm = realm;
    }
}

export class Reference {
    constructor(object, property) {
        this.object = object;
        this.property = property;
    }
    set(value) {
        this.object[this.property] = value;
    }
    get() {
        return this.object[this.property];
    }
}