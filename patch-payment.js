const fs = require('fs');

let serverFile = fs.readFileSync('server.ts', 'utf8');

const createOrderOld = `
  app.post("/api/payment/create-order", async (req, res) => {
    const { amount, currency = "INR" } = req.body;
    
    if (!amount) {
      res.status(400).json({ error: "Amount is required" });
      return;
    }

    const client = getRazorpayClient();
    if (!client) {
      res.status(500).json({ error: "Razorpay is not configured. Add keys in Settings." });
      return;
    }

    try {
      const options = {
        amount: amount * 100, // Razorpay works in smallest currency unit (paise)
        currency,
        receipt: \`receipt_\${Math.random().toString(36).substring(7)}\`
      };
      const order = await client.orders.create(options);
      res.json(order);
    } catch (error: any) {
      console.error("Razorpay order creation error:", error);
      res.status(500).json({ error: "Failed to create payment order" });
    }
  });
`;

const createOrderNew = `
  app.post("/api/payment/create-order", async (req, res) => {
    const { amount, currency = "INR", items, shippingDetails, userId } = req.body;
    
    if (!amount) {
      res.status(400).json({ error: "Amount is required" });
      return;
    }

    const client = getRazorpayClient();
    if (!client) {
      res.status(500).json({ error: "Razorpay is not configured. Add keys in Settings." });
      return;
    }

    try {
      const options = {
        amount: amount * 100, // Razorpay works in smallest currency unit (paise)
        currency,
        receipt: \`receipt_\${Math.random().toString(36).substring(7)}\`
      };
      const order = await client.orders.create(options);
      
      // Save order to db
      let pgUserId = null;
      if (userId) {
        const { eq } = await import('drizzle-orm');
        const userRecs = await db.select().from(users).where(eq(users.uid, userId));
        if (userRecs.length > 0) {
          pgUserId = userRecs[0].id;
        }
      }
      
      const [newOrder] = await db.insert(orders).values({
        userId: pgUserId,
        totalAmount: amount * 100,
        status: 'pending',
        customerName: shippingDetails ? \`\${shippingDetails.firstName} \${shippingDetails.lastName}\` : null,
        customerEmail: shippingDetails ? shippingDetails.email : null,
        customerPhone: shippingDetails ? shippingDetails.phone : null,
        razorpayOrderId: order.id,
      }).returning({ id: orders.id });
      
      if (items && items.length > 0) {
        await db.insert(orderItems).values(
          items.map((i: any) => ({
            orderId: newOrder.id,
            productId: Number(i.productId),
            quantity: i.quantity,
            price: i.price * 100
          }))
        );
      }
      
      res.json(order);
    } catch (error: any) {
      console.error("Razorpay order creation error:", error);
      res.status(500).json({ error: "Failed to create payment order" });
    }
  });
`;

serverFile = serverFile.replace(createOrderOld.trim(), createOrderNew.trim());
fs.writeFileSync('server.ts', serverFile);
