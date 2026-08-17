import nodemailer from 'nodemailer';

const ADMIN_EMAIL = 'almasladiescornersakchi@gmail.com';
const STORE_NAME  = 'Almas Jewels';

function formatPrice(n: number) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function getTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT  || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ─── Item rows ────────────────────────────────────────────────────────────────
function itemRows(items: { name: string; quantity: number; price: number }[]) {
  return items.map((item) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1f2328;">${item.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#57606a;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1f2328;text-align:right;">${formatPrice(item.price * item.quantity)}</td>
    </tr>`).join('');
}

// ─── Customer confirmation email ───────────────────────────────────────────────
function customerEmailHtml(params: {
  name: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  amount: number;
  address: string;
  createdAt: string;
}) {
  const { name, orderId, items, amount, address, createdAt } = params;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:-apple-system,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border:1px solid #e5e7eb;">
    <!-- Header -->
    <div style="background:#022c22;padding:28px 32px;">
      <h1 style="margin:0;color:#D4AF37;font-size:22px;letter-spacing:2px;font-weight:700;">ALMAS JEWELS</h1>
      <p style="margin:6px 0 0;color:#a7c4b5;font-size:13px;">Luxury Bridal Jewelry</p>
    </div>
    <!-- Body -->
    <div style="padding:32px;">
      <h2 style="margin:0 0 4px;font-size:20px;color:#1f2328;">Order Confirmed! 🎉</h2>
      <p style="margin:0 0 24px;color:#57606a;font-size:14px;">Hi ${name}, thank you for your order. We've received it and will start processing shortly.</p>

      <!-- Order meta -->
      <table width="100%" style="border-collapse:collapse;margin-bottom:24px;background:#f7f8fa;">
        <tr>
          <td style="padding:12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#57606a;">Order ID</td>
          <td style="padding:12px;font-size:13px;font-family:monospace;color:#1f2328;text-align:right;">${orderId}</td>
        </tr>
        <tr>
          <td style="padding:12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#57606a;">Date</td>
          <td style="padding:12px;font-size:13px;color:#1f2328;text-align:right;">${formatDate(createdAt)}</td>
        </tr>
        <tr>
          <td style="padding:12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#57606a;">Shipping To</td>
          <td style="padding:12px;font-size:13px;color:#1f2328;text-align:right;">${address}</td>
        </tr>
      </table>

      <!-- Items -->
      <p style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#57606a;margin:0 0 8px;">Order Items</p>
      <table width="100%" style="border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr style="background:#f7f8fa;">
            <th style="padding:10px 12px;font-size:11px;text-align:left;color:#57606a;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Item</th>
            <th style="padding:10px 12px;font-size:11px;text-align:center;color:#57606a;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Qty</th>
            <th style="padding:10px 12px;font-size:11px;text-align:right;color:#57606a;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows(items)}</tbody>
      </table>

      <!-- Total -->
      <div style="border-top:2px solid #022c22;padding-top:12px;display:flex;justify-content:space-between;">
        <span style="font-size:14px;font-weight:700;color:#1f2328;">Amount Paid</span>
        <span style="font-size:16px;font-weight:700;color:#022c22;">${formatPrice(amount)}</span>
      </div>
      <table width="100%" style="margin-top:8px;">
        <tr>
          <td style="font-size:14px;font-weight:700;color:#1f2328;">Amount Paid</td>
          <td style="font-size:16px;font-weight:700;color:#022c22;text-align:right;">${formatPrice(amount)}</td>
        </tr>
      </table>

      <p style="margin:28px 0 0;font-size:13px;color:#57606a;line-height:1.6;">
        We'll send you a shipping update once your order is dispatched.<br>
        For any queries, WhatsApp us at <a href="https://wa.me/919608921088" style="color:#022c22;">+91 96089 21088</a>
        or email <a href="mailto:almasladiescornersakchi@gmail.com" style="color:#022c22;">almasladiescornersakchi@gmail.com</a>.
      </p>
    </div>
    <!-- Footer -->
    <div style="background:#f7f8fa;padding:16px 32px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:11px;color:#57606a;text-align:center;">© ${new Date().getFullYear()} Almas Jewels · Sakchi, Jamshedpur, Jharkhand</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Admin notification email ──────────────────────────────────────────────────
function adminEmailHtml(params: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  amount: number;
  address: string;
  createdAt: string;
}) {
  const { customerName, customerEmail, customerPhone, orderId, items, amount, address, createdAt } = params;
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:-apple-system,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border:1px solid #e5e7eb;">
    <div style="background:#022c22;padding:20px 32px;">
      <h1 style="margin:0;color:#D4AF37;font-size:18px;letter-spacing:1px;">🛍️ New Order Received</h1>
      <p style="margin:4px 0 0;color:#a7c4b5;font-size:13px;">Almas Jewels Admin Notification</p>
    </div>
    <div style="padding:28px 32px;">
      <table width="100%" style="border-collapse:collapse;background:#f7f8fa;margin-bottom:20px;">
        <tr><td style="padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#57606a;">Order ID</td><td style="padding:10px 12px;font-family:monospace;font-size:13px;color:#1f2328;text-align:right;">${orderId}</td></tr>
        <tr><td style="padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#57606a;">Date</td><td style="padding:10px 12px;font-size:13px;color:#1f2328;text-align:right;">${formatDate(createdAt)}</td></tr>
        <tr><td style="padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#57606a;">Customer</td><td style="padding:10px 12px;font-size:13px;color:#1f2328;text-align:right;">${customerName}</td></tr>
        <tr><td style="padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#57606a;">Email</td><td style="padding:10px 12px;font-size:13px;color:#1f2328;text-align:right;">${customerEmail}</td></tr>
        <tr><td style="padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#57606a;">Phone</td><td style="padding:10px 12px;font-size:13px;color:#1f2328;text-align:right;">${customerPhone}</td></tr>
        <tr><td style="padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#57606a;">Address</td><td style="padding:10px 12px;font-size:13px;color:#1f2328;text-align:right;">${address}</td></tr>
      </table>

      <p style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#57606a;margin:0 0 8px;">Items Ordered</p>
      <table width="100%" style="border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr style="background:#f7f8fa;">
            <th style="padding:8px 12px;font-size:11px;text-align:left;color:#57606a;text-transform:uppercase;letter-spacing:1px;">Item</th>
            <th style="padding:8px 12px;font-size:11px;text-align:center;color:#57606a;text-transform:uppercase;letter-spacing:1px;">Qty</th>
            <th style="padding:8px 12px;font-size:11px;text-align:right;color:#57606a;text-transform:uppercase;letter-spacing:1px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows(items)}</tbody>
      </table>

      <table width="100%" style="border-top:2px solid #022c22;padding-top:8px;">
        <tr>
          <td style="padding-top:10px;font-size:14px;font-weight:700;color:#1f2328;">Total Amount</td>
          <td style="padding-top:10px;font-size:16px;font-weight:700;color:#022c22;text-align:right;">${formatPrice(amount)}</td>
        </tr>
      </table>

      <div style="margin-top:20px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/admin/orders"
           style="display:inline-block;background:#022c22;color:#D4AF37;padding:10px 20px;font-size:13px;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">
          View in Admin Panel →
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─── Main export ───────────────────────────────────────────────────────────────
export interface OrderEmailParams {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  amount: number;
  address: string;
  createdAt: string;
}

export async function sendOrderConfirmationEmails(params: OrderEmailParams) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP not configured — skipping order emails');
    return;
  }

  const transporter = getTransporter();

  // 1. Customer confirmation
  await transporter.sendMail({
    from: `"${STORE_NAME}" <${process.env.SMTP_USER}>`,
    to: params.customerEmail,
    subject: `Order Confirmed — ${params.orderId} | ${STORE_NAME}`,
    html: customerEmailHtml({
      name: params.customerName,
      orderId: params.orderId,
      items: params.items,
      amount: params.amount,
      address: params.address,
      createdAt: params.createdAt,
    }),
  });

  // 2. Admin notification
  await transporter.sendMail({
    from: `"${STORE_NAME} Orders" <${process.env.SMTP_USER}>`,
    to: ADMIN_EMAIL,
    subject: `New Order ₹${Number(params.amount).toLocaleString('en-IN')} from ${params.customerName} — ${params.orderId}`,
    html: adminEmailHtml(params),
  });
}
