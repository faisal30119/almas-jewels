fetch("http://localhost:3000/api/orders/cancel", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    razorpayOrderId: "order_dummy",
    firebaseDocId: "dummy",
    reason: "testing"
  })
}).then(r => r.json()).then(console.log).catch(console.error);
