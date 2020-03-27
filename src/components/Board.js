import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import Player from './Player';
import styles from '../Board.module.scss';
import { GameType } from '../dataTypes';

import localDB from '../db';

class Board extends Component {
    static defaultProps = {
        gameID: 'gameID',
    };

    constructor(props) {
        super(props);

        const { x = 9, y = 9 } = props;
        const { playerCount = 4 } = props;
        const { walls = 5 } = props;

        const { gameID = '' } = props;

        const emptyBoard = (x, y) => {
            const _x = x * 2 - 1;
            const _y = y * 2 - 1;

            const b = new Array(_x);
            for (let i = 0; i < b.length; i++) {
                b[i] = new Array(_y);
                for (let j = 0; j < b[i].length; j++) {
                    const jmod = j % 2;
                    const imod = i % 2;

                    b[i][j] = imod ? (jmod ? 'e' : 'w') : jmod ? 'w' : 0;
                }
            }

            return b;
        };

        const board = emptyBoard(x, y);

        const starts = {
            1: { x: Math.floor(board.length / 2), y: 0 },
            2: { x: board.length - 1, y: Math.floor(board[0].length / 2) },
            3: { x: Math.floor(board.length / 2), y: board[0].length - 1 },
            4: { x: 0, y: Math.floor(board[0].length / 2) },
        };

        const wins = {
            1: { x: null, y: board[0].length - 1 },
            2: { x: 0, y: null },
            3: { x: null, y: 0 },
            4: { x: board.length - 1, y: null },
        };

        const playerObjects = [];
        for (let i = 1; i <= playerCount; i++) {
            playerObjects.push(new Player(i, starts[i].x, starts[i].y, walls, wins[i]));
        }

        this.state = {
            board: board,
            curPlayer: 1,
            players: playerObjects,
            jump: null,
            winner: null,
            walls: [],
            wallHover: null,
            playing: false,
        };

        const updateState = (doc) => {
            console.log('updateState', doc);

            const state = {
                board: doc.board,
                playing: true,
            };

            if (doc.players) {
                state['players'] = doc.players.map(p => new Player(p.id, p.x, p.y, p.walls, p.objectives));
            }

            state['curPlayer'] = doc.curPlayer || 1;

            this.setState(state);
        };

        localDB.get(this.props.gameID).then(updateState);

        localDB.changes({ live: true, since: 'now', include_docs: true }).on('change', (change) => {
            const { doc } = change;
            console.log('doc change', doc);
            if (doc._id === this.props.gameID) {
                updateState(doc);
            }
        }).on('error', console.log.bind(console));
    }

    updateState(state) {
        localDB.upsert(this.props.gameID, (doc) => {
            Object.keys(state).forEach(key => doc[key] = state[key]);

            return doc;
        });
    }

    getPlayer(player) {
        const { players } = this.state;

        return players[player - 1];
    }

    getCurrentPlayer() {
        const { curPlayer } = this.state;

        return this.getPlayer(curPlayer);
    }

    getMovesFlatArray(player) {
        const _player = this.getPlayer(player);
        const { x, y } = _player;

        const { board } = this.state;
        const moves = [];

        const canMove = (x, y) => {
            if (x < 0 || y < 0) {
                return false;
            }

            if (isNaN(x) || isNaN(y)) {
                return false;
            }

            if (x > board.length - 1 || y > board[x].length - 1) {
                return false;
            }

            return board[x][y] === 'w';
        };

        if (canMove(x + 1, y)) {
            moves.push(`${x + 2}:${y}`);
        }

        if (canMove(x - 1, y)) {
            moves.push(`${x - 2}:${y}`);
        }

        if (canMove(x, y + 1)) {
            moves.push(`${x}:${y + 2}`);
        }

        if (canMove(x, y - 1)) {
            moves.push(`${x}:${y - 2}`);
        }

        return moves;
    }

    tryTurn(x, y) {
        const { curPlayer, players, winner, jump } = this.state;

        if (winner !== null) {
            return;
        }

        const state = {};
        const _player = this.getPlayer(curPlayer);
        const { x: fromx, y: fromy } = _player;

        if (!this.tryMove(x, y) && !this.tryWall(x, y)) {
            return;
        }

        const otherPositions = players.map(player => (player.id !== curPlayer ? `${player.x}|${player.y}` : ''));
        const newJump = otherPositions.includes(`${players[curPlayer - 1].x}|${players[curPlayer - 1].y}`);
        if (newJump) {
            state.jump = { x: fromx, y: fromy };
        } else {
            state.jump = null;
            const undoJump = jump && jump.x === x && jump.y === y;
            if (!undoJump) {
                //end of turn
                if (curPlayer === players.length) {
                    state.curPlayer = 1;
                } else {
                    state.curPlayer = curPlayer + 1;
                }
            }
        }

        if (players[curPlayer - 1].hasWon()) {
            state.winner = players[curPlayer - 1];
        }

        this.updateState(state);
    }

