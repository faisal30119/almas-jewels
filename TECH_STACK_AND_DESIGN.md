# Almas Jewels — Technical Stack, Architecture & Luxury Design System

This document provides a comprehensive breakdown of the technology stack, application architecture, luxury design language, and key modules powering **Almas Jewels (الماس)**.

---

## 1. Executive Summary

**Almas Jewels** is an ultra-premium, high-end bridal couture e-commerce platform and bespoke atelier consultation system. Designed for royal and luxury bridal wear, the application emphasizes refined aesthetics, tactile motion, seamless checkout, real-time inventory management, order tracking, and bespoke appointments.

---

## 2. Technology Stack Overview

### 2.1 Frontend Framework & Core Libraries
* **React 19 (`react` & `react-dom` v19.0.1)**: Modern declarative component model utilizing concurrent rendering, modern hooks, and strict state segregation.
* **TypeScript (~5.8.2)**: Strict type-safety across models (Products, Orders, Appointments, Auth, Cart, Wishlist).
* **Vite 6 (`vite` v6.2.3)**: Ultra-fast development server, native ES module bundling, and optimized production chunking.
* **React Router DOM 7 (`react-router-dom` v7.18.1)**: Declarative client-side routing, route-level authorization guards (`AdminRoute`), action handler listeners, and search parameter synchronization.
* **Motion (`motion` v12.23.24)**: Hardware-accelerated fluid layout transitions, micro-interactions, exit animations, and modal staging.
* **Lucide React (`lucide-react` v0.546.0)**: Clean, minimalist vector iconography aligned to high-end editorial standards.

### 2.2 Styling & Design Architecture
* **Tailwind CSS v4 (`@tailwindcss/vite` & `tailwindcss` v4.1.14)**: Next-generation CSS engine configured with custom design tokens, modern `@theme` directive, and zero-runtime CSS utility classes.
* **Class Variance & Utility Merging (`clsx`, `tailwind-merge`)**: Dynamic class evaluation and conflict resolution.

### 2.3 Backend & Server Layer
* **Node.js + Express (`express` v4.22.2, `tsx`)**: Unified full-stack server serving API endpoints alongside Vite's middleware pipeline.
* **Bundler (`esbuild` v0.28.1)**: Compiles `server.ts` into a CommonJS bundle (`dist/server.cjs`) for deployment.
* **Security & Infrastructure**:
  * **Helmet (`helmet` v8.3.0)**: Secure HTTP headers protection.
  * **Rate Limiter (`express-rate-limit` v8.5.2)**: Protection against brute-force and high-frequency traffic.
  * **CORS (`cors` v2.8.6)**: Safe cross-origin resource access.

### 2.4 Cloud Persistence, Authentication & Integrations
* **Firebase v12 (`firebase` & `firebase-admin`)**:
  * **Firebase Authentication**: Email/Password authentication, Google OAuth popup/redirect, secure password resets, and session listeners.
  * **Cloud Firestore**: Real-time NoSQL database for products, categorized collections, orders, appointment bookings, customized inquiries, and customer wishlist persistence.
* **Relational Database Ready (`drizzle-orm`, `drizzle-kit`, `pg`)**: Schema definitions and migrations for Cloud SQL / PostgreSQL when relational transactions are required.
* **Communications & Media**:
  * **Cloudinary (`cloudinary` v2.10.0)** & **Multer (`multer`)**: High-resolution image asset uploads for product catalog additions.
  * **Nodemailer (`nodemailer` v9.0.3)**: Transactional email notifications.
  * **Twilio (`twilio` v6.0.2)**: SMS notifications for order status and bridal fittings.
  * **Razorpay (`razorpay` v2.9.6)**: Secure payment gateway integration.
  * **Google GenAI (`@google/genai` v2.4.0)**: AI-driven bridal styling recommendations and assistants.

---

## 3. Luxury Design System & Aesthetic Language

The visual design system of Almas Jewels is constructed around the principles of **Haute Couture Elegance, Spatial Generosity, and Editorial Minimalism**.

### 3.1 Color Palette & Visual Tones

| Role | Token / Value | Hex | Description |
| :--- | :--- | :--- | :--- |
| **Primary Brand (Deep Luxury)** | `--color-emerald-950` | `#022c22` | Deep Arabian Emerald. Grounding, opulent, regal. |
| **Secondary Brand** | `--color-emerald-900` | `#064e3b` | Rich forest tone for interactive states and hover accents. |
| **Luxury Accent (Royal Gold)** | `--color-gold-500` / Gold Accent | `#D4AF37` / `#C79853` | Warm brushed gold for primary action buttons, badges, highlights. |
| **Light Canvas Background** | Light Neutral Base | `#FAFAF8` / `#FFFFFF` | Soft off-white preventing harsh starkness while maintaining high contrast. |
| **Text Primary** | High-contrast Neutral | `#171717` (Neutral-900) | Deep charcoal/black ensuring crisp legibility (WCAG AAA compliant). |
| **Text Muted / Sub-labels** | Neutral Mid-tone | `#525252` / `#737373` | Balanced secondary text for metadata, tracking numbers, and details. |

