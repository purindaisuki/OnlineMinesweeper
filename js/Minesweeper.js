import MineBoard from "./MineBoard.js";

export default class Minesweeper {
    constructor() {
        this.gridRow = 9;
        this.gridColumn = 9;
        this.mineNumber = 10;
        this.restMineNumber = this.mineNumber;
    
        this.firstClicked = false;
        this.leftButtonDown = false;
        this.rightButtonDown = false;

        this.scoreElement = document.querySelector("#beginnerScore")

        this.levelBeginner = document.querySelector("#beginner");
        this.levelIntermediate = document.querySelector("#intermediate");
        this.levelExpert = document.querySelector("#expert");
        this.levelBeginner.addEventListener("click", (event) => {
            this.gridRow = 9;
            this.gridColumn = 9;
            this.mineNumber = 10;
            this.scoreElement = document.querySelector("#beginnerScore")
            this.resetBoard();
        });
        this.levelIntermediate.addEventListener("click", (event) => {
            this.gridRow = 15;
            this.gridColumn = 13;
            this.mineNumber = 40;
            this.scoreElement = document.querySelector("#intermediateScore")
            this.resetBoard();
        });
        this.levelExpert.addEventListener("click", (event) => {
            this.gridRow = 16;
            this.gridColumn = 30;
            this.mineNumber = 99;
            this.scoreElement = document.querySelector("#expertScore")
            this.resetBoard();
        });
    }

    setUpBoard() {
        this.mineBoard = new MineBoard(this.gridRow, this.gridColumn, this.mineNumber);

        // set functionBox width
        document.documentElement.style.setProperty("--functionColumnEnd", this.gridColumn + 1);

        this.drawRestMineNumber(this.mineNumber);
        let faceElement = document.querySelector("#face");
        faceElement.addEventListener("click", (event) => {
            this.restart();
        });

        let gridElement = document.querySelector("#grid");
        document.documentElement.style.setProperty("--gridTemplateRows", this.gridRow);
        document.documentElement.style.setProperty("--gridTemplateColumns", this.gridColumn);
        for (let row = 0; row < this.gridRow; row++) {
            for (let col = 0; col < this.gridColumn; col++) {
                let squareElement = document.createElement("img");
                squareElement.setAttribute("id", "square" + row + '-' + col);
                squareElement.classList.add("square");
                squareElement.addEventListener("mousedown", (event) => {
                    if (this.mineBoard.isClear || this.mineBoard.isFailed) {
                        return;
                    }
                    if (event.button == 0) {
                        this.leftButtonDown = true;
                    } else if (event.button == 2) {
                        this.rightButtonDown = true;
                    }
                    let square = this.mineBoard.getSquare(row, col);
                    // if both buttons hold at the same time
                    if (this.leftButtonDown && this.rightButtonDown) {
                        if (!square.isCovered) {
                            this.mineBoard.probeNeighbors(square);
                            if (this.mineBoard.isClear || this.mineBoard.isFailed) {
                                this.gameOver(this.mineBoard.isClear);
                            }
                        }
                    }
                    // Only left button pressed
                    else if (this.leftButtonDown) {
                        if (square.isCovered && !square.isFlagged) {
                            this.mineBoard.probe(square);
                            if (!this.firstClicked) {
                                this.firstClicked = true;
                                this.tic();
                            } else {
                                if (this.mineBoard.isClear || this.mineBoard.isFailed) {
                                    this.gameOver(this.mineBoard.isClear);
                                }
                            }
                        }
                    }
                    // Only right button pressed
                    else if (this.rightButtonDown){
                        if (square.isCovered) {
                            if (square.isFlagged) {
                                this.mineBoard.unflag(square);
                                this.restMineNumber++;
                            }
                            else {
                                this.mineBoard.flag(square);
                                this.restMineNumber--;
                            }
                            this.drawRestMineNumber(this.restMineNumber);
                        }
                    }
                });
                squareElement.addEventListener("mouseup", (event) => {
                    // left button released
                    if (event.button == 0) {
                        this.leftButtonDown = false;
                    }
                });
                squareElement.addEventListener("contextmenu", (event) => {
                    //right button clicked
                    event.preventDefault()
                    this.rightButtonDown = false;
                });
                gridElement.appendChild(squareElement);
            }
        }
    }

