const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:74e47d976b0364959185e357b92e97d7@ftu3fhj2.us-east.database.insforge.app:5432/insforge?sslmode=require',
});
client.connect()
  .then(() => console.log('Connected!'))
  .catch(err => console.error('Connection error', err))
  .finally(() => client.end());
