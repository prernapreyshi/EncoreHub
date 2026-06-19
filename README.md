# 🎟️ EncoreHub — Event Ticket Booking Platform

A full-stack, production-ready event ticket booking platform inspired by BookMyShow. Built with React, Node.js, MongoDB, and Razorpay.

---

## 🚀 Tech Stack

| Layer      | Tech                                                   |
|------------|--------------------------------------------------------|
| Frontend   | React 18, Tailwind CSS, React Router DOM, Axios        |
| Backend    | Node.js, Express.js                                   |
| Database   | MongoDB + Mongoose                                    |
| Auth       | JWT + Google OAuth                                    |
| Payments   | Razorpay (with demo mode when keys absent)            |
| QR Codes   | qrcode.react                                          |

---

## 📁 Project Structure

```
encorehub/
├── frontend/                    # React App
│   └── src/
│       ├── components/
│       │   ├── common/          # Navbar, Footer, HeroBanner, PageLoader
│       │   ├── events/          # EventCard
│       │   └── admin/           # AdminLayout, AdminSidebar
│       ├── pages/
│       │   ├── Home.js
│       │   ├── Events.js
│       │   ├── EventDetails.js
│       │   ├── SeatSelection.js
│       │   ├── Checkout.js
│       │   ├── BookingConfirmation.js
│       │   ├── Login.js
│       │   ├── Signup.js
│       │   ├── ForgotPassword.js
│       │   ├── ResetPassword.js
│       │   ├── Profile.js
│       │   ├── MyBookings.js
│       │   ├── Wishlist.js
│       │   └── admin/
│       │       ├── AdminOverview.js
│       │       ├── AdminEvents.js
│       │       ├── AdminUsers.js
│       │       ├── AdminBookings.js
│       │       ├── AdminAnalytics.js
│       │       └── EventForm.js
│       ├── context/
│       │   └── AuthContext.js
│       └── services/
│           └── api.js
│
└── backend/                     # Express API
    ├── config/db.js
    ├── controllers/
    │   ├── authController.js
    │   ├── eventController.js
    │   ├── bookingController.js
    │   ├── paymentController.js
    │   └── userController.js
    ├── middleware/auth.js
    ├── models/
    │   ├── User.js
    │   ├── Event.js
    │   └── Booking.js
    ├── routes/
    │   ├── auth.js
    │   ├── events.js
    │   ├── bookings.js
    │   ├── payments.js
    │   └── users.js
    ├── utils/seed.js
    └── server.js
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/encorehub
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:3000

# Optional — leave as-is for demo mode (no real payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Optional — for password reset emails
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- **Admin**: `admin@encorehub.com` / `admin123`
- **User**: `user@encorehub.com` / `user123`
- 8 sample events across all categories

### 4. Run the App

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm start
```

Open **http://localhost:3000** 🎉

---

## 🔑 Demo Login (No Setup Needed)

The login page has quick-fill buttons for:
- **👤 Demo User** → browses events, books tickets
- **⚙️ Demo Admin** → full dashboard access

---

## 📸 Pages & Features

### User Side
| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero carousel, featured/trending events, categories |
| Events | `/events` | Browse, filter & search all events |
| Event Details | `/events/:id` | Full event info, pricing, book button |
| Seat Selection | `/events/:id/seats` | Interactive seat grid, real-time availability |
| Checkout | `/checkout` | Order summary + Razorpay payment |
| Booking Confirmation | `/booking-confirmation/:id` | E-ticket with QR code, download |
| My Bookings | `/my-bookings` | All bookings with cancel & refund |
| Wishlist | `/wishlist` | Saved favorite events |
| Profile | `/profile` | Edit name, phone, avatar |

### Admin Side (`/admin`)
| Page | Description |
|------|-------------|
| Overview | Stats, recent bookings, top events |
| Events | CRUD table with featured/trending toggles |
| Add / Edit Event | Full event form with image preview |
| Bookings | All bookings with CSV export |
| Users | Manage roles, delete users |
| Analytics | Revenue charts, category donut, booking trends |

---

## 💳 Payment Flow

**With Razorpay keys:** Full live/test payment via Razorpay checkout modal.

**Without keys (Demo mode):** Payment is simulated — a 1.5s delay and then the booking is created automatically. No real charges.

---

## 🌐 API Reference

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
POST /api/auth/forgot-password
PUT  /api/auth/reset-password/:token
GET  /api/auth/me
```

### Events
```
GET    /api/events              ?search, category, city, date, minPrice, maxPrice, page, limit
GET    /api/events/:id
GET    /api/events/:id/seats
POST   /api/events              [admin]
PUT    /api/events/:id          [admin]
DELETE /api/events/:id          [admin]
GET    /api/events/analytics    [admin]
```

### Bookings
```
POST /api/bookings
GET  /api/bookings/my
GET  /api/bookings/all          [admin]
GET  /api/bookings/:id
PUT  /api/bookings/:id/cancel
```

### Payments
```
POST /api/payments/create-order
POST /api/payments/verify
```

### Users
```
GET  /api/users/profile
PUT  /api/users/profile
PUT  /api/users/favorites/:eventId
GET  /api/users/all             [admin]
PUT  /api/users/:id/role        [admin]
DELETE /api/users/:id           [admin]
```

---

## 🎨 UI Highlights

- **Dark theme** — Black/Red/White palette throughout
- **Responsive** — Mobile-first, works on all screen sizes
- **Skeleton loading** — Shimmer placeholders on every page
- **Toast notifications** — Success/error feedback on all actions
- **Smooth transitions** — Fade-in, slide-up CSS animations
- **Interactive seat map** — Color-coded by type (Standard/Premium/VIP)
- **E-ticket QR code** — Scannable at entry
- **Admin CSV export** — One-click booking data download

---

## 🚢 Deployment

### Backend (Railway / Render / Heroku)
1. Set all `.env` variables in the platform's environment settings
2. Set `MONGODB_URI` to your MongoDB Atlas connection string
3. Deploy the `backend/` folder

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL=https://your-backend-url.com/api`
2. Deploy the `frontend/` folder
3. Set build command: `npm run build`, publish dir: `build`

---

## 📝 License

MIT © EncoreHub 2024