    tryMove(x, y) {
        const { curPlayer, players } = this.state;

        const validMoves = this.getMovesFlatArray(curPlayer);

        if (!validMoves.includes(`${x}:${y}`)) {
            return false;
        }

        players[curPlayer - 1].move(x, y);

        this.updateState({ players: players });

        return true;
    }

    tryWall(x, y) {
        const { curPlayer, players, board, jump } = this.state;

        if (jump) {
            return false;
        }

        if (board[x][y] === 'w' && players[curPlayer - 1].useWall()) {
            const selectedWalls = this.getSelectedWalls();
            selectedWalls.map(w => (board[w.y][w.x] = 'W'));
            this.updateState({ board: board });

            return selectedWalls.length === 3;
        }

        return false;
    }

    getSelectedWalls() {
        const { wallHover, board } = this.state;

        const selected = [];

        if (wallHover !== null) {
            const { x, y, n } = wallHover;

            const add = (x, y) => {
                try {
                    if (board[y][x] !== 'W') {
                        selected.push({ x: x, y: y });
                    }
                } catch (e) {
                }
            };

            add(x, y);

            if (x % 2) {
                if (n === 1) {
                    add(x, y - 1);
                    add(x, y - 2);
                }

                if (n === 2) {
                    add(x, y + 1);
                    add(x, y + 2);
                }
            } else {
                if (n === 1) {
                    add(x - 1, y);
                    add(x - 2, y);
                }

                if (n === 2) {
                    add(x + 1, y);
                    add(x + 2, y);
                }
            }
        }

        return selected.length === 3 ? selected : [];
    }

    render() {
        const { curPlayer, winner, board, playing } = this.state;

        if (!playing) {
            return <div>Loading game state</div>
        }

        const playerMap = this.state.players.map((player, index) => `${player.x}:${player.y}`);
        const moves = this.getMovesFlatArray(curPlayer);

        const selectedWalls = this.getSelectedWalls().map(w => `${w.x}|${w.y}`);

        const getClass = (v, x, y) => {
            const classes = [styles.square];

            if (x % 2) {
                classes.push(styles.narrow);
            }

            if (y % 2) {
                classes.push(styles.short);
            }

            if (moves.includes(`${y}:${x}`)) {
                classes.push(styles.validmove);
            }

            if (playerMap.indexOf(`${y}:${x}`) !== -1) {
                const playerNumber = playerMap.indexOf(`${y}:${x}`) + 1;
                classes.push(styles[`player${playerNumber}`]);

                if (curPlayer === playerNumber) {
                    classes.push(styles.active);
                }
            }

            switch (v) {
                case 'e':
                    classes.push(styles.nothing);
                    break;
                case 'w':
                    classes.push(styles.emptyWall);
                    if (x % 2) {
                        classes.push(styles.horz);
                    } else {
                        classes.push(styles.vert);
                    }

                    if (selectedWalls.length) {
                        if (selectedWalls.indexOf(`${x}|${y}`) !== -1) {
                            classes.push(styles.hover);
                        }
                    }

                    break;
                case 'W':
                    classes.push(styles.wall);
                    break;
                default:
                    classes.push(styles.empty);
                    break;
            }

            return classes.join(' ');
        };

        const setEnter = (row, col, n) => this.setState({ wallHover: { x: row, y: col, n: n } });
        const setLeave = (row, col, n) => {
            const { wallHover } = this.state;
            if (wallHover !== null && row === wallHover.x && col === wallHover.y) {
                this.setState({ wallHover: null });
            }
        };

        const getEmptyWall = (row, col) => {
            return (
                <React.Fragment>
                    <div className={styles.w1} onPointerEnter={() => setEnter(row, col, 1)} onPointerLeave={() => setLeave(row, col, 1)}>
                        w1
                    </div>
                    <div className={styles.w2} onPointerEnter={() => setEnter(row, col, 2)} onPointerLeave={() => setLeave(row, col, 2)}>
                        w2
                    </div>
                </React.Fragment>
            );
        };
        const getContent = (e, row, col) => (e === 'w' ? getEmptyWall(row, col) : e);
        const getElement = (e, row, col) => (
            <div key={row} className={getClass(e, row, col)} onClick={e => this.tryTurn(col, row)}>
                {getContent(e, row, col)}
            </div>
        );
        const getCol = (col, colIndex) => (
            <div key={colIndex} className={styles.col}>
                {col.map((e, rowIndex) => getElement(e, rowIndex, colIndex))}
            </div>
        );

        const won = winner ? <div>{`Player ${winner.id} is the Winner`}</div> : null;

        return (
            <div className={styles.boardInner}>
                <p>Game ID: {this.props.gameID}</p>
                <div className={styles.board}>{board.map((col, index) => getCol(col, index))}</div>
                {won}
            </div>
        );
    }
}

export default Board;
