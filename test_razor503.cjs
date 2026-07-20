const Razorpay = require('razorpay');
const rzp = new Razorpay({ key_id: 'rzp_test_TFgba5wTIEUnlZ', key_secret: 'mFOrnM1wQvVuwogHYJr4zV25' });
rzp.orders.create({amount: 100, currency: 'INR', receipt: 'test'}).then(console.log).catch(console.error);
