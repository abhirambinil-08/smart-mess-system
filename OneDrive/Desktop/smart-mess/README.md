# 🍽️ Smart Mess Feedback System

> A QR-based web feedback platform for hostel mess services — built for IILM University, Gurugram.

---

## 👨‍💻 Team Members

| Name | Role |
|------|------|
| Abhiram Binil | Full Stack Developer & Project Lead |
| Suyash Rawat | Frontend Developer |
| Mayank Bisht | Backend Developer |
| Lakshay | Testing & Documentation |

---

## 📌 Project Overview

The **Smart Mess Feedback System** allows students to submit real-time feedback about their hostel mess through a QR code scan — no login required. Mess administrators can view analytics, manage mess locations, and get AI-driven hygiene insights from a secure dashboard.

---

## 🚀 Features

- **QR Code Feedback** — Students scan a QR code and instantly submit feedback
- **Star Rating System** — Ratings for Food Quality, Taste, Hygiene, and Portion Size
- **JWT Authentication** — Secure admin login with role-based access control
- **Role-Based Access** — Admin (full access) and Viewer (read-only) roles
- **Analytics Dashboard** — Charts and mess rankings using Chart.js
- **AI Hygiene Insights** — AI-driven analysis of hygiene scores per mess
- **Spam/Duplicate Filter** — Confidence scoring to prevent fake submissions
- **Online Users Tracker** — Admin can see who is currently active

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| Database | MongoDB |
| Auth | JWT (JSON Web Tokens) |
| Charts | Chart.js |
| QR Code | Python QR library |
| Styling | Custom CSS |

---

## 📁 Project Structure

```
smart-mess/
├── backend/
│   ├── core/
│   │   ├── database.py        # MongoDB connection
│   │   └── security.py        # JWT auth & password hashing
│   ├── models/
│   │   └── schemas.py         # Pydantic data models
│   ├── routes/
│   │   ├── auth.py            # Login, setup, online users
│   │   ├── dashboard.py       # Analytics API
│   │   ├── feedback.py        # Feedback submission
│   │   ├── mess_config.py     # Mess CRUD
│   │   ├── ai_insights.py     # AI hygiene analysis
│   │   └── qr_code.py         # QR code generation
│   ├── services/
│   │   ├── ai_insights.py     # Hygiene analysis logic
│   │   └── validator.py       # Confidence & duplicate check
│   ├── main.py                # FastAPI app entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx
│   │   │   └── StarRating.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── FeedbackPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── MessPage.jsx
│   │   │   └── InsightsPage.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:
```env
MONGODB_URL=mongodb://localhost:27017
DB_NAME=smart_mess
JWT_SECRET=your_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=24
```

Run the backend:
```bash
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 URLs

### Frontend
| Page | URL |
|------|-----|
| Feedback Form (Public) | `http://localhost:5173/` |
| Admin Login | `http://localhost:5173/admin/login` |
| Dashboard | `http://localhost:5173/admin/dashboard` |
| Mess Config | `http://localhost:5173/admin/mess` |
| AI Insights | `http://localhost:5173/admin/insights` |

### Backend API
| Endpoint | URL |
|----------|-----|
| Swagger Docs | `http://127.0.0.1:8000/docs` |
| Login | `http://127.0.0.1:8000/api/auth/login` |
| Dashboard Data | `http://127.0.0.1:8000/api/dashboard` |
| Submit Feedback | `http://127.0.0.1:8000/api/feedback` |
| Mess Config | `http://127.0.0.1:8000/api/mess` |
| AI Insights | `http://127.0.0.1:8000/api/insights` |
| QR Code | `http://127.0.0.1:8000/api/qr/{mess_name}` |
| Online Users | `http://127.0.0.1:8000/api/auth/online-users` |

---

## 🔐 User Roles

| Role | Dashboard | Feedback View | Mess Config | AI Insights | Online Users |
|------|-----------|--------------|-------------|-------------|--------------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Viewer | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 📊 How It Works

1. Admin creates a mess location and generates a QR code
2. QR code is placed at the mess entrance
3. Students scan the QR → fill the feedback form (no login needed)
4. System checks for duplicates and spam using confidence scoring
5. Valid feedback is stored in MongoDB
6. Admin views real-time analytics on the dashboard
7. AI insights highlight hygiene issues per mess

---

## 📄 API Documentation

Full interactive API documentation available at:
```
http://127.0.0.1:8000/docs
```

---

## 🏫 Institution

**IILM University, Gurugram**
B.Tech CSE (AI & ML) — 2nd Semester
Innovation & Entrepreneurship Project — 2025-26

---

## 📜 License

This project is developed for academic purposes at IILM University.
