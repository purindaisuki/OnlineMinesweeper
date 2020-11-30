/**
 * A class to save the properties of squares
 * @author purindaisuki
 */
export default class Square {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.covered = true;
        this.mine = false;
        this.flag = false;

        this.number0ImgDir = "img/number0.svg";
        this.number1ImgDir = "img/number1.svg";
        this.number2ImgDir = "img/number2.svg";
        this.number3ImgDir = "img/number3.svg";
        this.number4ImgDir = "img/number4.svg";
        this.number5ImgDir = "img/number5.svg";
        this.number6ImgDir = "img/number6.svg";
        this.number7ImgDir = "img/number7.svg";
        this.number8ImgDir = "img/number8.svg";
        this.squareImgDir = "img/square.svg";
        this.mineImgDir = "img/mine.svg";
        this.flagImgDir = "img/flag.svg";
        this.wrongFlagImgDir = "img/wrongFlag.svg";
    }

    static get getSize() {
        return 24; // 24 pixels
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

    set setCovered(covered) {
        this.covered = covered;
    }
    
    set setFlagged(flag) {
        this.flag = flag;
    }
    
    set setMine(mine) {
        this.mine = mine;
    }

    /**
     * @param num
     * parameter map
     * 0 ~ 8: number 0 ~ 8
     * 9    : covered square
     * 10   : mine
     * 11   : flag
     * 12   : wrong flag
     */
    draw(num) {
        let squareElement = document.querySelector("#square" +  this.row + "-" + this.col);
        switch(num) {
            case(0) :
                squareElement.src = this.number0ImgDir;
                break;
            case(1) :
                squareElement.src = this.number1ImgDir
                break;
            case(2) :
                squareElement.src = this.number2ImgDir;
                break;
            case(3) :
                squareElement.src = this.number3ImgDir;
                break;
            case(4) :
                squareElement.src = this.number4ImgDir;
                break;
            case(5) :
                squareElement.src = this.number5ImgDir;
                break;
            case(6) :
                squareElement.src = this.number6ImgDir;
                break;
            case(7) :
                squareElement.src = this.number7ImgDir;
                break;
            case(8) :
                squareElement.src = this.number8ImgDir;
                break;
            case(9) :
                squareElement.src = this.squareImgDir;
                break;
            case(10) :
                squareElement.src = this.mineImgDir;
                break;
            case(11) :
                squareElement.src = this.flagImgDir;
                break;
            case(12) :
                squareElement.src = this.wrongFlagImgDir;
                break;
        }
    }
}