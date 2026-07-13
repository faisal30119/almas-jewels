import pkg from 'pg';
const { Client } = pkg;
const client = new Client({
  host: process.env.SQL_HOST,
  user: process.env.SQL_ADMIN_USER,
  password: process.env.SQL_ADMIN_PASSWORD,
  database: process.env.SQL_DB_NAME,
});
async function run() {
  await client.connect();
  try {
    await client.query("UPDATE products SET category = 'Necklaces' WHERE category = 'Necklace';");
    await client.query("UPDATE products SET category = 'Necklaces' WHERE category = 'Choker';");
    await client.query("UPDATE products SET category = 'Bridal Sets' WHERE category = 'Bridal Set';");
    console.log('Updated categories');
  } catch (e) {
    console.error(e.message);
  } finally {
    await client.end();
  }
}
run();
