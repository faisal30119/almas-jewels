import http from 'http';
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/db/orders',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer mocktoken' // wait, mocktoken won't work for requireAdmin, but let's see if it errors at DB or auth
  }
};
const req = http.request(options, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(res.statusCode, data));
});
req.on('error', e => console.error(e));
req.end();
