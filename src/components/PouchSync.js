import { useDB } from 'react-pouchdb';
import PouchDB from 'pouchdb';
import React from 'react';

PouchDB.plugin(require('pouchdb-upsert'));

function PouchSync({ remoteAddress, children }) {
    const db = useDB();
    const remote = new PouchDB(remoteAddress);

    db.sync(remote, { live: true });

    return (<>{children}</>);
}

export default PouchSync;