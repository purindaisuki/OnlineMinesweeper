import Square from "./Square.js";
import Solver from "./Solver.js";

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
        this.guessFree = false;

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
     * @param {boolean} initImg whether to initialize the images
     * @param {boolean} initMine whether to initialize the mines
     */
    initialize(initFirstClick = true, initMine = true) {
        this.boardExplode = false;
        this.boardClear = false;
        this.probedSquareNumber = 0;
        
        for (let row = 0; row < this.gridRow; row++) {
            for (let col = 0; col < this.gridColumn; col++) {
                let square = this.squares[row][col];
                square.setCovered = true;
                square.setFlagged = false;
                square.draw(9);
                if (initMine) {
                    square.setMine = false;
                }
            }
        }

        if (!initFirstClick) {
            this.clickedSquare.setCovered = false;
            this.probedSquareNumber = 1;
        }
    }

    get isClear() {
        return this.boardClear;
    }

    get isFailed() {
        return this.boardExplode;
    }

    /**
     * @param {Square} square to be checked
     * @returns {boolean} the square is all-free-neighbors
     */
    isAFN(square) {
        let mineCount = this.countNeighbor(square, this.COUNT_NEIGHBOR_MINE);
        let flagCount = this.countNeighbor(square, this.COUNT_NEIGHBOR_FLAG);
        return (mineCount == flagCount);
    }

    /**
     * @param {Square} square to be checked
     * @returns {boolean} the square is all-mine-neighbors
     */
    isAMN(square) {
        let mineCount = this.countNeighbor(square, this.COUNT_NEIGHBOR_MINE);
        let coveredCount = this.countNeighbor(square, this.COUNT_NEIGHBOR_COVERED);
        return (mineCount == coveredCount);
    }

    getSquare(row, col) {
        return this.squares[row][col];
    }

    /**
     * Generate map
     * @param {Square} clickedSquare first clicked square
     */
    generateMap(clickedSquare) {
        let trys = 0;
        this.clickedSquare = clickedSquare;
        while (true) {
            trys++;
            let placedMineNum = 0;
            this.initialize(false, true);
            this.probedSquareNumber = 1;
            clickedSquare.setCovered = false;
            // randomly place mines
            while (placedMineNum < this.mineNumber) {
                let randRow = Math.floor(Math.random() * this.gridRow);
                let randCol = Math.floor(Math.random() * this.gridColumn);
                let randSquare = this.squares[randRow][randCol];
                if ((randRow != clickedSquare.row || randCol != clickedSquare.col)
                    && !randSquare.isMine) {
                    if (!this.guessFree || ((randRow > clickedSquare.row + 1 || randRow < clickedSquare.row - 1)
                        || (randCol > clickedSquare.col + 1 || randCol < clickedSquare.col - 1))) {
                        // make sure not to place mines at the clicked square
                        // or around the cilcked square in guess-free mode whihch causes guessing
                        randSquare.setMine = true;
                        placedMineNum++;
                        randSquare.draw(10);
                    }
                }
            }
            if (!this.guessFree) {
                // if not in guess-free mode, accept random generated map
                return;
            } else {
                let solver = new Solver();
                if (solver.solve(this, clickedSquare.row * this.gridColumn + clickedSquare.col)) {
                    break;
                }
            }
        }
        console.log(trys);
        //clear solver's operations
        this.initialize(false, false);
    }

    /**
     * get squares adjacent to the square
     * @param {Square} square The square whose neighbors are going to be return
     * @returns {Array} squares adjacent to the square
     */
    getNeighbors(square) {
        let neighborSquares = [];
        for (let i = -1; i < 2; i++) {
            let row = square.row + i;
            if (row >= 0 && row < this.gridRow) {
                for (let j = -1; j < 2; j++) {
                    let col = square.col + j;
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
     * @param {Square} square The square whose neighbors are going to be counted
     * @param {int} countKey Define which property to be counted
     * @returns {int} counts of the property in neighbor squares
     */
    countNeighbor(square, countKey) {
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
     * @param {Square} square The square to be probed
     */
    probe(square) {
        if (!square.isCovered) return;
        
        square.covered = false;
        if (this.probedSquareNumber++ == 0) {
            //generate map after the first square is pressed
            this.generateMap(square);
        }
        if (square.isMine) {
            this.boardExplode = true;
            square.draw(10);
        } else {
            let mineCount = this.countNeighbor(square, this.COUNT_NEIGHBOR_MINE);
            square.draw(mineCount);
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
     * @param {Square} square The square to be flagged
     */
    flag(square) {
        square.setFlagged = true;
        square.draw(11);
    }

    /**
     * Unflag the square
     * @param {Square} square The square to be unflagged
     */
    unflag(square) {
        square.setFlagged = false;
        square.draw(9);
    }

    /**
     * Probe all covered neighbor squares if AFN
     * @param {Square} square The square whose neighbors are going to be probed
     */
    probeNeighbors(square) {
        if (!this.isAFN(square)) return;

        let neighbors = this.getNeighbors(square);
        neighbors.forEach((neighbor) => {
            if (neighbor.isCovered && !neighbor.isFlagged) {
                this.probe(neighbor)
            }
        });
    }
}
