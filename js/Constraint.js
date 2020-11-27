export default class Constraint {
    constructor (mineNumber) {
        this.constraint = mineNumber;
        this.variables = new Array();
    }

    get getMineNumber() {
        return this.constraint;
    }

    push(variable) {
        this.variables.push(variable);
    }

    equals(that) {
        if (this.mineNumber != that.mineNumber
            || this.variables.length != that.variables.length) {
            return false;
        }
        return this.variables.every(v => that.variables.includes(v));
    }
}