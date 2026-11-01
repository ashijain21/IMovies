# 🎬 IMovies – Full-Stack Cinema Management & Online Movie Ticket Booking Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-red.svg)](https://reactjs.org/)
[![Socket.IO](https://img.shields.io/badge/Real--Time-Socket.IO-black.svg)](https://socket.io/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/MongoDB-Mongoose%20ODM-brightgreen.svg)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-46%2F46%20Passing-success.svg)](server/tests)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**IMovies** is a comprehensive, production-grade cinema management and online movie ticket reservation platform built with modern web architecture (MongoDB, Express.js, React.js with Vite, Node.js, and Socket.IO). The application delivers a high-end cinematic user experience inspired by modern streaming and cinema platforms, featuring real-time seat locking, dynamic pricing, digital tickets with QR verification, payment gateway integration, and a full administrative suite.

---

## 🌟 Key Features

### 🍿 Customer-Facing Experience
- **Cinematic Homepage**: Dynamic hero billboard for blockbuster premieres with backdrop imagery, rating badges, YouTube trailer playback modals, and "Book Tickets" calls to action.
- **Movie Catalog & Advanced Discovery**:
  - Filter by Genre (Action, Sci-Fi, Adventure, Drama, Animation, Thriller, etc.).
  - Filter by Language (English, Hindi, etc.) and Status (Now Showing / Upcoming).
  - Sort by Top Rated, Newest Release Date, and Title (A-Z).
  - Fast debounced title, cast, and director searching.
- **Detailed Movie Pages**: Synopsis, director, starring cast chips, runtime, certification (U, UA, A), date picker tabs (Today, Tomorrow, and upcoming dates), and grouped theatre showtimes with technology format badges (IMAX 3D, Dolby Atmos, 4DX).
- **Interactive Cinema Seat Selection**:
  - Visual curved screen indicator (*"All Eyes This Way"*).
  - Tiered seating categories: **VIP Recliner**, **Gold**, and **Silver**.
  - Dynamic visual statuses: Available, Selected, Locked, and Sold.
  - Dynamic pricing calculation based on seat category multipliers.
- **Real-Time Seat Locking (Socket.IO)**:
  - Atomic temporary 5-minute seat locks to prevent double-booking and race conditions.
  - Live broadcast of seat status to all users viewing the same auditorium in real time.
  - Automatic expiration daemon freeing abandoned holds.
- **Checkout & Multi-Channel Payments**:
  - Order summary breakdown: Subtotal, Integrated GST (18%), Convenience Fee, and promotional coupon discounts (e.g., code `IMOVIES50` for 20% off).
  - Payment simulation modal supporting Credit/Debit Cards, UPI (GPay, PhonePe, Paytm), Net Banking, and Instant Mock Sandbox mode.
  - Server-side signature and atomic confirmation check.
- **Digital Tickets with QR Verification**:
  - Unique booking ID generation (`IMV-YYYYMMDD-XXXX`).
  - High-resolution QR code data payload for scanner gate admission.
  - Print-ready and downloadable digital ticket layout.
- **User Dashboard & Booking History**:
  - Active tickets, past bookings, and cancellation history.
  - Cancellation workflow with automated refund calculations (80% refundable).
  - Real-time notification center for booking updates and announcements.

### 🛡️ Admin Management & Analytics Suite
- **Role-Based Security**: Complete route protection isolating administrative features from standard users.
- **Overview Metrics**: KPI analytics cards tracking total gross revenue, active movies, customer bookings, theatre auditoriums, and today's tickets.
- **Movie Management**: Complete CRUD operations, poster/backdrop CDN uploads, YouTube trailer URLs, duration, and status toggle.
- **Theatre & Screen Architecture**: Manage multiplex locations across metropolitan cities, auditorium types (IMAX with Laser, Dolby Atmos, 4DX), and seat layout configs.
- **Conflict-Free Show Scheduling**: Schedule movie showtimes on auditoriums with validation preventing overlapping time slots.
- **Customer Bookings Ledger**: Filter by status, search by booking ID, view seat assignments, and track payment transactions.
- **User Administration**: Search user accounts and elevate/demote administrative privileges.
- **Analytics & Revenue Reports**:
  - 7-day revenue trend velocity charts.
  - Top-grossing blockbuster movie rankings.
  - Cinema multiplex attendance breakdown.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM v6, Axios, Socket.IO Client, Lucide React, Canvas Confetti |
| **Backend** | Node.js, Express.js (ES Modules), Socket.IO, Helmet, CORS, Cookie-Parser, Express Rate Limit |
| **Database & ODM**| MongoDB, Mongoose ODM, MongoMemoryServer (Zero-config instant local fallback) |
| **Authentication** | JWT (Access Tokens + Refresh Tokens in HTTP-only cookies), BcryptJS password hashing |
| **Validation** | Zod Schema Validation |
| **Digital Tickets**| QRCode (QR Code generation for ticket gates) |
| **Testing** | Node.js Test Runner (`node:test`), Supertest |

---

## 📁 Project Architecture

```
IMovies/
├── client/                      # React + Vite Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/           # Admin Sidebar, StatsCard
│   │   │   ├── checkout/        # PaymentModal & Gateway Simulator
│   │   │   ├── common/          # Navbar, Footer, MovieCard, TrailerModal, Loader, CityModal
│   │   │   └── seat/            # SeatGrid, SeatLegend, SeatSummary
│   │   ├── context/             # AuthContext, CityContext, SocketContext
│   │   ├── layouts/             # MainLayout, AdminLayout
│   │   ├── pages/               # HomePage, MoviesPage, MovieDetailsPage, SeatSelectionPage,
│   │   │   │                    # CheckoutPage, BookingConfirmationPage, UserDashboardPage,
│   │   │   │                    # LoginPage, RegisterPage, ForgotPasswordPage
│   │   │   └── admin/           # AdminDashboard, AdminMovies, AdminTheatres, AdminShows,
│   │   │                        # AdminBookings, AdminUsers, AdminAnalytics
│   │   ├── routes/              # AppRoutes, ProtectedRoute, AdminRoute
│   │   ├── services/            # api.js, authService, movieService, theatreService,
│   │   │                        # showService, bookingService, adminService
│   │   ├── styles/              # index.css (Dark Cinema UI Design System)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                      # Express.js REST API & Real-Time Engine
│   ├── config/                  # Database connection (connectDB with memory fallback)
│   ├── controllers/             # Auth, Movies, Theatres, Shows, Bookings, Payments, Admin, Notifications
│   ├── middleware/              # JWT Auth, Role Authorize, ErrorHandler, Rate Limiting
│   ├── models/                  # User, Movie, Theatre, Screen, Show, Booking, Payment, Notification, SeatLock
│   ├── routes/                  # Express API route modules
│   ├── sockets/                 # Socket.IO Real-Time Seat Engine & Lock Expiration Daemon
│   ├── tests/                   # Automated API integration tests (Supertest + node:test)
│   │   ├── api.test.js          # Core lifecycle suite (13 tests)
│   │   └── comprehensive_audit.test.js # Deep audit & concurrency conflict suite (33 tests)
│   ├── utils/                   # seed.js (Demo catalog & seed accounts), qrHelper.js, jwt.js
│   ├── validators/              # Zod validation schemas
│   ├── .env.example             # Example environment variables template
│   ├── app.js                   # Express application setup, middlewares, static frontend serving
│   ├── package.json
│   └── server.js                # HTTP server boot & Socket.IO listener
├── .env.example                 # Root environment template
├── .gitignore                   # Comprehensive Git exclusion rules
├── package.json                 # Monorepo root scripts
└── README.md
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- *(Optional)* Local MongoDB instance running on `mongodb://localhost:27017` or a MongoDB Atlas cluster URI.

### 2. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/imovies.git
cd IMovies

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### 3. Environment Configuration

Create `server/.env` by copying from the template `server/.env.example`:

```bash
cp server/.env.example server/.env
```

Environment variable specifications:

```env
PORT=5000
NODE_ENV=development

# Database Mode:
# Set USE_MEMORY_DB=true for instant local development (uses ephemeral in-memory MongoDB)
# Set USE_MEMORY_DB=false and provide MONGODB_URI for persistent production database
USE_MEMORY_DB=true
MONGODB_URI=mongodb://localhost:27017/imovies

# Authentication (Provide secure 256-bit keys for production)
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here
REFRESH_TOKEN_EXPIRE=30d

# Frontend Origin (CORS)
CLIENT_URL=http://localhost:5173

# Payment Gateway Configuration
# Set MOCK_PAYMENT_ENABLED=true for mock testing without real credentials
# Set MOCK_PAYMENT_ENABLED=false and provide live credentials for real transactions
MOCK_PAYMENT_ENABLED=true
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

---

## 🗄️ Database: Ephemeral Memory Server vs Persistent Production

> [!WARNING]
> **Important Database Persistence Notice**:
> When `USE_MEMORY_DB=true` is set, the server runs an embedded `MongoMemoryServer`. This in-memory instance is **ephemeral**: all collections, movies, shows, and user bookings reside strictly in RAM and are discarded whenever the server stops or restarts.
> 
> **For Persistent Production Deployments:**
> 1. Set `USE_MEMORY_DB=false` in `server/.env`.
> 2. Set `MONGODB_URI` to a real MongoDB standalone instance or MongoDB Atlas replica set URI:
>    ```env
>    MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/imovies?retryWrites=true&w=majority
>    ```
> 3. Run the seeder once to initialize the permanent catalog: `npm run seed`.

---

## 💳 Payment Gateway: Mock Mode vs Live Razorpay Integration

The application supports dual payment modes configured via `MOCK_PAYMENT_ENABLED`:

### 1. Mock Payment Mode (`MOCK_PAYMENT_ENABLED=true`)
- Designed for rapid development, automated testing, continuous integration, and demo reviews.
- Allows checkout completion without requiring Razorpay merchant verification or test API keys.
- Supports card, UPI, net banking, and one-click instant sandbox simulation.
- Generates simulated cryptographic transaction IDs (`mock_pay_...`) and verifies payments through backend validation logic.

### 2. Live Razorpay Payment Gateway (`MOCK_PAYMENT_ENABLED=false`)
- Designed for production deployments and real transaction processing.
- Utilizes the official **Razorpay Orders API** to create secure server-side orders.
- Client opens the Razorpay Standard Checkout modal using `RAZORPAY_KEY_ID`.
- Upon successful customer payment, the backend validates the Razorpay cryptographic signature:
  $$\text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{RAZORPAY\_KEY\_SECRET})$$
- Only verified signatures result in confirmed bookings and issued QR tickets.

---

## 🔑 Development Demo Credentials

> [!NOTE]
> **Development Use Only**: The following demo accounts are seeded automatically for local evaluation and testing. **Do not use these credentials in a live production deployment.**

| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator (Dev Demo)** | `admin@imovies.com` | `Admin@12345` | Full administrative control: Movie CRUD, Auditorium scheduling, Booking ledger, User management, Analytics |
| **Customer User (Dev Demo)** | `user@imovies.com` | `User@12345` | Customer ticket reservation, Seat locking, Checkout, Ticket viewing, Booking cancellation |

*(Quick-fill buttons for both Demo User and Demo Admin are conveniently provided right on the `/login` screen for rapid pair-testing).*

---

## 🚀 Running the Application

### Development Mode (Dual Process)

```bash
# Terminal 1: Start Backend API & WebSocket Server (Port 5000)
cd server
npm run dev   # or npm start

# Terminal 2: Start Frontend Vite Dev Server (Port 5173)
cd client
npm run dev
```

Open **`http://localhost:5173`** in your browser.

### Unified Production Mode (Single Process)

In production, the backend serves both the compiled React SPA and all REST/Socket.IO APIs from a single unified server instance:

```bash
# Step 1: Build the client production bundle
cd client
npm run build

# Step 2: Start the production server
cd ../server
npm start
```

Open **`http://localhost:5000`** in your browser. The Express server automatically serves `client/dist/` for all frontend routes while handling `/api/*` and `/socket.io/*`.

---

## 🧪 Running Automated Tests

The application includes an automated test suite comprising **46 tests across 2 suites**:

```bash
cd server
npm test
```

### Test Suite Coverage:
- **`tests/api.test.js` (13 tests)**:
  - System health check endpoint
  - User and Administrator authentication
  - Movie catalog discovery & pagination
  - Multiplex and auditorium listings
  - Show scheduling & seat availability queries
  - Atomic seat locking and hold creation
  - Booking confirmation & QR ticket generation
  - User booking history retrieval
  - Ticket cancellation & refund calculation (80% refundable)
  - Admin KPI metrics & business intelligence analytics
- **`tests/comprehensive_audit.test.js` (33 tests)**:
  - SPA static fallback serving verification
  - User registration & duplicate email rejection
  - Password recovery flow & invalid credential rejection
  - Token refresh rotation & authenticated profile retrieval
  - Movie filtering by genre/language, search debouncing, and featured carousels
  - Multi-tier seat pricing calculation and coupon discount verification (`IMOVIES50`)
  - **Concurrency Conflict Testing**: Proves that when two customers attempt to hold or book the same seat simultaneously, only one succeeds and the second is rejected with `409 Conflict`.
  - Non-admin authorization enforcement (`403 Forbidden`)
  - Admin CRUD operations: Movie creation, conflict-free show scheduling, booking ledger audit, and user role updates
  - Notification center acknowledgment

```
# tests 46
# suites 2
# pass 46
# fail 0
```

---

## 🔌 Socket.IO Real-Time Architecture

The real-time seat synchronization engine prevents race conditions when multiple customers select seats for the same showtime simultaneously:

1. **Show Room Subscriptions**: Clients viewing a show join a dedicated room `show_{showId}` via `join_show_room`.
2. **5-Minute Temporary Locks**: When a user clicks an available seat, the backend issues an atomic hold for 5 minutes (`SeatLock` collection with TTL index).
3. **Instant Broadcast**: The backend broadcasts `seats_locked` containing seat numbers and expiration timestamps to all clients in the room.
4. **Collision Prevention**: If another client attempts to lock or purchase held seats, the backend returns HTTP 409 Conflict.
5. **Auto-Expiration Pruning Daemon**: An interval timer audits and clears expired holds, broadcasting `seats_expired` so the seats immediately become selectable for other users without requiring a page refresh.
6. **Confirmation / Release**: Upon successful payment, `seats_booked` updates the seats to booked permanently; if the user leaves or removes seats, `seats_released` restores availability.

---

## 🛡️ Security & Best Practices

- **Zero Hardcoded Secrets**: All configuration values are loaded dynamically via environment variables.
- **Password Hashing**: Salted hashing with `bcryptjs` (cost factor 10).
- **JWT Authorization**: Short-lived signed access tokens combined with secure refresh token rotation.
- **HTTP Security**: `helmet` security headers and strict CORS origin validation.
- **Rate Limiting**: `express-rate-limit` prevents brute-force login and API abuse.
- **Request Validation**: Incoming payloads strictly validated via `zod` schemas.
- **Payment Verification**: Cryptographic HMAC-SHA256 signature verification prevents unauthorized booking completions.

---

## 📄 License
This project is licensed under the MIT License.
