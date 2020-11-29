export default class Constraint {
    constructor (mineNum) {
        this.constraint = mineNum;
        this.variables = [];
    }

    get getMineNum() {
        return this.constraint;
    }

    push(variable) {
        this.variables.push(variable);
    }

    equals(that) {
        if (this.mineNum != that.mineNum
            || this.variables.length != that.variables.length) {
            return false;
        }
        return this.variables.every(v => that.variables.includes(v));
    }
}