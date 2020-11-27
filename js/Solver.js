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
                            }
                        } else {
                            neighbor.setFlagged = true;
                            this.flagCount++;
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
            (function () { 
                for (let c1Index = 0; c1Index < constraintsCopy.length; c1Index++) {
                    for (let c2Index = 0; c2Index < constraintsCopy.length; c2Index++) {
                        // compare elements in list
                        if (c1Index < c2Index) {
                            let c1 = constraintsCopy[c1Index];
                            let c2 = constraintsCopy[c2Index];
                            //intxn refers to intersection of variables of c1 and c2
                            let intxnVariables = c1.variables.filter(v => c2.variables.includes(v));
                            if (intxnVariables.length == 0) {
                                // continue to next pair if no intersection
                                continue;
                            }
                            //subtraction c1-c2
                            let c12Variables = c1.variables.filter(v => !intxnVariables.includes(v));
                            //subtraction c2-c1
                            let c21Variables = c2.variables.filter(v => !intxnVariables.includes(v));

                            //subset of variables are subject to the constraints of its parents
                            let intxnMineMax = Math.min(
                                intxnVariables.length,
                                (Math.min(c1.getMineNumber, c2.getMineNumber))
                            );
                            let c12MineMin = c1.getMineNumber - (c1.variables.length - intxnVariables.length);
                            let c21MineMin = c2.getMineNumber - (c2.variables.length - intxnVariables.length);
                            let intxnMineMin = Math.max(c12MineMin, c21MineMin);
                            let intxnMineDomain = Array.from(
                                new Array(intxnMineMax - intxnMineMin + 1),
                                (v, i) => i + intxnMineMin
                            );
                            
                            //c1 subtracts c2
                            let c12MineDomain = Array.from(intxnMineDomain, v => c1.getMineNumber - v);
                            c12MineDomain = c12MineDomain.filter(m => m <= c12Variables.length);
                            //c2 subtracts c1
                            let c21MineDomain = Array.from(intxnMineDomain, v => c2.getMineNumber - v);
                            c21MineDomain = c21MineDomain.filter(m => m <= c21Variables.length);
                            
                            let result = [];
                            let subSets = [
                                [intxnVariables, intxnMineDomain],
                                [c12Variables, c12MineDomain],
                                [c21Variables, c21MineDomain]
                            ];
                            subSets.forEach(s => {
                                // only one possible solution
                                if (s[0].length != 0 && s[1].length == 1) {
                                    let subConstraint = new Constraint(s[1][0]);
                                    s[0].forEach(v => subConstraint.push(v));
                                    constraintsList.push(subConstraint);
                                    constraintsUpdated = true;
                                }
                                result.push(s[1].length == 1);
                            });

                            // remove constraint if one is a proper set of another
                            if (result[0] && result[2]) {
                                constraintsList.splice(constraintsList.indexOf(c2),1);
                            }
                            if (result[0] && result[1]) {
                                constraintsList.splice(constraintsList.indexOf(c1),1);
                            }

                            if (constraintsUpdated) return;
                        }
                    }
                }
            }) ();
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
                        } else {
                            // if AMN
                            square.setFlagged = true;
                            this.flagCount++;
                        }
                    }
                });
            }
        });
        return boardUpdated;
    }
}