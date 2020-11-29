import Constraint from "./Constraint.js";
import MineBoard from "./MineBoard.js";
import Square from "./Square.js";

/**
 * Minesweeper solver by Single Point Algorithm
 * and Constraint Satisfication Problem strategy
 * @author purindaisuki
 */
export default class Solver {

    /**
     * Solve the board by SP and CSP
     * @param {MineBoard} board the board to be solved
     * @param {int} clickedSquareIndex the index of first clicked square
     * @returns {boolean} whether the board is solvable
     */
    solve(board, clickedSquareIndex) {
        this.mineBoard = board;
        this.mineNum = board.mineNum;
        this.clickedSquareIndex = clickedSquareIndex;
        
        board.flagNum = 0;
        board.probedSquareNum = 1;
        // include the first clicked one
        this.frontierSquares = [clickedSquareIndex];
        // set of squares which can provide information to probe other squares

        while(this.mineNum != this.mineBoard.flagNum
            && board.gridRow * board.gridColumn - this.mineBoard.probedSquareNum != this.mineNum) {
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
     * @param {MineBoard} board board to be solved
     * @param {Array} frontier frontier squares
     * @returns whether a move can be made by the strategy
     */
    singlePoint(board = this.mineBoard, frontier = this.frontierSquares) {
        let frontierCopy = Array.from(frontier);
        for (let i = frontierCopy.length - 1; i >= 0; i--) {
            let squareIndex = frontierCopy[i];
            let square = board.getSquare(
                Math.floor(squareIndex / board.gridColumn),
                squareIndex % board.gridColumn
            );
            if (board.isAFN(square) || board.isAMN(square)) {
                frontier.splice(i, 1);
                board.getNeighbors(square).forEach(neighbor => {
                    if (neighbor.isCovered && !neighbor.isFlagged) {
                        if (board.isAFN(square)) {
                            let neighborIndex = neighbor.row * board.gridColumn + neighbor.col;
                            if (!frontier.includes(neighborIndex)) {
                                neighbor.setCovered = false;
                                frontier.push(neighborIndex);
                                board.probedSquareNum++;
                                let num = board.countNeighbor(neighbor, 0)
                                neighbor.draw(num);
                            }
                        } else {
                            neighbor.setFlagged = true;
                            board.flagNum++;
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
     * @param {MineBoard} board board to be solved
     * @param {Array} frontier frontier squares
     * @returns whether a move can be made by the strategy
     */
    CSP(board = this.mineBoard, frontier = this.frontierSquares) {
        let constraintsList = [];
        // generate constraints from info provided by frontier squares
        for (let i = frontier.length - 1; i >= 0; i--) {
            let squareIndex = frontier[i];
            let square = board.getSquare(
                Math.floor(squareIndex / board.gridColumn),
                squareIndex % board.gridColumn
            );
            let mines = board.countNeighbor(square, board.COUNT_NEIGHBOR_MINE);
            let flags = board.countNeighbor(square, board.COUNT_NEIGHBOR_FLAG);
            let constraint = new Constraint(mines - flags);
            board.getNeighbors(square).forEach(neighbor => {
                if (neighbor.isCovered && !neighbor.isFlagged) {
                    constraint.push(neighbor.row * board.gridColumn + neighbor.col);
                }
            });
            if (constraint.variables.length != 0
                && !constraintsList.some(item => item.equals(constraint))) {
                constraintsList.push(constraint);
            }
        }

        // solve variables if constraint is AFN or AMN
        if (this.solveConstraints(constraintsList, board, frontier)){
            return true;
        }
        
        // find possible solutions meet the constraints
        // calc all possibility is too expensive so solve constraints only once
        let solved = [];
        for (let i = 0; i < constraintsList[0].variables.length; i++) {
            // assume it's a mine
            let constraintsCopy = Array.from(constraintsList);
            let pseudoConstraint = new Constraint(1);
            pseudoConstraint.push(constraintsList[0].variables[i])
            constraintsCopy.push(pseudoConstraint);

            let frontierCopy = Array.from(frontier);

            let boardCopy = new MineBoard(board.gridRow, board.gridColumn, this.mineNum);
            boardCopy.flagNum = board.flagNum;
            boardCopy.probedSquareNum = board.probedSquareNum;
            // deep copy
            boardCopy.squares = board.squares.map(row => {
                return row.map(sq => Object.assign(new Square(), sq))
            });

            this.solveConstraints(constraintsCopy, boardCopy, frontierCopy);

            // if all mines are marked or the rest covered square are all mines
            if (boardCopy.flagNum == this.mineNum ||
                this.mineNum + boardCopy.probedSquareNum
                == board.gridRow * board.gridColumn) {
                solved.push([boardCopy, frontierCopy]);
            }

            if (solved.length > 2) {
                // more than one solution
                return false;
            }
        }
        if (solved.length == 1) {
            this.mineBoard = solved[0][0];
        }
        return (solved.length == 1);
    }

    /**
     * Solve the constraints
     * @param {Array} constraintsList list of constraints
     * @param {MineBoard} board board to be solved
     * @param {Array} frontier frontier squares
     * @returns {boolean} whether some of the constraints have unique solution
     */
    solveConstraints(constraintsList, board, frontier) {
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
                                (Math.min(c1.getMineNum, c2.getMineNum))
                            );
                            let c12MineMin = c1.getMineNum - (c1.variables.length - intxnVariables.length);
                            let c21MineMin = c2.getMineNum - (c2.variables.length - intxnVariables.length);
                            let intxnMineMin = Math.max(c12MineMin, c21MineMin);
                            let intxnMineDomain = Array.from(
                                new Array(intxnMineMax - intxnMineMin + 1),
                                (v, i) => i + intxnMineMin
                            );
                            
                            //c1 subtracts c2
                            let c12MineDomain = Array.from(intxnMineDomain, v => c1.getMineNum - v);
                            c12MineDomain = c12MineDomain.filter(m => m <= c12Variables.length);
                            //c2 subtracts c1
                            let c21MineDomain = Array.from(intxnMineDomain, v => c2.getMineNum - v);
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

        let boardUpdated = false;
        // solve variables if constraint is AFN or AMN
        for (let i = constraintsList.length - 1; i >= 0; i--) {
            let constraint = constraintsList[i];
            let mines = constraint.getMineNum;
            if (!(mines == 0 || mines == constraint.variables.length)) {
                continue;
            }
            boardUpdated = true;
            constraint.variables.forEach(squareIndex => {
                let square = board.getSquare(
                    Math.floor(squareIndex / board.gridColumn),
                    squareIndex % board.gridColumn
                );
                if (square.isCovered && !square.isFlagged) {
                    if (mines == 0) {
                        // if AFN
                        square.setCovered = false;
                        frontier.push(squareIndex);
                        board.probedSquareNum++;
                        let num = board.countNeighbor(square, 0)
                        square.draw(num);
                    } else {
                        // if AMN
                        square.setFlagged = true;
                        board.flagNum++;
                        square.draw(11);
                    }
                }
            });
            constraintsList.splice(i, 1);
        }
        if (boardUpdated) {
            for (let i = frontier.length - 1; i >= 0; i--) {
                let square = board.getSquare(
                    Math.floor(frontier[i] / board.gridColumn),
                    frontier[i] % board.gridColumn
                );
                let coveredNum = board.countNeighbor(square, board.COUNT_NEIGHBOR_COVERED);
                let flaggedNum = board.countNeighbor(square, board.COUNT_NEIGHBOR_FLAG);
                if (coveredNum == flaggedNum) {
                    frontier.splice(i, 1);
                }
            }
        }
        return boardUpdated;
    }
}