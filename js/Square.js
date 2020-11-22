export default class Square {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.covered = true;
        this.mine = false;
        this.flag = false;
    }

    static get getSize() {
        return 24; // 24 pixels
    }

    get getX() {
        return this.x;
    }

	get getY() {
        return this.y;
    }

	get isCovered() {
        return this.covered;
    }

	get isFlagged() {
        return this.flag;
    }

	get isMine() {
        return this.mine;
    }

    /**
     * @param {boolean} covered
     */
    set setCovered(covered) {
        this.covered = covered;
    }
    
    /**
     * @param {boolean} flag
     */
    set setFlagged(flag) {
        this.flag = flag;
    }
    
    /**
     * @param {boolean} mine
     */
    set setMine(mine) {
        this.mine = mine;
    }
}