### 3.2 Typographic Hierarchy
* **Display & Headings**: `Playfair Display` (Serif)
  * Imparts timeless romanticism, couture craftsmanship, and high-fashion prestige.
  * Used on hero titles, product names, collection banners, and section headers.
* **Body & UI Interface**: `Inter` (Sans-Serif)
  * Exceptional legibility at small sizes, neutral optical balance, and clear numeric formatting for pricing and inventory counts.
  * Used for body copy, buttons, form inputs, metadata chips, and navigation links.

### 3.3 Spatial & Structural Composition
1. **Generous Negative Space**: Elevated breathing room between product cards, photography grids, and section dividers to reflect boutique exclusivity.
2. **Sharp, Crisp Geometries**: Sharp rectangular cards and structured 0px/minimal border radii reflecting high-fashion print layouts (Vogue, Harper's Bazaar).
3. **Subtle Motion Choreography**: Smooth fade-in and slide-up transitions using `motion` with spring physics and gentle eases (`duration: 0.2s - 0.4s`).
4. **No Visual Clutter / "Anti-Slop" Discipline**:
   * No loud rainbow/purple gradients or glow effects.
   * No nested cards-inside-cards.
   * Natural depth achieved via borders (`border-neutral-200`) and soft, natural shadows.

---

## 4. Key Functional Modules

### 4.1 Client Storefront
* **Hero Banner & Curated Showcase**: Featured collections (Bridal Lehengas, Royal Gowns, Sherwanis, Bespoke Couture).
* **Product Catalog & Detail View**: High-resolution imagery, fabric details, custom sizing guides, customization notes, and real-time stock checks.
* **Wishlist & Cart Drawers**: Real-time badge counters, persistent local and account synchronization.
* **Bespoke Consultation / Appointment Booking**: Calendar scheduling for in-person atelier appointments or virtual video styling.
* **Seamless Checkout & Tracking**: Delivery address capture, order placement, and live status timeline tracker.

### 4.2 Authentication & Security
* **Multi-mode Auth Modal**: Unified modal for Login, Sign Up, and Password Reset.
* **Dedicated Password Recovery (`/reset-password`)**: Validates Firebase Out-Of-Band (`oobCode`) security tokens with password confirmation and direct login routing.
* **Profile & Account Hub**: Order history with cancellation requests, saved wishlist items, and security password reset triggers.

### 4.3 Atelier Admin Portal (`/admin`)
* **Live Operations Dashboard**: Revenue metrics, order breakdown, and appointment schedule.
* **Catalog Management**: Add/Edit/Delete products with image uploads and tag management.
* **Order Fulfillment**: Update order states (`Pending` → `Processing` → `Shipped` → `Delivered`) and handle cancellations.
* **Appointment Manager**: Review and confirm bridal consultation bookings.

---

## 5. Directory Structure

```
├── server.ts                   # Express server entry point & API proxy
├── vite.config.ts              # Vite + Tailwind v4 build configuration
├── package.json                # Project dependencies and script declarations
├── metadata.json               # Application metadata and runtime permissions
├── src/
│   ├── main.tsx                # Client application root mount
│   ├── App.tsx                 # Master layout, route definitions & auth listeners
│   ├── index.css               # Design tokens, fonts, and Tailwind styles
│   ├── types.ts                # TypeScript interfaces (Product, Order, Appointment)
│   ├── lib/
│   │   ├── firebase.ts         # Firebase client initialization & Auth helpers
│   │   └── utils.ts            # Class name merge utilities (cn)
│   ├── context/
│   │   ├── AuthContext.tsx     # Firebase Auth context & user state provider
│   │   ├── CartContext.tsx     # Shopping cart state & quantity calculations
│   │   └── WishlistContext.tsx # Wishlist persistence & toggling
│   ├── components/
│   │   ├── Navbar.tsx          # Navigation bar with sticky state & badges
│   │   ├── Footer.tsx          # Brand footer & newsletter subscription
│   │   ├── Layout.tsx          # Master layout wrapper with header & footer
│   │   ├── AuthModal.tsx       # Login, Register & Reset Password modal
│   │   ├── AdminRoute.tsx      # Protected route guard for atelier admins
│   │   └── ProductCard.tsx     # Editorial product card with quick-actions
│   └── pages/
│       ├── Home.tsx            # Landing page with hero, trends & lookbook
│       ├── Catalog.tsx         # Filterable bridal collection catalog
│       ├── ProductDetail.tsx   # Couture product showcase & inquiry
│       ├── Checkout.tsx        # Order completion & address details
│       ├── Success.tsx         # Post-order confirmation screen
│       ├── OrderTracking.tsx   # Live delivery timeline tracker
│       ├── Profile.tsx         # Customer orders, wishlist & security settings
│       ├── ResetPassword.tsx   # Secure token-based password reset screen
│       └── Admin.tsx           # Atelier administrative management suite
```
