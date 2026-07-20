const fetch = require('node-fetch');
async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 100, items: [], shippingDetails: {} })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error(e);
  }
}
test();
