import MineBoard from "./MineBoard.js";

/**
 * A minesweeper game with GUI
 * @author purindaisuki
 */
export default class Minesweeper {
    constructor() {
        this.gridRow = 9;
        this.gridColumn = 9;
        this.mineNumber = 10;
        this.restMineNumber = this.mineNumber;
    
        this.firstClicked = false;
        this.leftButtonDown = false;
        this.rightButtonDown = false;
        this.bothButtonDown = false;

        this.squareImgDir = "img/square.png";
        this.flagImgDir = "img/flag.png";
        this.facePlainImgDir = "img/plain.png";
        this.faceWinDir = "img/win.png";
        this.faceLoseDir = "img/lose.png";

        this.scoreElement = document.querySelector("#beginnerScore");

        this.gridElement = document.querySelector("#grid");
        this.gridElement.addEventListener("mousedown", (event) => {
            if (event.button == 0) {
                this.leftButtonDown = true;
            }
        });
        this.gridElement.addEventListener("mouseup", (event) => {
            if (event.button == 0) {
                this.leftButtonDown = false;
            }
        });

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
        faceElement.setAttribute("draggable", false);
        faceElement.src = this.facePlainImgDir;
        faceElement.addEventListener("click", (event) => {
            this.restart();
        });

        // set row and column of grid
        document.documentElement.style.setProperty("--gridTemplateRows", this.gridRow);
        document.documentElement.style.setProperty("--gridTemplateColumns", this.gridColumn);
        
        // set each square
        for (let row = 0; row < this.gridRow; row++) {
            for (let col = 0; col < this.gridColumn; col++) {
                let square = this.mineBoard.getSquare(row, col);
                let squareElement = document.createElement("img");
                squareElement.setAttribute("id", "square" + row + '-' + col);
                squareElement.setAttribute("draggable", false);
                // preview pressed
                squareElement.addEventListener("mouseover", (event) => {
                    if (!this.leftButtonDown
                        || this.mineBoard.isClear || this.mineBoard.isFailed) {
                        return;
                    }
                    this.press(square);
                    if (this.rightButtonDown) {
                        this.pressNeighbor(square);
                    }
                });
                // cancel pressed
                squareElement.addEventListener("mouseout", (event) => {
                    if (!this.leftButtonDown
                        || this.mineBoard.isClear || this.mineBoard.isFailed) {
                        return;
                    }
                    this.unpressNeighbor(square);
                });
                squareElement.addEventListener("mousedown", (event) => {
                    if (this.mineBoard.isClear || this.mineBoard.isFailed) {
                        return;
                    }
                    if (event.button == 0) {
                        this.leftButtonDown = true;
                    }
                    if (event.button == 2) {
                        this.rightButtonDown = true;
                    }
                    if (this.leftButtonDown){
                        this.press(square);
                        if (this.rightButtonDown) {
                            // both buttons pressed
                            this.pressNeighbor(square);
                        }
                    }
                    if (!this.leftButtonDown && this.rightButtonDown){
                        // only right button pressed
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
                    if (this.mineBoard.isClear || this.mineBoard.isFailed) {
                        return;
                    }
                    // if both buttons released
                    if (this.leftButtonDown && this.rightButtonDown) {
                        this.unpressNeighbor(square);
                        if(!square.isCovered) {
                            this.mineBoard.probeNeighbors(square);
                            if (this.mineBoard.isClear || this.mineBoard.isFailed) {
                                this.gameOver(this.mineBoard.isClear);
                            }
                        }
                    } else if (this.leftButtonDown) {
                        // Only left button released
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
                    if (event.button == 0) {
                        this.leftButtonDown = false;
                    } 
                    if (event.button == 2) {
                        this.rightButtonDown = false;
                    }
                });
                squareElement.addEventListener("contextmenu", (event) => {
                    //right button clicked
                    event.preventDefault();
                });
                this.gridElement.appendChild(squareElement);
            }
        }
    }

    resetBoard() {
        while (this.gridElement.childElementCount > 1) {
            //remove all grid except for function box
            this.gridElement.removeChild(this.gridElement.lastElementChild);
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
        digitElements.forEach((digit, index) => {
            digit.style.setProperty("--bgPosition", numbers[index]);
        });
    }

    press(square) {
        if (square.isCovered && !square.isFlagged) {
            square.draw(0);
        }
    }

    pressNeighbor(square) {
        let neighbors = this.mineBoard.getNeighbors(square);
        neighbors.forEach((neighbor) => {
            if (neighbor.isCovered && !neighbor.isFlagged) {
                neighbor.draw(0);
            }
        });
    }

    unpressNeighbor(square) {
        let neighbors = this.mineBoard.getNeighbors(square);
        neighbors.push(square);
        neighbors.forEach((neighbor) => {
            if (neighbor.isCovered && !neighbor.isFlagged) {
                neighbor.draw(9);
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

        // reset time
        this.toc();
        this.drawTime(0);
        // reset number of rest mine
        this.drawRestMineNumber(this.mineNumber);
        // reset face
        let faceElement = document.querySelector("#face");
        faceElement.src = this.facePlainImgDir;
        // reset squares
        let squareElements = document.querySelectorAll("#grid > img");
        let squareList = Array.from(squareElements);
        squareList.forEach((square) => {
            square.src = this.squareImgDir;
        });
        this.mineBoard.initialize();
    }

    /**
     * End the game
     * @param result whether user win the game
     */
    gameOver(isWin) {
        this.toc();
        
        let faceElement = document.querySelector("#face");
        if (isWin) {
            faceElement.src = this.faceWinDir;
            this.drawRestMineNumber(0);

            // replace covered squares with flags
            for (let row = 0; row < this.gridRow; row++) {
                for (let col = 0; col < this.gridColumn; col++) {
                    let square = this.mineBoard.getSquare(row, col);
                    if (square.isCovered && !square.isFlagged) {
                        square.draw(11);
                    }
                }
            }

            // append score and sort
            let scores = Array.from(this.scoreElement.childNodes);
            let score = document.createTextNode((this.playTime / 100).toFixed(2));
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
            faceElement.src = this.faceLoseDir;

            //show mines and mark wrong flags
            for (let row = 0; row < this.gridRow; row++) {
                for (let col = 0; col < this.gridColumn; col++) {
                    let square = this.mineBoard.getSquare(row, col);
                    if (!square.isMine && square.isFlagged) {
                        square.draw(12);
                    } else if (square.isMine && square.isCovered && !square.isFlagged) {
                        square.draw(10);
                    }
                }
            }
        }
    }
}