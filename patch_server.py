import sys

with open('server.ts', 'r') as f:
    content = f.read()

old_block = '''      if (client) {
        try {
          order = await client.orders.create(options);
        } catch (e: any) {
          console.warn("Razorpay API failed (using mock order instead):", e.error || e);
          order = { id: `order_mock_${Math.random().toString(36).substring(7)}`, amount: options.amount, currency: options.currency };
        }
      } else {
        // Mock order for dev/testing when keys are missing
        order = { id: `order_mock_${Math.random().toString(36).substring(7)}`, amount: options.amount, currency: options.currency };
      }

      
      let pgUserId = null;
      if (userId) {
        const { eq } = await import('drizzle-orm');
        const userRecs = await db.select().from(users).where(eq(users.uid, userId));
        if (userRecs.length > 0) {
          pgUserId = userRecs[0].id;
        } else {
          const [newUser] = await db.insert(users).values({ uid: userId, email: shippingDetails?.email || '' }).returning({ id: users.id });
          pgUserId = newUser.id;
        }
      }
      
      const [newOrder] = await db.insert(orders).values({
        userId: pgUserId,
        totalAmount: amount * 100,
        status: 'pending',
        customerName: shippingDetails ? `${shippingDetails.firstName} ${shippingDetails.lastName}` : null,
        customerEmail: shippingDetails ? shippingDetails.email : null,
        customerPhone: shippingDetails ? shippingDetails.phone : null,
        customerAddress: shippingDetails ? `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.postalCode}` : null,
        razorpayOrderId: order.id,
      }).returning({ id: orders.id });'''


new_block = '''      let pgUserId = null;
      if (userId) {
        const { eq } = await import('drizzle-orm');
        const userRecs = await db.select().from(users).where(eq(users.uid, userId));
        if (userRecs.length > 0) {
          pgUserId = userRecs[0].id;
        } else {
          const [newUser] = await db.insert(users).values({ uid: userId, email: shippingDetails?.email || '' }).returning({ id: users.id });
          pgUserId = newUser.id;
        }
      }

      if (client) {
        try {
          order = await client.orders.create(options);
        } catch (e: any) {
          console.error("Razorpay API failed:", e.error || e);
          const errorDesc = e.error?.description || "Payment gateway authentication failed";
          
          await db.insert(orders).values({
            userId: pgUserId,
            totalAmount: amount * 100,
            status: 'failed',
            customerName: shippingDetails ? `${shippingDetails.firstName} ${shippingDetails.lastName}` : null,
            customerEmail: shippingDetails ? shippingDetails.email : null,
            customerPhone: shippingDetails ? shippingDetails.phone : null,
            customerAddress: shippingDetails ? `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.postalCode}` : null,
            razorpayOrderId: null,
          });

          return res.status(400).json({ error: errorDesc });
        }
      } else {
        // Mock order for dev/testing when keys are missing
        order = { id: `order_mock_${Math.random().toString(36).substring(7)}`, amount: options.amount, currency: options.currency };
      }
      
      const [newOrder] = await db.insert(orders).values({
        userId: pgUserId,
        totalAmount: amount * 100,
        status: 'pending',
        customerName: shippingDetails ? `${shippingDetails.firstName} ${shippingDetails.lastName}` : null,
        customerEmail: shippingDetails ? shippingDetails.email : null,
        customerPhone: shippingDetails ? shippingDetails.phone : null,
        customerAddress: shippingDetails ? `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.postalCode}` : null,
        razorpayOrderId: order.id,
      }).returning({ id: orders.id });'''

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('server.ts', 'w') as f:
        f.write(content)
    print("Patched server.ts successfully")
else:
    print("Could not find replacement block in server.ts")

