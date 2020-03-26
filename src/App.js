import React from 'react';
import { Suspense } from 'react';
import { PouchDB, useFind, useDB } from 'react-pouchdb';
import './App.css';

import PouchSync from './components/PouchSync';
import Game from './components/Game';

function Players() {
    const docs = useFind({
        selector: {
            name: { $gte: null },
        },
        sort: ['name'],
    });
    const db = useDB();

    return (
        <div>
            <ul>
                {docs.map(doc => (
                    <li key={doc._id}>
                        {doc.name}
                        <button onClick={() => db.remove(doc)}>Remove</button>
                    </li>
                ))}
            </ul>
            <button onClick={() => db.post({ name: 'bob' })}>Add thing</button>
        </div>
    );
}

function App() {
    return (
        <div className="App">
            <PouchDB name="dbname">
                <PouchSync remoteAddress={'http://user:pass@localhost:5984/dbname'}>
                    <Suspense fallback="loading...">
                        <Game />
                    </Suspense>
                </PouchSync>
            </PouchDB>
        </div>
    );
}

export default App;
