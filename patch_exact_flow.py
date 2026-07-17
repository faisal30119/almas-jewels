import sys

with open('server.ts', 'r') as f:
    content = f.read()

old_server_block = '''      if (client) {
        try {
          order = await client.orders.create(options);
        } catch (e: any) {
          console.warn("Razorpay API failed (using mock order instead):", e.error || e);
          order = { id: `order_mock_${Math.random().toString(36).substring(7)}`, amount: options.amount, currency: options.currency };
        }
      } else {
        // Mock order for dev/testing when keys are missing
        order = { id: `order_mock_${Math.random().toString(36).substring(7)}`, amount: options.amount, currency: options.currency };
      }'''

new_server_block = '''      if (client) {
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
        return res.status(500).json({ error: "Razorpay is not configured on the server." });
      }'''

if old_server_block in content:
    content = content.replace(old_server_block, new_server_block)
    with open('server.ts', 'w') as f:
        f.write(content)
    print("Patched server.ts exact flow")
else:
    print("Could not find replacement block in server.ts")

with open('src/pages/Checkout.tsx', 'r') as f:
    content_checkout = f.read()

old_checkout_block = '''      if (orderData.id.startsWith('order_mock_')) {
        console.warn('Using mock payment flow');
        const mockResponse = {
          razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substring(7),
          razorpay_order_id: orderData.id,
          razorpay_signature: 'mock_signature'
        };
        setTimeout(() => {
          handleSuccess(mockResponse);
        }, 1000);
        return;
      }'''

if old_checkout_block in content_checkout:
    content_checkout = content_checkout.replace(old_checkout_block, "")
    with open('src/pages/Checkout.tsx', 'w') as f:
        f.write(content_checkout)
    print("Patched Checkout.tsx exact flow")
else:
    print("Could not find replacement block in Checkout.tsx")

