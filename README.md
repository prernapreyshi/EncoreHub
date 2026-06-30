#  EncoreHub – Event Ticket Booking Platform

EncoreHub is a full-stack event ticket booking application inspired by BookMyShow. Users can browse events, select seats, make bookings, and manage their profiles.

---

##  Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js

### Database
- MongoDB + Mongoose

### Authentication
- JWT Authentication
- Google OAuth

### Payment Gateway
- Razorpay

### Additional Features
- QR Code Generation
- Password Reset via Email

---

##  Prerequisites

Before running the project, make sure you have:

- Node.js (v18 or above)
- MongoDB Atlas or Local MongoDB
- npm

---

##  Installation

### Clone the Repository

```bash
git clone <your-repository-url>
cd EncoreHub
```

### Install Backend Dependencies

```bash
cd backend
npm install
```

### Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

##  Environment Variables

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000

# Razorpay (Optional)
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

##  Run the Application

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd frontend
npm start
```

Open:

```
http://localhost:3000
```

---

## Features

- User Authentication (JWT + Google Login)
- Browse Events
- Seat Selection
- Ticket Booking
- Razorpay Payment Integration
- Booking History
- Admin Dashboard
- QR Code Tickets
- Password Reset
- Responsive Design

---

##  Demo Accounts

### Demo User
- Browse events
- Book tickets
- View booking history

### Demo Admin
- Manage events
- View bookings
- Access dashboard

---

##  Project Structure

```
EncoreHub/
├── frontend/
├── backend/
├── README.md
```

