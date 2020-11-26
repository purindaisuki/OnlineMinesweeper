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

        this.number0ImgDir = "img/number0.png";
        this.number1ImgDir = "img/number1.png";
        this.number2ImgDir = "img/number2.png";
        this.number3ImgDir = "img/number3.png";
        this.number4ImgDir = "img/number4.png";
        this.number5ImgDir = "img/number5.png";
        this.number6ImgDir = "img/number6.png";
        this.number7ImgDir = "img/number7.png";
        this.number8ImgDir = "img/number8.png";
        this.squareImgDir = "img/square.png";
        this.mineImgDir = "img/mine.png";
        this.flagImgDir = "img/flag.png";
        this.wrongFlagImgDir = "img/wrongFlag.png";
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