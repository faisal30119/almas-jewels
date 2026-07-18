import sys

with open('server.ts', 'r') as f:
    content = f.read()

old_block = """function getRazorpayClient() {
  if (!razorpayClient) {
    const keyId = process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keyId && keySecret) {
      razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
  }
  return razorpayClient;
}"""

new_block = """function getRazorpayClient() {
  if (!razorpayClient) {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keyId && keySecret) {
      razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
  }
  return razorpayClient;
}"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('server.ts', 'w') as f:
        f.write(content)
    print("Patched server.ts")
else:
    print("Could not find block in server.ts")