    resetBoard() {
        let gridElement = document.querySelector("#grid");
        while (gridElement.childElementCount > 1) {
            //remove all grid except for function box
            gridElement.removeChild(gridElement.lastElementChild);
        }
        this.setUpBoard();
        this.restart();
    }

    drawTime(second) {
        if (second > 999) {
            second = 999;
        }
        let secondDigits = [Math.floor(second/100), Math.floor(second/10) % 10, second % 10];
        let timerElements = document.querySelectorAll("#timer img");
        this.drawDigits(timerElements, secondDigits);
    }

    drawRestMineNumber(restMineNum) {
        if (restMineNum < 0) {
            restMineNum = 0;
        }
        let restMineDigits = [Math.floor(restMineNum/100),
            Math.floor(restMineNum/10) % 10,
            restMineNum % 10
        ];
        let restMineElements = document.querySelectorAll("#restMineNumber img");
        this.drawDigits(restMineElements, restMineDigits);
    }

    drawDigits(element,numbers) {
        let digitElements = Array.from(element);
        digitElements.forEach((item, index) => {
            let itemClass = item.classList.item(0);
            if (itemClass != "digit" + numbers[index]) {
                item.classList.add("digit" + numbers[index]);
                item.classList.remove(itemClass);
            }
        });
    }

    tic() {
        this.playTime = 0; // unit is 10ms
        this.timer = setInterval(() => {
            this.drawTime(Math.floor(this.playTime++ / 100));
        }, 10);
    }

    toc() {
        clearInterval(this.timer);
    }

    /**
     * Start the game
     */
    startGame() {
        this.setUpBoard();
        this.mineBoard.initialize();
    }

    /**
     * Restart the game
     */
    restart() {
        this.restMineNumber = this.mineNumber;
        this.firstClicked = false;

        //reset time
        this.toc();
        this.drawTime(0);
        //reset number of rest mine
        this.drawRestMineNumber(this.mineNumber);
        //reset face
        let faceClassList = document.querySelector("#face").classList;
        if (!faceClassList.contains("facePlain")) {
            faceClassList.remove(faceClassList.item(0));
            faceClassList.add("facePlain");
        }
        //reset squares
        let squareElements = document.querySelectorAll("#grid > img");
        let squareList = Array.from(squareElements);
        squareList.forEach((item) => {
            if (!item.classList.contains("square")){
                item.classList.add("square");
                item.classList.remove(item.classList.item(0));
            }
        });
        this.mineBoard.initialize();
    }

    /**
     * End the game
     * @param result whether user win the game
     */
    gameOver(isWin) {
        this.toc();
        
        let faceElementClass = document.querySelector("#face").classList;
        faceElementClass.remove(faceElementClass.item(0));
        if (isWin) {
            faceElementClass.add("faceWin");
            this.drawRestMineNumber(0);

            let squareElements = document.querySelectorAll("#grid > img");
            let squareList = Array.from(squareElements);
            squareList.forEach((item) => {
                // replace covered squares with flags
                if (item.classList.contains("square")){
                    item.classList.add("flag");
                    item.classList.remove(item.classList.item(0));
                }
            });

            // append score and sort
            let scores = Array.from(this.scoreElement.childNodes);
            let score = document.createTextNode(this.playTime / 100);
            let scoreNode = document.createElement("li");
            scoreNode.appendChild(score);
            scores.push(scoreNode);
            scores.sort((elementA, elementB) => {
                let a = parseFloat(elementA.textContent);
                let b = parseFloat(elementB.textContent);
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
            });
            if (scores.length > 10) {
                scores.pop();
            }
            scores.forEach((item) => {
                this.scoreElement.appendChild(item);
            });
        }
        else {
            faceElementClass.add("faceLose");

            for (let row = 0; row < this.gridRow; row++) {
                for (let col = 0; col < this.gridColumn; col++) {
                    let square = this.mineBoard.getSquare(row, col);
                    let squareClassList = document.querySelector("#square" + row + "-" + col).classList;
                    if (!square.isMine && squareClassList.contains("flag")) {
                        squareClassList.add("wrongFlag");
                        squareClassList.remove(squareClassList.item(0));
                    } else if (square.isMine) {
                        if (squareClassList.contains("square")) {
                            squareClassList.add("mine");
                            squareClassList.remove(squareClassList.item(0));
                        }
                    }
                }
            }

        }
    }
}