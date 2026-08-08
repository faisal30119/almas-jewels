import { pgTable, text, serial, timestamp, integer, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(), // stored as cents/paise or integer amount
  stock: integer('stock').notNull().default(0),
  image: text('image'),
  category: text('category'),
  stoneColor: text('stone_color'),
  plating: text('plating'),
  description: text('description'),
  inclusions: text('inclusions').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  totalAmount: integer('total_amount').notNull(),
  status: text('status').notNull().default('pending'),
  customerName: text('customer_name'),
  customerEmail: text('customer_email'),
  customerPhone: text('customer_phone'), // For WhatsApp notifications
  customerAddress: text('customer_address'),
  razorpayOrderId: text('razorpay_order_id'),
  razorpayPaymentId: text('razorpay_payment_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id'),
  firebaseProductId: text('firebase_product_id'),
  quantity: integer('quantity').notNull(),
  price: integer('price').notNull(),
});

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  discountAmount: integer('discount_amount').notNull(),
  isActive: integer('is_active').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
