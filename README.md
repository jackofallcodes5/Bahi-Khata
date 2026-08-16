# 📖 Bahi Khata – Digital Business Management & SaaS Billing Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Node Version](https://img.shields.io/badge/node-%E2%89%A518.0.0-blue.svg)](#)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue.svg)](#)
[![MySQL Version](https://img.shields.io/badge/mysql-8.0-orange.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](#)

> **Bahi Khata** (Hindi for *Account Ledger Book*) is a full-stack multi-tenant SaaS platform designed to digitise local Indian businesses — grocery stores, milkmen, water jar suppliers, newspaper vendors, maid services, cleaners, cooks, laundries, and tiffin services. 
> 
> It provides real-time POS billing, barcode scanning, unique phone number customer auto-lookup, daily delivery attendance tracking, automated service bill calculations, PDF invoice downloads, a unified customer ledger with one-click **"Pay All"**, and platform super-admin controls.

---

## 📋 Table of Contents

1. [Key Features Overview](#-key-features-overview)
2. [Technology Stack](#-technology-stack)
3. [System Architecture & Data Flow](#-system-architecture--data-flow)
4. [Multi-Role Deep Dive & Workflows](#-multi-role-deep-dive--workflows)
   - [1. Retail Shop Module](#1-retail-shop-module)
   - [2. Delivery Business Module](#2-delivery-business-module)
   - [3. Service Provider Module](#3-service-provider-module)
   - [4. Customer Portal](#4-customer-portal)
   - [5. Super Admin Control Panel](#5-super-admin-control-panel)
5. [Complete API Reference](#-complete-api-reference)
6. [Database Schema & ERD Architecture](#-database-schema--erd-architecture)
7. [Installation & Local Setup Guide](#-installation--local-setup-guide)
8. [Pre-Seeded Test Credentials](#-pre-seeded-test-credentials)
9. [Unique Phone Number Auto-Fetch Workflow](#-unique-phone-number-auto-fetch-workflow)
10. [PDF Invoice & Receipt Generation](#-pdf-invoice--receipt-generation)
11. [Security & Production Hardening](#-security--production-hardening)
12. [Production Deployment Guide](#-production-deployment-guide)
13. [License](#-license)

---

## ✨ Key Features Overview

- 🏬 **Point of Sale (POS) Billing Engine**: Rapid barcode scanning, live search, custom discounts, cash/UPI/Card/Udhar payment methods, and automated stock deductions.
- 📱 **Unique Phone Customer Auto-Fetch**: Enter a customer's 10-digit phone number in POS billing to instantly fetch their full name, past transactions, and live Udhar credit balance.
- 🚚 **Daily Route & Delivery Attendance Tracker**: Mark daily deliveries (*Delivered* / *Skipped*) for milk, water, and newspaper routes with a single click.
- 🧹 **Service Subscriptions & Auto-Calculated Bills**: Compute monthly service bills automatically (`Total Delivered Quantity × Unit Price = Calculated Monthly Invoice`).
- 💳 **Unified Customer Dues & One-Click "Pay All"**: Customers can view total outstanding dues across all connected merchants and clear them instantly with a single **"Pay All"** click.
- 📄 **PDF Invoice & Receipt Generator**: Stream formatted, printable PDF tax invoices powered by `PDFKit` directly from backend API endpoints.
- 🛡️ **Role-Based Access Control (RBAC)**: Enforces 5 distinct roles (`Admin`, `Retail Shop`, `Delivery Business`, `Service Provider`, `Customer`) with JWT token verification.
- 👑 **Super Admin Management**: Monitor platform revenue volume, registered businesses, user directories, and toggle user active/blocked statuses.

---

## 🛠 Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | React 18 + Vite 5 | Single Page Application (SPA) with fast HMR & modular components |
| **Styling & UI** | Tailwind CSS + Vanilla CSS | Modern responsive design, glassmorphism cards, micro-animations |
| **Icons & Visuals** | React Icons (`react-icons/md`) | Material Design icon set |
| **HTTP Client** | Axios | Configured with automatic Bearer JWT header interceptors |
| **Backend Runtime** | Node.js (≥18) + Express 4 | RESTful MVC API server |
| **Database Engine** | MySQL 8 | Relational database with InnoDB engine, foreign keys, and transactions |
| **Database Driver** | `mysql2/promise` | Connection pooling with async/await Promise API |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) + `bcrypt` | Signed JWT tokens (`HS256`) and salt-hashed passwords |
| **Document Generator**| PDFKit (`pdfkit`) | Server-side PDF invoice generation streamed directly to HTTP responses |
| **Security Controls** | Helmet + `express-rate-limit` | HTTP header security and rate limiting on `/api/*` endpoints |

---

## 🏗 System Architecture & Data Flow

```
                                +---------------------------+
                                |    React 18 Single Page   |
                                |     Application (Vite)    |
                                +-------------+-------------+
                                              |
                                      HTTP / REST APIs
                                      (Bearer JWT Auth)
                                              |
                                              v
                                +-------------+-------------+
                                |   Node.js / Express API   |
                                |       Gateway App         |
                                +-------------+-------------+
                                              |
                        +---------------------+---------------------+
                        |                     |                     |
                        v                     v                     v
            +-----------+-----------+ +-------+-------+  +----------+----------+
            |  Auth & Role Control  | | Business Logic|  | PDFKit Document Engine|
            |  Middleware (JWT)     | |  Controllers  |  |  (PDF Tax Invoices)  |
            +-----------+-----------+ +-------+-------+  +---------------------+
                                              |
                                              v
                                +-------------+-------------+
                                |   MySQL 8 Database Pool   |
                                |  (InnoDB / Transactions)  |
                                +---------------------------+
```

---

## 💡 Multi-Role Deep Dive & Workflows

### 1. Retail Shop Module
- **POS (Point of Sale)** (`/shop/pos`):
  - Search items by product name or scan physical barcodes.
  - Enter Customer Phone Number (`5555555555`) to auto-fetch Customer Name & Udhar balance.
  - Supports Cash, UPI, Card, or Udhar (Credit) checkout.
  - Post-checkout modal offers an instant **Download Bill (PDF)** button.
- **Inventory Management** (`/shop/inventory`):
  - Complete catalog management with stock indicators and low-stock warning badges (`<= 10` items).
  - Add product modal with category allocation and barcode assignment.
- **Customer Udhar Directory** (`/shop/customers`):
  - View Customer ID badges (`ID: #1`), names, unique phone numbers, and balances.
  - Add Customer modal for quick manual onboarding (name & phone only).
- **Reports & Invoices** (`/shop/reports`):
  - Real-time KPI summary cards: Today's Revenue, Total Invoices, Pending Udhar Dues.
  - Interactive Invoice History table with a **PDF** download button for every receipt.

### 2. Delivery Business Module
- **Today's Delivery Route** (`/delivery/dashboard`):
  - Displays daily customer list for milk, water, or newspaper deliveries.
  - One-tap **Mark Delivered** or **Skip** status toggle.
- **Service Customer Directory**:
  - Add new service customers by phone number, service product name (e.g. *Cow Milk 1L*), rate per unit (e.g. *₹60*), daily quantity, and frequency (*Everyday* / *Monthly*).
- **Automated Service Bill Calculation Engine**:
  - Calculates bills automatically: `Total Quantity Delivered × Unit Rate = Total Service Bill`.
  - Issues monthly bill to MySQL, updates customer's Udhar balance, and generates printable PDF invoices.

### 3. Service Provider Module
- Designed for maids, cooks, house cleaners, laundry services, and gardeners.
- Track daily attendance, set flat monthly or daily rates, compute monthly service bills, and issue PDF invoices.

### 4. Customer Portal
- **Dashboard** (`/customer/home`):
  - Live Total Outstanding Dues card across all linked stores and service providers.
  - **"Pay All"** Button: Clears all outstanding balances (`₹0.00`), updates invoice payment statuses to `Paid`, logs transaction receipts, and displays a green **`Status: Paid`** checkmark badge.
- **My Subscriptions** (`/customer/services`):
  - View active daily deliveries and service subscriptions.
  - Attendance tracker calendar.
  - **"+1 Extra Item"** request button & **"Pause 7 Days"** toggle.
- **Payment History** (`/customer/payments`):
  - Comprehensive log of past payments across all connected businesses.
  - **Download Receipt (PDF)** button for every completed payment.
- **Account & Settings** (`/customer/account`):
  - Edit profile details (name, phone, email, password), manage addresses, and toggle Dark Mode.

### 5. Super Admin Control Panel
- **Platform Metrics** (`/admin/dashboard`):
  - High-level KPIs: Total Users, Retail Shops, Delivery Partners, Total Transaction Volume.
- **User Directory & Control**:
  - Complete user directory with role badges.
  - One-click **Activate / Block User** toggle button.

---

## 📡 Complete API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user (`Customer`, `Retail Shop`, `Delivery Business`, `Service Provider`) |
| `POST` | `/api/auth/login` | Public | Authenticate user via phone & password, returns JWT token |
| `GET` | `/api/auth/me` | Protected | Fetch currently logged-in user profile |
| `PUT` | `/api/auth/profile` | Protected | Update logged-in user's profile details |

### Retail Shop Module (`/api/shop`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/shop/dashboard` | Retail Shop | Fetch today's sales revenue, pending Udhar, and low stock count |
| `GET` | `/api/shop/products` | Retail Shop | Get product catalog with inventory stock levels & categories |
| `POST` | `/api/shop/products` | Retail Shop | Add new product with barcode, price, and initial stock |
| `GET` | `/api/shop/customers` | Retail Shop | Get shop customers with unique Customer ID, phone, and Udhar balance |
| `POST` | `/api/shop/customers` | Retail Shop | Add / link customer by name & phone number |

### Invoices & Bills (`/api/bills`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bills` | Retail Shop | Generate POS bill, update inventory, and adjust Udhar credit balance |
| `GET` | `/api/bills` | Retail Shop | Get invoice history for the shop |
| `GET` | `/api/bills/:id/pdf` | Protected | Download formatted PDF Tax Invoice generated by PDFKit |

### Delivery & Service Module (`/api/delivery`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/delivery/todays-route` | Delivery/Service | Get today's delivery route list with daily customer quantities |
| `POST` | `/api/delivery/attendance` | Delivery/Service | Mark delivery attendance (`Delivered` / `Skipped`) for today |
| `GET` | `/api/delivery/customers` | Delivery/Service | Get all service customers and active subscriptions |
| `POST` | `/api/delivery/customers` | Delivery/Service | Add customer & set up daily service subscription (rate & qty) |
| `POST` | `/api/delivery/calculate-bill` | Delivery/Service | Calculate monthly bill based on delivered units, issue bill, and update dues |

### Customer Portal (`/api/customer`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/customer/dashboard` | Customer | Get total outstanding dues & list of connected businesses |
| `GET` | `/api/customer/subscriptions`| Customer | Get active service subscriptions & today's delivery status |
| `POST` | `/api/customer/subscriptions/:id/pause` | Customer | Pause subscription for 7 days |
| `POST` | `/api/customer/subscriptions/:id/extra` | Customer | Request +1 extra quantity for today's delivery |
| `GET` | `/api/customer/payments` | Customer | Fetch completed payment transaction history |
| `POST` | `/api/customer/pay-all` | Customer | Clear all outstanding dues (`₹0`), mark bills as Paid, and log payment receipts |

### Super Admin Control (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Super Admin | Get overall platform statistics (users, shops, delivery partners, volume) |
| `GET` | `/api/admin/users` | Super Admin | Fetch complete platform user directory |
| `PATCH` | `/api/admin/users/:id/status` | Super Admin | Toggle user active/blocked status |

---

## 🗄 Database Schema & ERD Architecture

The database is built on MySQL 8 using **InnoDB** with strict foreign key constraints and transactional integrity.

```
+----------------+       +------------------+       +-------------------+
|     roles      |       |      users       |       |       shops       |
+----------------+       +------------------+       +-------------------+
| id (PK)        | <---+ | id (PK)          | <---+ | id (PK)           |
| name           |     | | role_id (FK)     |     | | user_id (FK)      |
| description    |     | | name             |     | | business_name   |
+----------------+     | | phone (UNIQUE)   |     | +-------------------+
                       | | password_hash    |     
                       | +------------------+       +-------------------+
                       |                            | delivery_business |
                       |                            +-------------------+
                       |                            | id (PK)           |
                       |                            | user_id (FK)      |
                       |                            | business_name     |
                       |                            +-------------------+
                       |
                       +----------------------------------+
                                                          |
                                                          v
+------------------+       +------------------+   +---------------------+
|    products      |       |    customers     |   |    subscriptions    |
+------------------+       +------------------+   +---------------------+
| id (PK)          |       | id (PK)          |   | id (PK)             |
| business_user_id | <---+ | business_user_id |   | business_user_id    |
| name, price      |       | customer_user_id |   | customer_id (FK)    |
+--------+---------+       | outstanding_bal  |   | product_id (FK)     |
         |                 +--------+---------+   | qty_per_delivery    |
         v                          |             +----------+----------+
+------------------+                |                        |
|    inventory     |                v                        v
+------------------+       +------------------+   +---------------------+
| product_id (FK)  |       |      bills       |   |     attendance      |
| stock            |       +------------------+   +---------------------+
| low_stock_thresh |       | id (PK)          |   | subscription_id(FK) |
+------------------+       | customer_id (FK) |   | date, status        |
                           | invoice_no       |   | quantity_delivered  |
                           | net_amount       |   +---------------------+
                           +--------+---------+
                                    |
                                    v
                           +------------------+
                           |    bill_items    |
                           +------------------+
                           | bill_id (FK)     |
                           | product_name     |
                           | quantity, total  |
                           +------------------+
```

---

## 💻 Installation & Local Setup Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MySQL Server**: `v8.0` or higher (running locally on port `3306`)

---

### Step 1: Database Setup
1. Start your local MySQL server.
2. Run the included database SQL script to create the schema and seed initial data:
   ```bash
   mysql -u root -p < database/bahikhata.sql
   ```

---

### Step 2: Backend Configuration & Start
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Verify environment settings in `backend/.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=bahikhata
   JWT_SECRET=supersecretjwtkey_bahi_khata_2024
   JWT_EXPIRES_IN=1d
   ```
3. Start the backend development server:
   ```bash
   npm run dev
   ```
   *Backend API will run at `http://localhost:5000`.*

---

### Step 3: Frontend Setup & Start
1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend Application will launch at `http://localhost:3000`.*

---

## 🔑 Pre-Seeded Test Credentials

Use these pre-seeded accounts in MySQL to log in and explore each user role:

| User Role | Phone Number | Email | Password | Access Route |
|---|---|---|---|---|
| 👑 **Super Admin** | `9999999999` | `admin@bahikhata.com` | `password123` | `/admin/dashboard` |
| 🛍️ **Retail Shop** | `8888888888` | `ramesh@grocery.com` | `password123` | `/shop/pos` |
| 🚚 **Delivery Business** | `7777777777` | `suresh@milk.com` | `password123` | `/delivery/dashboard` |
| 🧹 **Service Provider** | `6666666666` | `kamala@maid.com` | `password123` | `/delivery/dashboard` |
| 👤 **Customer** | `5555555555` | `rahul@gmail.com` | `password123` | `/customer/home` |

---

## 📞 Unique Phone Number Auto-Fetch Workflow

To eliminate manual customer selection errors, customer lookup in POS billing operates on **unique phone numbers**:

```
[Shopkeeper Enters Phone Number (e.g. 5555555555)]
                       |
                       v
     [Frontend POS Live Change Listener]
                       |
        +--------------+--------------+
        |                             |
(Phone Found in DB)           (Phone Not Found)
        |                             |
        v                             v
[Display Green Banner]         [Display New Customer Badge]
Customer: Rahul Customer       "Auto-register & Link on Checkout"
Phone: 5555555555              
Udhar Balance: ₹150.00
```

---

## 📄 PDF Invoice & Receipt Generation

Bills generated via POS checkout or Service Bill calculation can be downloaded as PDF files:

1. Request sent to `GET /api/bills/:id/pdf`.
2. Backend validates `bill_id` and queries MySQL for shop info, customer name, phone, invoice metadata, and line items.
3. `PDFKit` builds a formatted PDF document buffer in memory.
4. Streamed back with HTTP headers:
   `Content-Type: application/pdf`
   `Content-Disposition: attachment; filename=Invoice_INV-1723812345.pdf`

---

## 🛡️ Security & Production Hardening

- **JWT Authentication**: Secured with secret key hashing (`HS256`) and expiration token lifecycle.
- **Password Security**: Passwords salt-hashed with `bcrypt` (cost factor 10).
- **SQL Injection Prevention**: All MySQL database queries use prepared parameterized statements (`pool.execute(query, [params])`).
- **Database Transactions**: Multi-step bill generation, stock deduction, and balance updates run inside strict MySQL `connection.beginTransaction()` and `connection.commit()` wrappers with automatic rollback on error.
- **Security Headers & Rate Limiting**: `helmet` guards HTTP response headers and `express-rate-limit` prevents brute-force login attempts.

---

## 🚀 Production Deployment Guide

### Option 1: Docker Compose (Recommended)
Build and spin up backend API, frontend web app, and MySQL 8 database in isolated containers:
```bash
docker-compose up -d --build
```

### Option 2: PM2 & NGINX
1. **Backend**: Build production code and run with **PM2**:
   ```bash
   cd backend
   pm2 start server.js --name "bahi-khata-api"
   ```
2. **Frontend**: Build production static assets with Vite:
   ```bash
   cd frontend
   npm run build
   ```
3. Configure **NGINX** to serve static files from `frontend/dist` and reverse-proxy `/api` traffic to `http://localhost:5000`.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p center align="center">
  <b>Bahi Khata Platform</b> • Designed & Developed for Local Business Digitisation 🇮🇳
</p>
