import React, { Component, useState } from 'react';
import { PouchDB, useFind, useDB, useGet } from 'react-pouchdb';
import PropTypes from 'prop-types';

import Board from './Board';
import { GameType } from '../dataTypes';


const GetGame = ({ gameID }) => {
    const db = useDB();
    const gameState = useGet({ id: gameID });

    return (<Board db={db} gameID={gameID} {...gameState} />);
};

const Game = () => {
    const db = useDB();
    const [gameID, setGameID] = useState('');
    const [inputGameID, setInputGameID] = useState('4fa94330-9997-48be-8ae9-2c2d208ca90e');

    if (gameID === '') {
        return (
            <div>
                <p>
                    <button onClick={() => db.post(GameType).then(doc => setGameID(doc.id))}>Start a new game</button>
                </p>
                <p>
                    <input value={inputGameID} onChange={e => setInputGameID(e.target.value)}/>
                    <button onClick={() => setGameID(inputGameID)}>Join a game</button>
                </p>
            </div>
        );
    }

    return (<GetGame gameID={gameID}/>);
};


export default Game;
