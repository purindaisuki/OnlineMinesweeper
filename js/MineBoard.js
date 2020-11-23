import Square from "./Square.js";

/**
 * A class for mineboard and operations on it
 * @author purindaisuki
 */
export default class MineBoard {
    constructor(row, col, mineNumber) {
        this.COUNT_NEIGHBOR_MINE = 0;
        this.COUNT_NEIGHBOR_FLAG = 1;
        this.COUNT_NEIGHBOR_COVERED = 2;
        
        this.boardExplode = false;
        this.boardClear = false;

        this.gridRow = row;
        this.gridColumn = col;
        this.mineNumber = mineNumber;
        this.probedSquareNumber = 0;

		this.squares = [];
		for (let i=0; i < this.gridRow; i++) {
            this.squares[i] = [];
        }

        for (let row = 0; row < this.gridRow; row++) {
            for (let col = 0; col < this.gridColumn; col++) {
                this.squares[row][col] = new Square(row, col);
            }
        }
    }

    /**
     * Initialize the board
     * Clear all mines, flags and selected squares
     */
    initialize() {
        this.boardExplode = false;
        this.boardClear = false;
        this.probedSquareNumber = 0;
        
        for (let row = 0; row < this.gridRow; row++) {
            for (let col = 0; col < this.gridColumn; col++) {
                this.squares[row][col].setMine = false;
                this.squares[row][col].setCovered = true;
                this.squares[row][col].setFlagged = false;
            }
        }
    }

    get isClear() {
        return this.boardClear;
    }

    get isFailed() {
        return this.boardExplode;
    }

    getSquare(row, col) {
        return this.squares[row][col];
    }

    /**
     * Generate map
     * @param clickedSquare first clicked square
     */
    generateSolvableMap(clickedSquare) {
        let placedMineNum = 0;
        this.probedSquareNumber = 1;
        // randomly place mines
        while (placedMineNum < this.mineNumber) {
            let randRow = Math.floor(Math.random() * this.gridRow);
            let randCol = Math.floor(Math.random() * this.gridColumn);
            let randSquare = this.squares[randRow][randCol];
            if ((randRow != clickedSquare.x || randCol != clickedSquare.y)
                && !randSquare.isMine) {
                    randSquare.setMine = true;
                placedMineNum++;
            }
        }
    }

    /**
     * get squares adjacent to the square
     * @param square The square whose neighbors are going to be return
     * @return neighborSquares squares adjacent to the square
     */
    getNeighbors(square) {
        let neighborSquares = [];
        let row, col;
        for (let i = -1; i < 2; i++) {
            row = square.x + i;
            if (row >= 0 && row < this.gridRow) {
                for (let j = -1; j < 2; j++) {
                    col = square.y + j;
                    if (col >= 0 && col < this.gridColumn && !(i == 0 && j == 0)) {
                        neighborSquares.push(this.squares[row][col]);
                    }
                }
            }
        }
        return neighborSquares;
    }

    /**
     * Count properties of neighbor squares
     * @param square The square whose neighbors are going to be counted
     * @param countKey Define which property to be counted
     * @return counts of the property in neighbor squares
     */
    countNeighor(square, countKey) {
        let count = 0;
        let neighbors = this.getNeighbors(square);
        neighbors.forEach((neighborSquare) => {
            if ((countKey == this.COUNT_NEIGHBOR_MINE && neighborSquare.isMine)
            || (countKey == this.COUNT_NEIGHBOR_FLAG && neighborSquare.isFlagged)
            || (countKey == this.COUNT_NEIGHBOR_COVERED && neighborSquare.isCovered)) {
            count++;
        }  
        });
        return count;
    }

    /**
     * Probe the square
     * @param square The square to be probed
     */
    probe(square) {
        square.covered = false;
        let squareElement = document.querySelector("#square" +  square.x + "-" + square.y);
        squareElement.classList.remove("square");
        if (this.probedSquareNumber++ == 0) {
            //generate map after the first square is pressed
            this.generateSolvableMap(square);
        }
        if (square.isMine) {
            this.boardExplode = true;
            squareElement.classList.add("mine");
        } else {
            let mineCount = this.countNeighor(square, this.COUNT_NEIGHBOR_MINE);
            switch (mineCount) {
                case(0) :
                    squareElement.classList.add("btn0");
                    break;
                case(1) :
                    squareElement.classList.add("btn1");
                    break;
                case(2) :
                    squareElement.classList.add("btn2");
                    break;
                case(3) :
                    squareElement.classList.add("btn3");
                    break;
                case(4) :
                    squareElement.classList.add("btn4");
                    break;
                case(5) :
                    squareElement.classList.add("btn5");
                    break;
                case(6) :
                    squareElement.classList.add("btn6");
                    break;
                case(7) :
                    squareElement.classList.add("btn7");
                    break;
                case(8) :
                    squareElement.classList.add("btn8");
                    break;
            }
            if (this.probedSquareNumber + this.mineNumber == this.gridRow * this.gridColumn) {
                this.boardClear = true;
            } else if (mineCount == 0) {
                // automatically probe neighbors if there is no mine around
                this.probeNeighbors(square);
            }
        }
    }

    /**
     * Flag the square
     * @param square The square to be flagged
     */
    flag(square) {
        square.setFlagged = true;
        let squareElement = document.querySelector("#square" +  square.x + "-" + square.y);
        squareElement.classList.remove("square");
        squareElement.classList.add("flag");
    }

    /**
     * Unflag the square
     * @param square The square to be unflagged
     */
    unflag(square) {
        square.setFlagged = false;
        let squareElement = document.querySelector("#square" +  square.x + "-" + square.y);
        squareElement.classList.remove("flag");
        squareElement.classList.add("square");
    }

    /**
     * Probe all covered neighbor squares if AFN (All-Free-Neighbor)
     * @param square The square whose neighbors are going to be probed
     */
    probeNeighbors(square) {
        let mineCount = this.countNeighor(square, this.COUNT_NEIGHBOR_MINE);
        let flagCount = this.countNeighor(square, this.COUNT_NEIGHBOR_FLAG);
        // if AFN
        if (mineCount == flagCount) {
            let neighbors = this.getNeighbors(square);
            neighbors.forEach((neighborSquare) => {
                if (neighborSquare.isCovered && !neighborSquare.isFlagged) {
                    this.probe(neighborSquare);
                }
            });
        }
    }
}
