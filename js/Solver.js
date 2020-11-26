import Constraint from "./Constraint.js";
import MineBoard from "./MineBoard.js";

/**
 * Minesweeper solver by Single Point Algorithm
 * and Constraint Satisfication Problem strategy
 * @author purindaisuki
 */
export default class Solver {

    /**
     * Solve the board by SP and CSP
     * @param {MineBoard} mineBoard the board to be solved
     * @param {int} clickedSquareIndex the index of first clicked square
     * @returns {boolean} whether the board is solvable
     */
    solve(mineBoard, clickedSquareIndex) {
        this.mineBoard = mineBoard;
        this.gridRow = mineBoard.gridRow;
        this.gridColumn = mineBoard.gridColumn;
        this.mineNumber = mineBoard.mineNumber;
        
        this.flagCount = 0;
        this.probedSqauresCount = 1;
        // include the first clicked one
        this.frontierSquares = [clickedSquareIndex];
        // set of squares which can provide information to probe other squares

        while(this.mineNumber != this.flagCount
            && this.gridRow * this.gridColumn - this.probedSqauresCount != this.mineNumber) {
            //always try single point first since it's faster
            if (this.singlePoint()) {
                continue;
            }
            // if singe point failed, try CSP
            if (!this.CSP()) {
                // if both failed return unsolvable
                return false;
            }
        }
        return true;
    }

    /**
     * Single Point Strategy
     * @returns whether a move can be made by the strategy
     */
    singlePoint() {
        let frontierCopy = Array.from(this.frontierSquares);
        for (let i = frontierCopy.length - 1; i >= 0; i--) {
            let squareIndex = frontierCopy[i];
            let square = this.mineBoard.getSquare(
                Math.floor(squareIndex / this.gridColumn),
                squareIndex % this.gridColumn
            );
            if (this.mineBoard.isAFN(square) || this.mineBoard.isAMN(square)) {
                this.frontierSquares.splice(i, 1);
                this.mineBoard.getNeighbors(square).forEach(neighbor => {
                    if (neighbor.isCovered && !neighbor.isFlagged) {
                        if (this.mineBoard.isAFN(square)) {
                            let neighborIndex = neighbor.row * this.gridColumn + neighbor.col;
                            if (!this.frontierSquares.includes(neighborIndex)) {
                                neighbor.setCovered = false;
                                this.frontierSquares.push(neighborIndex);
                                this.probedSqauresCount++;
                                let num = this.mineBoard.countNeighbor(neighbor, 0)
                                neighbor.draw(num);
                            }
                        } else {
                            neighbor.setFlagged = true;
                            this.flagCount++;
                            neighbor.draw(11);
                        }
                    }
                });
                return true;
            }
        }
        return false;
    }

    /**
     * Constraints satisfication problem strategy
     * @returns whether a move can be made by the strategy
     */
    CSP() {
        let boardUpdated = false;
        let constraintsList = [];
        // generate constraints from info provided by frontier squares
        for (let i = this.frontierSquares.length - 1; i >= 0; i--) {
            let squareIndex = this.frontierSquares[i];
            let square = this.mineBoard.getSquare(
                Math.floor(squareIndex / this.gridColumn),
                squareIndex % this.gridColumn
            );
            let mines = this.mineBoard.countNeighbor(square, this.mineBoard.COUNT_NEIGHBOR_MINE);
            let flags = this.mineBoard.countNeighbor(square, this.mineBoard.COUNT_NEIGHBOR_FLAG);
            let constraint = new Constraint(mines - flags);
            this.mineBoard.getNeighbors(square).forEach(neighbor => {
                if (neighbor.isCovered && !neighbor.isFlagged) {
                    constraint.push(neighbor.row * this.gridColumn + neighbor.col);
                }
            });
            if (constraint.variables.length != 0
                && !constraintsList.some(item => item.equals(constraint))) {
                constraintsList.push(constraint);
            }
        }

        // decompose constraints according to their overlaps and differences
        let constraintsUpdated = true;
        while(constraintsUpdated) {
            constraintsUpdated = false;
            let constraintsCopy = Array.from(constraintsList);
            constraintsCopy.forEach(c1 => {
                constraintsCopy.forEach((c2, c2Index) => {
                    if (!c1.equals(c2)) {
                        // if constraints1 is included in constraints2
                        if (c1.variables.every(v => c2.variables.includes(v))) {
                            //decompose the constraint
                            let diffMineNumber = c2.getMineNumber - c1.getMineNumber;
                            let diffConstraint = new Constraint(diffMineNumber);
                            c2.variables.forEach(v => {
                                if (!c1.variables.includes(v)) {
                                    diffConstraint.push(v);
                                }
                            });
                            // no duplicate constraint in list
                            if (!constraintsList.some(c => c.equals(diffConstraint))) {
                                constraintsList.splice(c2Index,1);
                                constraintsList.push(diffConstraint);
                                constraintsUpdated = true;
                            }
                        }
                    }
                });
            });
        }

        // solve variables if constraint is AFN or AMN
        constraintsList.forEach(constraint => {
            let mines = constraint.getMineNumber;
            if (mines == 0 || mines == constraint.variables.length) {
                boardUpdated = true;
                constraint.variables.forEach(squareIndex => {
                    let square = this.mineBoard.getSquare(
                        Math.floor(squareIndex / this.gridColumn),
                        squareIndex % this.gridColumn
                    );
                    if (square.isCovered && !square.isFlagged) {
                        if (mines == 0) {
                            // if AFN
                            square.setCovered = false;
                            this.frontierSquares.push(squareIndex);
                            this.probedSqauresCount++;
                            let num = this.mineBoard.countNeighbor(square, 0)
                            square.draw(num);
                        } else {
                            // if AMN
                            square.setFlagged = true;
                            this.flagCount++;
                            square.draw(11);
                        }
                    }
                });
            }
        });
        return boardUpdated;
    }
}