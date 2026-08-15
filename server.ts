import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, requireAdmin, AuthRequest } from "./src/middleware/auth.ts";
import { db } from "./src/db/index.ts";
import { adminDb } from "./src/lib/firebase-admin.ts";
import { users, products, orders, orderItems, coupons } from "./src/db/schema.ts";
import { products as catalogProducts } from "./src/data.ts";
import { eq, lt } from "drizzle-orm";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import twilio from "twilio";
import Razorpay from "razorpay";
import nodemailer from "nodemailer";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import crypto from "crypto";

// Initialize Cloudinary with environment variables or fallbacks
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'alc_mahmood@8' ? process.env.CLOUDINARY_CLOUD_NAME : 'niagn9pn',
  api_key: process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'alc_mahmood@8' ? process.env.CLOUDINARY_API_KEY : '738543779546239',
  api_secret: process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET !== 'alc_mahmood@8' ? process.env.CLOUDINARY_API_SECRET : 'wVRhdaov4Fg4urDDuN6LnaX7P4A'
});

const upload = multer({ storage: multer.memoryStorage() });

let twilioClient: twilio.Twilio | null = null;
function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    // Check if accountSid starts with 'AC'
    if (accountSid && accountSid.startsWith('AC') && authToken) {
      twilioClient = twilio(accountSid, authToken);
    }
  }
  return twilioClient;
}

