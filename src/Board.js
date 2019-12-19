import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Player from './Player';
import styles from './Board.module.scss';

class Board extends Component {
    constructor(props) {
	super(props);

	const {x = 9, y = 9} = props;
	const { players = 4 } = props;
	const { walls = 5 } = props;

        const emptyBoard = (x, y) => {
            const _x = (x * 2) - 1;
            const _y = (y * 2) - 1;
            
	    const b = new Array(_x);
	    for (let i = 0; i < b.length; i++) {
		b[i] = new Array(_y);
		for (let j = 0; j < b[i].length; j++) {
                    const jmod = j % 2;
                    const imod = i % 2;
                    
		    b[i][j] = imod ? (jmod ? 'e' : 'w') : (jmod ? 'w' : 0);
		}
	    }
           
	    return b;
	};

        const board = emptyBoard(x, y);
        board[1][2] = 'W';
        board[1][4] = 'W';

	const xc = Math.floor(board.length / 2);
        const yc = Math.floor(board[0].length / 2);
        const xm = board.length - 1;
        const ym = board.length - 1;

	const starts = {
            1: {x:xc, y:0},
	    2: {x:xm , y:yc},
	    3: {x:xc , y:ym},
	    4: {x:0 , y:yc},
	}
	
	const playerObjects = [];
	for (let i = 1; i <= players ; i++) {
	    playerObjects.push(new Player(i, starts[i].x, starts[i].y, walls));
	}
        
	this.state = {
	    board: board,
            curPlayer: 1,
	    players: playerObjects
	};
    }

    componentDidMount() {
        //this.updateBoard();
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
	    if( x < 0 || y < 0) {
		return false;
	    }

	    if (x > (board.length - 1) || y > (board[x].length - 1)) {
		return false;
	    }

	    return board[x][y] == 'w';
	}
	
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

    tryMove(x, y) {
        const { curPlayer, players, board } = this.state;

	const validMoves = this.getMovesFlatArray(curPlayer);

	if (!validMoves.includes(`${x}:${y}`)) {
	    return false;
	}

	players[curPlayer - 1].move(x, y);
	const state = { players: players }
	
	if (curPlayer == players.length) {
	    state.curPlayer = 1;
	} else {
	    state.curPlayer = curPlayer + 1;
	}

	this.setState(state);
    }

    render() {
	const { curPlayer } = this.state;
	const playerMap = this.state.players.map((player, index) => `${player.x}:${player.y}`);
	const moves = this.getMovesFlatArray(curPlayer);
	console.log(playerMap);
	
        const getClass = (v, x, y) => {
            const classes = [styles.square];

            if (curPlayer == v) {
                classes.push(styles.active);
            }

            if (x % 2) {
                classes.push(styles.narrow);
            }

            if (y % 2) {
                classes.push(styles.short);
            }

            if (moves.includes(`${y}:${x}`)) {
                classes.push(styles.validmove); 
            }

	    if (playerMap.indexOf(`${y}:${x}`) != -1) {
		const playerNumber =  playerMap.indexOf(`${y}:${x}`) + 1;
		classes.push(styles[`player${playerNumber}`]);
	    }
            
            switch (v) {
            case 'e':
                classes.push(styles.nothing);
                break;
            case 'w':
                classes.push(styles.emptyWall);
                break;
            case 'W':
                classes.push(styles.wall);
                break;
            case 1:
                classes.push(styles.player1);
                break;
            case 2:
                classes.push(styles.player2);
                break;
            case 3:
                classes.push(styles.player3);
                break;
            case 4:
                classes.push(styles.player4);
                break;
            default:
                classes.push(styles.empty);
                break;
            }

            return classes.join(' ');
        };

        const getElement = (e, row, col) => <div key={row} className={ getClass(e, row, col) } onClick={ (e) => this.tryMove(col, row) }>{ e }</div>;
	const getCol = (col, colIndex) => <div key={colIndex} className={ styles.col }>{ col.map((e, rowIndex) => getElement(e, rowIndex, colIndex)) }</div>;

	const { board } = this.state;

	//this.state.players.map((player, index) => board[player.x][player.y] = player.id);
        
	return (
	    <div className={ styles.board }>
              { board.map((col, index) => getCol(col, index)) }
            </div>
	);
    }
}

export default Board;
