import sys

with open('server.ts', 'r') as f:
    content = f.read()

target = "    const { orderId, paymentId, email, phone, amount, razorpay_signature } = req.body;"
replacement = """    const { 
      orderId, paymentId, email, phone, amount, razorpay_signature,
      firstName, lastName, address, city, postalCode, cartItems
    } = req.body;"""

if target in content:
    content = content.replace(target, replacement)
    print("Replaced destructing")

target2 = """    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #064e3b;">Payment Successful!</h2>
        <p>Thank you for your order at Almas Jewels.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Amount:</strong> ₹${amount}</p>
        <p>We are processing your elegant pieces and will notify you when they ship.</p>
      </div>
    `;"""

replacement2 = """    // Get product names for email and apps script
    const productName = cartItems && cartItems.length > 0 
      ? cartItems.map((item: any) => `${item.name} (x${item.quantity})`).join(', ') 
      : 'Items';

    const orderDetailsHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
        <h2 style="color: #064e3b;">Order Details</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Products:</strong> ${productName}</p>
        <p><strong>Total Amount:</strong> ₹${amount}</p>
        <h3>Shipping Information</h3>
        <p>
          ${firstName || ''} ${lastName || ''}<br>
          ${email || ''}<br>
          ${phone || ''}<br>
          ${address || ''}<br>
          ${city || ''} - ${postalCode || ''}
        </p>
      </div>
    `;

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #064e3b;">Payment Successful!</h2>
        <p>Thank you for your order at Almas Jewels.</p>
        ${orderDetailsHtml}
        <p>We are processing your elegant pieces and will notify you when they ship.</p>
      </div>
    `;
    
    const adminEmailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #064e3b;">New Order Received!</h2>
        ${orderDetailsHtml}
      </div>
    `;
"""

if target2 in content:
    content = content.replace(target2, replacement2)
    print("Replaced email generation")

target3 = """        await transporter.sendMail({
          from: '"Almas Jewels" <orders@almasjewels.com>',
          to: email,
          subject: `Order Confirmation - ${orderId}`,
          html: emailHtml
        });
        console.log("Email notification sent to:", email);"""

replacement3 = """        await transporter.sendMail({
          from: '"Almas Jewels" <orders@almasjewels.com>',
          to: email,
          subject: `Order Confirmation - ${orderId}`,
          html: emailHtml
        });
        console.log("Email notification sent to user:", email);
        
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        if (adminEmail) {
          await transporter.sendMail({
            from: '"Almas Jewels" <orders@almasjewels.com>',
            to: adminEmail,
            subject: `New Order Received - ${orderId}`,
            html: adminEmailHtml
          });
          console.log("Admin email notification sent to:", adminEmail);
        }
"""

if target3 in content:
    content = content.replace(target3, replacement3)
    print("Replaced email sending logic")

target4 = """    res.json({ success: true, message: "Notifications processed successfully" });"""
replacement4 = """    // Send data to Google Apps Script
    try {
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbycPFwQtQHGsl4a_yZgMIp-pmxOXm_DPKvUtFoQTywOwHsKrsmUyD-nHlTBEWqaPqWY/exec';
      const payload = {
        firstName: firstName || '',
        lastName: lastName || '',
        email: email || '',
        address: address || '',
        phoneNumber: phone || '',
        city: city || '',
        zipCode: postalCode || '',
        productName: productName,
        totalAmount: amount,
        timestamp: new Date().toISOString()
      };
      
      const scriptResponse = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      console.log('Google Apps Script response:', scriptResponse.status);
    } catch (scriptError) {
      console.error('Error calling Google Apps Script:', scriptError);
    }

    res.json({ success: true, message: "Notifications processed successfully" });"""

if target4 in content:
    content = content.replace(target4, replacement4)
    print("Replaced res.json")

with open('server.ts', 'w') as f:
    f.write(content)