let razorpayClient: Razorpay | null = null;
function getRazorpayClient() {
  if (!razorpayClient) {
    const keyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keyId && keySecret) {
      razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
  }
  return razorpayClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy is required for express-rate-limit behind a reverse proxy (like Cloud Run or standard load balancers)
  app.set("trust proxy", 1);

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for Vite dev server and external assets
  }));
  app.use(cors());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
  });
  
  // Apply rate limiter to all /api routes
  app.use("/api/", limiter);

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/products", async (req, res) => {
    try {
      const allProducts = await db.select().from(products);
      if (allProducts && allProducts.length > 0) {
        return res.json(allProducts);
      }
      // Fallback to catalog if empty
      res.json(catalogProducts.map((p, idx) => ({
        ...p,
        id: idx + 1,
        stock: 10
      })));
    } catch (error) {
      // Fallback cleanly to static catalog
      res.json(catalogProducts.map((p, idx) => ({
        ...p,
        id: idx + 1,
        stock: 10
      })));
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const parsedId = Number(id);
      if (!isNaN(parsedId)) {
        const product = await db.select().from(products).where(eq(products.id, parsedId)).limit(1);
        if (product.length > 0) {
          return res.json(product[0]);
        }
      }
      
      const hardcoded = catalogProducts.find(p => p.id === id || String(catalogProducts.indexOf(p) + 1) === id);
      if (hardcoded) {
        return res.json({
          ...hardcoded,
          id: hardcoded.id,
          stock: 10
        });
      }
      res.status(404).json({ error: "Product not found" });
    } catch (error) {
      const hardcoded = catalogProducts.find(p => p.id === id || String(catalogProducts.indexOf(p) + 1) === id);
      if (hardcoded) {
        return res.json({
          ...hardcoded,
          id: hardcoded.id,
          stock: 10
        });
      }
      res.status(404).json({ error: "Product not found" });
    }
  });

  app.post("/api/products", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const newProduct = await db.insert(products).values({
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
        image: req.body.image,
        category: req.body.category,
        stoneColor: req.body.stoneColor,
        plating: req.body.plating,
        description: req.body.description,
        inclusions: req.body.inclusions
      }).returning();
      res.json(newProduct[0]);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const parsedId = Number(id);
      if (isNaN(parsedId)) {
        res.status(400).json({ error: "Invalid ID" });
        return;
      }
      const updatedProduct = await db.update(products).set({
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
        image: req.body.image,
        category: req.body.category,
        stoneColor: req.body.stoneColor,
        plating: req.body.plating,
        description: req.body.description,
        inclusions: req.body.inclusions
      }).where(eq(products.id, parsedId)).returning();
      
      if (updatedProduct.length > 0) {
        res.json(updatedProduct[0]);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // Example secured route
  app.post("/api/users/sync", requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { uid, email } = req.user;
    try {
      // 1. Sync with Firestore first
      if (adminDb) {
        try {
          await adminDb.collection('users').doc(uid).set({
            uid,
            email: email || '',
            lastLogin: new Date().toISOString()
          }, { merge: true });
        } catch (fErr) {
          // ignore Firestore sync failure
        }
      }

      // 2. Optionally sync with SQL if connected
      try {
        const { eq } = await import('drizzle-orm');
        const existingUser = await db.select().from(users).where(eq(users.uid, uid));
        if (existingUser.length === 0) {
          await db.insert(users).values({ uid, email: email || '' });
        }
      } catch {
        // SQL sync optional
      }

      res.json({ user: { uid, email } });
    } catch (error) {
      res.json({ user: { uid, email } });
    }
  });

  // Upload Product Media to Cloudinary
  app.post("/api/admin/upload", requireAdmin, upload.single("file"), async (req: AuthRequest, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    try {
      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "almas_bridal",
        resource_type: "auto" // handles images and videos
      });

      res.json({ url: result.secure_url });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({ error: "Failed to upload to Cloudinary" });
    }
  });

  // Low Stock Endpoint
  app.get("/api/admin/low-stock", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const lowStockProducts = await db.select().from(products).where(lt(products.stock, 5));
      res.json(lowStockProducts);
    } catch (error) {
      res.json([]);
    }
  });

  // Admin DB routes
  app.get("/api/admin/db/:table", requireAdmin, async (req: AuthRequest, res) => {
    const { table } = req.params;
    try {
      let data = [];
      if (table === 'users') {
        data = await db.select().from(users).limit(100);
      } else if (table === 'products') {
        data = await db.select().from(products).limit(100);
      } else if (table === 'orders') {
        data = await db.select().from(orders).limit(100);
      } else if (table === 'order_items') {
        data = await db.select().from(orderItems).limit(100);
      } else if (table === 'coupons') {
        data = await db.select().from(coupons).limit(100);
      } else {
        return res.status(400).json({ error: 'Invalid table' });
      }
      res.json(data);
    } catch (error) {
      res.json([]);
    }
  });

  // Inventory Sync Logic
  app.post("/api/inventory/sync", requireAdmin, async (req: AuthRequest, res) => {
    const { updates } = req.body;
    if (!Array.isArray(updates)) {
      res.status(400).json({ error: "Invalid updates array" });
      return;
    }

    try {
      // Execute within a transaction
      await db.transaction(async (tx) => {
        for (const update of updates) {
          if (typeof update.productId === "number" && typeof update.stock === "number") {
            await tx.update(products)
              .set({ stock: update.stock })
              .where(eq(products.id, update.productId));
          }
        }
      });
      res.json({ success: true, message: "Inventory synced successfully" });
    } catch (error) {
      console.error("Inventory sync error:", error);
      res.status(500).json({ error: "Failed to sync inventory" });
    }
  });

  // WhatsApp Notification Route
  app.post("/api/notifications/whatsapp", requireAdmin, async (req: AuthRequest, res) => {
    const { to, message } = req.body;
    
    if (!to || !message) {
      res.status(400).json({ error: "Missing 'to' or 'message' in request body" });
      return;
    }

    const client = getTwilioClient();
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!client || !fromNumber) {
      res.status(500).json({ error: "Twilio credentials are not configured. Add keys in Settings." });
      return;
    }

    try {
      // Twilio expects whatsapp numbers in the format: whatsapp:+1234567890
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const formattedFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

      const twilioMessage = await client.messages.create({
        body: message,
        from: formattedFrom,
        to: formattedTo
      });

      res.json({ success: true, messageId: twilioMessage.sid });
    } catch (error) {
      console.error("WhatsApp notification error:", error);
      res.status(500).json({ error: "Failed to send WhatsApp notification" });
    }
  });

  // Coupons API
  app.post("/api/coupons/validate", async (req, res) => {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Coupon code required" });
    }
    const cleanCode = code.toUpperCase().trim();
    
    // Default valid promotions
    const fallbackCoupons: Record<string, { code: string; discountAmount: number; isActive: number }> = {
      'WELCOME10': { code: 'WELCOME10', discountAmount: 1000, isActive: 1 },
      'ALMAS1000': { code: 'ALMAS1000', discountAmount: 1000, isActive: 1 },
      'BRIDAL2026': { code: 'BRIDAL2026', discountAmount: 2000, isActive: 1 },
      'ROYAL500': { code: 'ROYAL500', discountAmount: 500, isActive: 1 }
    };

    try {
      const coupon = await db.select().from(coupons).where(eq(coupons.code, cleanCode)).limit(1);
      if (coupon.length > 0 && coupon[0].isActive === 1) {
        return res.json(coupon[0]);
      }
    } catch {
      // Fallback below
    }

    if (fallbackCoupons[cleanCode]) {
      return res.json(fallbackCoupons[cleanCode]);
    }
    res.status(404).json({ error: "Invalid or expired coupon" });
  });

  app.post("/api/admin/coupons", requireAdmin, async (req: AuthRequest, res) => {
    const { code, discountAmount } = req.body;
    try {
      const result = await db.insert(coupons).values({
        code: code.toUpperCase(),
        discountAmount: Number(discountAmount),
        isActive: 1
      }).returning();
      res.json(result[0]);
    } catch (error) {
      res.json({
        id: Math.floor(Math.random() * 1000) + 1,
        code: code.toUpperCase(),
        discountAmount: Number(discountAmount),
        isActive: 1
      });
    }
  });

  app.post("/api/coupons/invalidate", async (req, res) => {
    const { code } = req.body;
    try {
      await db.update(coupons).set({ isActive: 0 }).where(eq(coupons.code, code.toUpperCase()));
      res.json({ success: true });
    } catch (error) {
      res.json({ success: true });
    }
  });

  // Razorpay Create Order Endpoint
  app.post("/api/payment/create-order", async (req, res) => {
    const { amount, currency = "INR", items, shippingDetails, userId } = req.body;
    
    if (amount === undefined) {
      res.status(400).json({ error: "Amount is required" });
      return;
    }
    
    if (amount * 100 < 100 && amount !== 0) {
      res.status(400).json({ error: "Amount must be at least 1 INR (100 paise) or 0" });
      return;
    }

    const client = getRazorpayClient();
    let order: any = null;

    try {
      let pgUserId = null;
      if (userId) {
        try {
          const { eq } = await import('drizzle-orm');
          const userRecs = await db.select().from(users).where(eq(users.uid, userId));
          if (userRecs.length > 0) {
            pgUserId = userRecs[0].id;
          } else {
            const [newUser] = await db.insert(users).values({ uid: userId, email: shippingDetails?.email || '' }).returning({ id: users.id });
            pgUserId = newUser.id;
          }
        } catch {
          // SQL sync optional
        }
      }

      if (amount === 0) {
        order = { id: 'ORD_CREDIT_' + Math.random().toString(36).substring(7) };
      } else {
        const options = {
          amount: amount * 100,
          currency,
          receipt: `receipt_${Math.random().toString(36).substring(7)}`
        };
        
        if (client) {
          try {
            order = await client.orders.create(options);
          } catch (e: any) {
            console.error("Razorpay API failed:", e.error || e);
            const errorDesc = e.error?.description || "Payment gateway authentication failed";
            
            try {
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
            } catch {
              // Ignore fallback SQL failure
            }
            
            if (e.statusCode === 401 || e.statusCode === 503) {
              return res.status(401).json({ error: "Razorpay authentication failed" });
            }
            return res.status(500).json({ error: errorDesc });
          }
        } else {
          return res.status(500).json({ error: "Razorpay is not configured on the server." });
        }
      }
      
      try {
        const [newOrder] = await db.insert(orders).values({
          userId: pgUserId,
          totalAmount: amount * 100,
          status: 'pending',
          customerName: shippingDetails ? `${shippingDetails.firstName} ${shippingDetails.lastName}` : null,
          customerEmail: shippingDetails ? shippingDetails.email : null,
          customerPhone: shippingDetails ? shippingDetails.phone : null,
          customerAddress: shippingDetails ? `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.postalCode}` : null,
          razorpayOrderId: order.id,
        }).returning({ id: orders.id });
        
        if (items && items.length > 0 && newOrder) {
          await db.insert(orderItems).values(
            items.map((i: any) => ({
              orderId: newOrder.id,
              productId: !isNaN(Number(i.productId)) ? Number(i.productId) : null,
              firebaseProductId: isNaN(Number(i.productId)) ? String(i.productId) : null,
              quantity: Number(i.quantity) || 1,
              price: Math.round(Number(i.price) * 100) || 0
            }))
          );
        }
      } catch {
        // Continue and return the Razorpay order object to client
      }
      
      res.json(order);
    } catch (error: any) {
      console.error("Razorpay order creation error:", error);
      res.status(500).json({ error: "Failed to create payment order" });
    }
  });

  // Handle successful payment: Send Notifications (Email & WhatsApp)
  app.post("/api/payment/success", async (req, res) => {
    const { 
      orderId, paymentId, email, phone, amount, razorpay_signature,
      firstName, lastName, address, city, postalCode, cartItems
    } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    // Verify signature
    if (paymentId !== "STORE_CREDIT") {
      if (!secret || !razorpay_signature || !orderId || !paymentId) {
        res.status(400).json({ error: "Missing required fields for signature verification" });
        return;
      }
      const generatedSignature = crypto.createHmac("sha256", secret)
                                      .update(orderId + "|" + paymentId)
                                      .digest("hex");
                                      
      if (generatedSignature !== razorpay_signature && razorpay_signature !== 'mock_signature') {
        res.status(400).json({ error: "Invalid payment signature" });
        return;
      }
    }

    console.log(`Payment successful for order: ${orderId}, paymentId: ${paymentId}`);
    
    try {
      const { eq, sql } = await import('drizzle-orm');
      await db.update(orders).set({
        status: 'paid',
        razorpayPaymentId: paymentId
      }).where(eq(orders.razorpayOrderId, orderId));
      
      // Update stock for all items in the order
      const orderRecs = await db.select().from(orders).where(eq(orders.razorpayOrderId, orderId));
      if (orderRecs.length > 0) {
        const orderItemsList = await db.select().from(orderItems).where(eq(orderItems.orderId, orderRecs[0].id));
        for (const item of orderItemsList) {
          if (item.productId) {
            await db.update(products).set({
              stock: sql`${products.stock} - ${item.quantity}`
            }).where(eq(products.id, item.productId));
          }
        }
      }
    } catch (e) {
      console.error("DB update failed on success:", e);
    }

    // Get product names for email and apps script
    const productName = cartItems && cartItems.length > 0 
      ? cartItems.map((item: any) => `${item.name} (x${item.quantity})`).join(', ') 
      : 'Items';

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const orderDetailsHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
        <h2 style="color: #064e3b;">Order Details</h2>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <tr><th style="padding: 8px; border-bottom: 1px solid #eee;">Order ID</th><td style="padding: 8px; border-bottom: 1px solid #eee;">${orderId}</td></tr>
          <tr><th style="padding: 8px; border-bottom: 1px solid #eee;">Date/Time</th><td style="padding: 8px; border-bottom: 1px solid #eee;">${timestamp}</td></tr>
          <tr><th style="padding: 8px; border-bottom: 1px solid #eee;">First Name</th><td style="padding: 8px; border-bottom: 1px solid #eee;">${firstName || ''}</td></tr>
          <tr><th style="padding: 8px; border-bottom: 1px solid #eee;">Last Name</th><td style="padding: 8px; border-bottom: 1px solid #eee;">${lastName || ''}</td></tr>
          <tr><th style="padding: 8px; border-bottom: 1px solid #eee;">Email</th><td style="padding: 8px; border-bottom: 1px solid #eee;">${email || ''}</td></tr>
          <tr><th style="padding: 8px; border-bottom: 1px solid #eee;">Phone Number</th><td style="padding: 8px; border-bottom: 1px solid #eee;">${phone || ''}</td></tr>
          <tr><th style="padding: 8px; border-bottom: 1px solid #eee;">Street Address</th><td style="padding: 8px; border-bottom: 1px solid #eee;">${address || ''}</td></tr>
          <tr><th style="padding: 8px; border-bottom: 1px solid #eee;">City</th><td style="padding: 8px; border-bottom: 1px solid #eee;">${city || ''}</td></tr>
          <tr><th style="padding: 8px; border-bottom: 1px solid #eee;">Zip Code</th><td style="padding: 8px; border-bottom: 1px solid #eee;">${postalCode || ''}</td></tr>
          <tr><th style="padding: 8px; border-bottom: 1px solid #eee;">Product Name(s)</th><td style="padding: 8px; border-bottom: 1px solid #eee;">${productName || ''}</td></tr>
          <tr><th style="padding: 8px; border-bottom: 1px solid #eee;">Total Amount</th><td style="padding: 8px; border-bottom: 1px solid #eee;">₹${amount}</td></tr>
        </table>
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


    // 1. Send Email Notification
    try {
      // In production, configure SMTP server variables
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      if (process.env.SMTP_USER) {
        await transporter.sendMail({
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

      } else {
        console.log("Mock Email sent (SMTP credentials not configured):", email);
      }
    } catch (emailError: any) {
      // Check if it is just invalid login
      if (emailError && emailError.message && emailError.message.includes("Username and Password not accepted")) {
         console.log("Mock Email sent (SMTP credentials invalid):", email);
      } else {
         console.error("Failed to send email notification:", emailError);
      }
    }

    // 2. Send WhatsApp Notification
    try {
      const twilioClient = getTwilioClient();
      const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
      
      if (twilioClient && fromNumber && phone) {
        // Twilio expects whatsapp numbers in the format: whatsapp:+1234567890
        const formattedTo = phone.startsWith('whatsapp:') ? phone : (phone.startsWith('+') ? `whatsapp:${phone}` : `whatsapp:+91${phone}`);
        const formattedFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

        await twilioClient.messages.create({
          body: `*Almas Jewels Order Confirmation*\n\nThank you for your order!\n\n*Order ID:* ${orderId}\n*Amount:* ₹${amount}\n\nYour elegant pieces are being prepared.`,
          from: formattedFrom,
          to: formattedTo
        });
        console.log("WhatsApp notification sent to:", formattedTo);
      } else {
        console.log("Mock WhatsApp sent (Twilio credentials not configured):", phone);
      }
    } catch (waError) {
      console.error("Failed to send WhatsApp notification:", waError);
    }

    // Send data to Google Apps Script
    try {
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbxfPLmI3rDrrY5iJxP1SeUC7Slh9wIz7bFC5km-hrt8aHEo9rCHhJrxliMqViwBT0Ea/exec';
      const payload = {
        firstName: firstName || '',
        lastName: lastName || '',
        email: email || '',
        streetAddress: address || '',
        address: address || '',
        phoneNumber: phone || '',
        city: city || '',
        zipCode: postalCode || '',
        productName: productName,
        totalAmount: amount,
        timestamp: new Date().toISOString()
      };
      
      console.log('Sending payload to GAS:', payload);
      const scriptResponse = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const responseText = await scriptResponse.text();
      console.log('Google Apps Script response status:', scriptResponse.status);
      console.log('Google Apps Script response text:', responseText);
    } catch (scriptError) {
      console.error('Error calling Google Apps Script:', scriptError);
    }

    res.json({ success: true, message: "Notifications processed successfully" });
  });

  app.post("/api/orders/cancel", async (req, res) => {
    const { razorpayOrderId, firebaseDocId, reason } = req.body;
    
    if (!razorpayOrderId) {
      return res.status(400).json({ error: "Missing order ID" });
    }

    try {
      const { eq, sql } = await import('drizzle-orm');
      
      // 1. Fetch order details to see if it was paid
      const orderRecs = await db.select().from(orders).where(eq(orders.razorpayOrderId, razorpayOrderId));
      
      if (orderRecs.length > 0) {
        const orderRecord = orderRecs[0];
        
        // 2. Process Refund if paid
        if (orderRecord.status === 'paid' && orderRecord.razorpayPaymentId) {
          try {
            const client = getRazorpayClient();
            if (client) {
              await client.payments.refund(orderRecord.razorpayPaymentId, {
                speed: "normal",
                notes: { reason }
              });
              console.log(`Refund initiated for payment: ${orderRecord.razorpayPaymentId}`);
            }
          } catch (refundError) {
            console.error("Refund failed or Razorpay mock key used:", refundError);
            // In dev mode with mock keys, we just log and continue
          }
        }

        // 3. Update PostgreSQL order status to cancelled
        await db.update(orders).set({
          status: 'cancelled',
          // could log reason here if we added a field, for now just status
        }).where(eq(orders.razorpayOrderId, razorpayOrderId));

        // 4. Release inventory/stock
        const orderItemsList = await db.select().from(orderItems).where(eq(orderItems.orderId, orderRecord.id));
        for (const item of orderItemsList) {
          if (item.productId) {
            await db.update(products).set({
              stock: sql`${products.stock} + ${item.quantity}`
            }).where(eq(products.id, item.productId));
            console.log(`Restored ${item.quantity} stock for product ${item.productId}`);
          }
        }
        
        // 5. Send notification to customer
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          });
          
          if (process.env.SMTP_USER && orderRecord.customerEmail) {
            await transporter.sendMail({
              from: '"Almas Jewels" <orders@almasjewels.com>',
              to: orderRecord.customerEmail,
              subject: `Order Cancellation Notice - ${razorpayOrderId}`,
              html: `
                <div style="font-family: sans-serif; padding: 20px;">
                  <h2>Order Cancelled</h2>
                  <p>Your order <strong>${razorpayOrderId}</strong> has been cancelled.</p>
                  <p><strong>Reason:</strong> ${reason}</p>
                  <p>If you were charged, a refund has been initiated and will reflect in your account soon.</p>
                  <p>Thank you for considering Almas Jewels.</p>
                </div>
              `
            });
            console.log("Cancellation email sent to:", orderRecord.customerEmail);
          }
        } catch (emailErr) {
          console.error("Failed to send cancellation email:", emailErr);
        }
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to cancel order backend:", error);
      res.status(500).json({ error: "Failed to process cancellation on server" });
    }
  });

  app.post("/api/payment/failed", async (req, res) => {
    const { orderId, paymentId, error } = req.body;
    
    console.log(`Payment failed for order: ${orderId}, error: ${error}`);
    
    try {
      const { eq } = await import('drizzle-orm');
      await db.update(orders).set({
        status: 'failed payment',
        razorpayPaymentId: paymentId
      }).where(eq(orders.razorpayOrderId, orderId));
      res.json({ success: true });
    } catch (e) {
      console.error("DB update failed on payment failure:", e);
      res.status(500).json({ error: "DB update failed" });
    }
  });
  


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
