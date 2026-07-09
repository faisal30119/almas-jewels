import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { db } from "./src/db/index.ts";
import { users, products } from "./src/db/schema.ts";
import { eq } from "drizzle-orm";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import twilio from "twilio";
import Razorpay from "razorpay";
import nodemailer from "nodemailer";

// Initialize Cloudinary conditionally
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const upload = multer({ storage: multer.memoryStorage() });

let twilioClient: twilio.Twilio | null = null;
function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (accountSid && authToken) {
      twilioClient = twilio(accountSid, authToken);
    }
  }
  return twilioClient;
}

let razorpayClient: Razorpay | null = null;
function getRazorpayClient() {
  if (!razorpayClient) {
    const keyId = process.env.VITE_RAZORPAY_KEY_ID;
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

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Example secured route
  app.post("/api/users/sync", requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { uid, email } = req.user;
    try {
      const result = await db.insert(users)
        .values({ uid, email: email || '' })
        .onConflictDoUpdate({
          target: users.uid,
          set: { email: email || '' },
        })
        .returning();
      res.json({ user: result[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Upload Product Media to Cloudinary
  app.post("/api/admin/upload", requireAuth, upload.single("file"), async (req: AuthRequest, res) => {
    // Note: In a real app, add check to ensure req.user is an admin
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      res.status(500).json({ error: "Cloudinary is not configured. Add keys in Settings." });
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

  // Inventory Sync Logic
  app.post("/api/inventory/sync", requireAuth, async (req: AuthRequest, res) => {
    // Note: In a real app, add check to ensure req.user is an admin
    const { updates } = req.body;
    if (!Array.isArray(updates)) {
      res.status(400).json({ error: "Invalid updates array" });
      return;
    }

    try {
      // Execute sequentially or use a transaction
      for (const update of updates) {
        if (typeof update.productId === "number" && typeof update.stock === "number") {
          await db.update(products)
            .set({ stock: update.stock })
            .where(eq(products.id, update.productId));
        }
      }
      res.json({ success: true, message: "Inventory synced successfully" });
    } catch (error) {
      console.error("Inventory sync error:", error);
      res.status(500).json({ error: "Failed to sync inventory" });
    }
  });

  // WhatsApp Notification Route
  app.post("/api/notifications/whatsapp", requireAuth, async (req: AuthRequest, res) => {
    // Note: In a real app, add check to ensure req.user is an admin
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

  // Razorpay Create Order Endpoint
  app.post("/api/payment/create-order", async (req, res) => {
    const { amount, currency = "INR" } = req.body;
    
    if (!amount) {
      res.status(400).json({ error: "Amount is required" });
      return;
    }

    const client = getRazorpayClient();
    if (!client) {
      // For development/mock purposes if keys aren't set
      res.json({ 
        id: `mock_order_${Math.random().toString(36).substring(7)}`,
        amount: amount * 100, // convert to paise
        currency 
      });
      return;
    }

    try {
      const options = {
        amount: amount * 100, // Razorpay works in smallest currency unit (paise)
        currency,
        receipt: `receipt_${Math.random().toString(36).substring(7)}`
      };
      const order = await client.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      res.status(500).json({ error: "Failed to create payment order" });
    }
  });

  // Handle successful payment: Send Notifications (Email & WhatsApp)
  app.post("/api/payment/success", async (req, res) => {
    const { orderId, paymentId, email, phone, amount } = req.body;

    // In a real application, you should verify the Razorpay signature here before proceeding.
    console.log(`Payment successful for order: ${orderId}, paymentId: ${paymentId}`);

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #064e3b;">Payment Successful!</h2>
        <p>Thank you for your order at Almas Bridal.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Amount:</strong> ₹${amount}</p>
        <p>We are processing your elegant pieces and will notify you when they ship.</p>
      </div>
    `;

    // 1. Send Email Notification
    try {
      // In production, configure SMTP server variables
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      if (process.env.SMTP_USER) {
        await transporter.sendMail({
          from: '"Almas Bridal" <orders@almasbridal.com>',
          to: email,
          subject: `Order Confirmation - ${orderId}`,
          html: emailHtml
        });
        console.log("Email notification sent to:", email);
      } else {
        console.log("Mock Email sent (SMTP credentials not configured):", email);
      }
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
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
          body: `*Almas Bridal Order Confirmation*\n\nThank you for your order!\n\n*Order ID:* ${orderId}\n*Amount:* ₹${amount}\n\nYour elegant pieces are being prepared.`,
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

    res.json({ success: true, message: "Notifications processed successfully" });
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
