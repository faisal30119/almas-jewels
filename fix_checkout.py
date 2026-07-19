import sys

with open('src/pages/Checkout.tsx', 'r') as f:
    content = f.read()

bad_block = """      if (orderData.error) {
        if (orderData.error.includes("Razorpay authentication failed") || orderData.error.includes("Razorpay is not configured")) {
           // Mock successful payment for preview mode
           alert("Preview Mode: Razorpay is not configured. Simulating successful payment...");
           setPaymentError(null);
           setTimeout(() => {
             handleSuccess({
                razorpay_payment_id: "mock_payment_" + Math.random().toString(36).substring(7),
                razorpay_order_id: "mock_order_" + Math.random().toString(36).substring(7),
                razorpay_signature: "mock_signature"
             });
           }, 1000);
           return;
        }

        setPaymentError(orderData.error);
        setIsProcessing(false);
        return;
      }"""

# Remove the bad block
content = content.replace(bad_block, "")

handle_success_block = """      const handleSuccess = async (response: any) => {
          // Verify payment success here (ideally server-side)
          console.log("Payment Successful", response);
          
          const orderId = response.razorpay_order_id || orderData.id;
          
          try {
            if (user) {
              await addDoc(collection(db, 'orders'), {
                userId: user.uid,
                orderId: orderId,
                amount: total,
                items: cartItems.map(item => ({
                  id: item.product?.id || item.productId || (item as any).id || "unknown_id",
                  name: item.product?.name || (item as any).name || 'Unknown Item',
                  quantity: item.quantity || 1,
                  price: item.product?.price || (item as any).price || 0
                })),
                status: 'Processing',
                shippingDetails,
                createdAt: serverTimestamp()
              });
            }

            await fetch('/api/payment/success', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                paymentId: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                email: shippingDetails.email,
                phone: shippingDetails.phone,
                amount: total
              })
            });
          } catch (e) {
            console.error("Failed to trigger notifications", e);
          }

          clearCart();
          navigate('/success', { state: { orderId } });
        };
"""

# Find where to put it
# First remove handle_success_block from original place
content = content.replace(handle_success_block, "")

# Insert both before `const options = {`
insert_code = handle_success_block + "\n" + bad_block + "\n"
options_str = "      const options = {"
content = content.replace(options_str, insert_code + "\n      const options = {")

with open('src/pages/Checkout.tsx', 'w') as f:
    f.write(content)
print("Fixed orderData.error hoisting")
