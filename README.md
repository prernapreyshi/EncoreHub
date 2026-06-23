# EncoreHub — Event Ticket Booking Platform

A full-stack, production-ready event ticket booking platform inspired by BookMyShow. Built with React, Node.js, MongoDB, and Razorpay.

---

##  Tech Stack

| Layer      | Tech                                                   |
|------------|--------------------------------------------------------|
| Frontend   | React 18, Tailwind CSS, React Router DOM, Axios        |
| Backend    | Node.js, Express.js                                   |
| Database   | MongoDB + Mongoose                                    |
| Auth       | JWT + Google OAuth                                    |
| Payments   | Razorpay (with demo mode when keys absent)            |
| QR Codes   | qrcode.react                                          |

---

## Quick Start

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



### 4. Run the App

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm start
```

Open **http://localhost:3000** 

---

##  Demo Login (No Setup Needed)

The login page has quick-fill buttons for:
- ** Demo User** → browses events, books tickets
- ** Demo Admin** → full dashboard access
