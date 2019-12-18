import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Player from './Player';
import styles from './Board.module.scss';

class Board extends Component {
    constructor(props) {
	super(props);

	const {x = 9, y = 9} = props;
	const { players = 2 } = props;

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

            const xc = Math.floor(b.length / 2);
            const yc = Math.floor(b[0].length / 2);
            const xm = b.length - 1;
            const ym = b.length - 1;
            
            b[xc][0] = 1;
            b[xm][yc] = 2;
            b[xc][ym] = 3;
            b[0][yc] = 4;

	    return b;
	};

	const playerObjects = [];
	for (let i = 0; i < players ; i++) {
	    playerObjects.push(new Player());
	}

        const board = emptyBoard(x, y);
        board[1][2] = 'W';
        board[1][4] = 'W';
        
	this.state = {
	    board: board,
            curPlayer: 1,
	};
    }

    componentDidMount() {
        //this.updateBoard();
    }

    getPos(player) {
        const { board } = this.state;
        
        for (let i = 0; i < board.length; i++) {
	    for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] == player) {
                    return {x: i, y: j};
                }
            }
        }

        return {x: -1, y: -1};
    }

    getMovesFlatArray(player) {
        const {x, y} = this.getPos(player);
        const { board } = this.state;
        const moves = [];

        if (board[x + 1][y] == 'w') {
            moves.push(`${x + 2}:${y}`); 
        }

        return moves;
    }

    render() {
        const getClass = (v, x, y) => {
            const classes = [styles.square];
            const { curPlayer } = this.state;
            
            const moves = this.getMovesFlatArray(curPlayer);

            if (curPlayer == v) {
                classes.push(styles.active);
            }

            if (x % 2) {
                classes.push(styles.narrow);
            }

            if (y % 2) {
                classes.push(styles.short);
            }

            if (moves.includes(`${x}:${y}`)) {
                classes.push(styles.validmove); 
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

        const nextPlayer = () => {
            console.log('next player');
            const { curPlayer } = this.state;

            this.setState({ curPlayer: curPlayer + 1 });
        };
        
        const getElement = (e, row, col) => <div key={row} className={ getClass(e, row, col) } onClick={ (e) => nextPlayer() }>{ e }</div>;
	const getCol = (col, colIndex) => <div key={colIndex} className={ styles.col }>{ col.map((e, rowIndex) => getElement(e, rowIndex, colIndex)) }</div>;
        
	return (
	    <div className={ styles.board }>
              { this.state.board.map((col, index) => getCol(col, index)) }
            </div>
	);
    }
}

export default Board;
