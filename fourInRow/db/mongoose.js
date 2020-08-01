const { connect } = require('mongoose');

const connectionUrl = 'mongodb://admin:admin1@ds247027.mlab.com:47027';
const databaseName = 'testapp';

const mongooseDataBaseConnectionUrl = `${connectionUrl}/${databaseName}`;

connect(mongooseDataBaseConnectionUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});