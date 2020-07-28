const { connect } = require('mongoose');

// ON CMD NOT BASH ==> "/Users/YOSSI SAADI\mongodb/bin/mongod.exe" --dbpath="/Users/YOSSI SAADI/mongodb-data"
const connectionUrl = 'mongodb://admin:admin1@ds247027.mlab.com:47027';
const databaseName = 'testapp';

const mongooseDataBaseConnectionUrl = `${connectionUrl}/${databaseName}`;

connect(mongooseDataBaseConnectionUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});