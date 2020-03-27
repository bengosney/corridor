import PouchDB from 'pouchdb';
import Upsert from 'pouchdb-upsert';

PouchDB.plugin(Upsert);

const dbName = 'corridor';
const user = 'user';
const pass = 'pass';
const host = '192.168.1.110';

const remoteConnectionString = `http://${user}:${pass}@${host}:5984/${dbName}`;
console.log(remoteConnectionString);

const localDB = new PouchDB(dbName);
const remoteDB = new PouchDB(remoteConnectionString);

localDB
    .sync(remoteDB, {
        live: true,
        retry: true,
    })
    .on('change', () => console.log('change'));


export default localDB;