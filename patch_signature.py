import sys

with open('server.ts', 'r') as f:
    content = f.read()

old_block = """    // Verify signature if keys are provided
    if (secret && razorpay_signature && orderId && paymentId) {
      const generatedSignature = crypto.createHmac("sha256", secret)
                                      .update(orderId + "|" + paymentId)
                                      .digest("hex");
                                      
      if (generatedSignature !== razorpay_signature) {
        res.status(400).json({ error: "Invalid payment signature" });
        return;
      }
    }"""

new_block = """    // Verify signature
    if (!secret || !razorpay_signature || !orderId || !paymentId) {
      res.status(400).json({ error: "Missing required fields for signature verification" });
      return;
    }
    const generatedSignature = crypto.createHmac("sha256", secret)
                                    .update(orderId + "|" + paymentId)
                                    .digest("hex");
                                    
    if (generatedSignature !== razorpay_signature) {
      res.status(400).json({ error: "Invalid payment signature" });
      return;
    }"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('server.ts', 'w') as f:
        f.write(content)
    print("Patched signature verification")
