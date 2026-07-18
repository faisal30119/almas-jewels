import sys

with open('server.ts', 'r') as f:
    content = f.read()

old_block = """          await db.insert(orders).values({
            userId: pgUserId,
            totalAmount: amount * 100,
            status: 'failed',
            customerName: shippingDetails ? `${shippingDetails.firstName} ${shippingDetails.lastName}` : null,
            customerEmail: shippingDetails ? shippingDetails.email : null,
            customerPhone: shippingDetails ? shippingDetails.phone : null,
            customerAddress: shippingDetails ? `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.postalCode}` : null,
            razorpayOrderId: null,
          });

          return res.status(500).json({ error: errorDesc });"""

new_block = """          await db.insert(orders).values({
            userId: pgUserId,
            totalAmount: amount * 100,
            status: 'failed',
            customerName: shippingDetails ? `${shippingDetails.firstName} ${shippingDetails.lastName}` : null,
            customerEmail: shippingDetails ? shippingDetails.email : null,
            customerPhone: shippingDetails ? shippingDetails.phone : null,
            customerAddress: shippingDetails ? `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.postalCode}` : null,
            razorpayOrderId: null,
          });
          
          if (e.statusCode === 401) {
            return res.status(401).json({ error: "Razorpay authentication failed" });
          }

          return res.status(500).json({ error: errorDesc });"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('server.ts', 'w') as f:
        f.write(content)
    print("Patched 401 status")
else:
    print("Could not find block in server.ts")
