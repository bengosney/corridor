import PouchDB from 'pouchdb';
import Upsert from 'pouchdb-upsert';

PouchDB.plugin(Upsert);

/*
const dbName = 'corridor';
const user = 'user';
const pass = 'pass';
const host = '192.168.1.110';
const port = '5984';
*/

const dbName = 'games';
const user = 'frieleddayingrisdaggstes';
const pass = '7f157d3bbbef170fdee2e9a78d30a4fd3a6d806e';
const host = '08fb7e5c-3be3-462b-af00-43767627439a-bluemix.cloudantnosqldb.appdomain.cloud';
const port = '443';

const remoteConnectionString = `https://${user}:${pass}@${host}:${port}/${dbName}`;
console.log(remoteConnectionString);

const localDB = new PouchDB(dbName);
const remoteDB = new PouchDB(remoteConnectionString);

localDB.sync(remoteDB, { live: true, retry: true }).on('change', () => console.log('change'));


export default localDB;