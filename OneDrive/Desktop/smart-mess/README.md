# 🍱 Smart Food Mess Feedback System

A full-stack QR-based feedback platform for institutional mess management.

---

## 📁 Project Structure

```
smart-mess/
├── backend/               ← FastAPI Python backend
│   ├── main.py            ← Entry point
│   ├── requirements.txt   ← Python packages
│   ├── .env               ← Config (MongoDB URL, JWT secret)
│   ├── core/
│   │   ├── database.py    ← MongoDB connection
│   │   └── security.py    ← JWT + bcrypt
│   ├── models/
│   │   └── schemas.py     ← All request/response shapes
│   ├── routes/
│   │   ├── feedback.py    ← POST /api/feedback
│   │   ├── auth.py        ← POST /api/auth/login
│   │   ├── mess_config.py ← GET/POST /api/mess
│   │   ├── dashboard.py   ← GET /api/dashboard
│   │   ├── ai_insights.py ← GET /api/insights
│   │   └── qr_code.py     ← GET /api/qr/{mess_name}
│   └── services/
│       ├── validator.py   ← Confidence score + duplicate check
│       └── ai_insights.py ← Hygiene analysis logic
│
└── frontend/              ← React + Vite frontend
    ├── src/
    │   ├── main.jsx        ← React entry point
    │   ├── App.jsx         ← Router setup
    │   ├── index.css       ← Global styles
    │   ├── context/
    │   │   └── AuthContext.jsx  ← Global login state
    │   ├── utils/
    │   │   └── api.js      ← All API calls in one file
    │   ├── components/
    │   │   ├── AdminLayout.jsx  ← Sidebar + nav
    │   │   └── StarRating.jsx   ← Star rating component
    │   └── pages/
    │       ├── FeedbackPage.jsx  ← Student QR form (public)
    │       ├── LoginPage.jsx     ← Admin login
    │       ├── DashboardPage.jsx ← Charts + analytics
    │       ├── MessPage.jsx      ← Mess config + QR download
    │       └── InsightsPage.jsx  ← AI hygiene insights
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Setup & Run

### Step 1 — Start MongoDB
Make sure MongoDB is running locally on port 27017.
You can use MongoDB Compass to check.

### Step 2 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

Backend runs at: http://localhost:8000
API docs at:     http://localhost:8000/docs

### Step 3 — Create First Admin Account

Open Postman or any API tool and send:

```
POST http://localhost:8000/api/auth/setup
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "yourpassword"
}
```

### Step 4 — Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🔗 Pages

| URL                         | Who sees it  | What it does               |
|-----------------------------|-------------|----------------------------|
| http://localhost:5173/      | Students     | QR feedback form           |
| http://localhost:5173/?mess=MessName | Students | Form with auto-filled mess |
| http://localhost:5173/admin/login    | Admin    | Login page                 |
| http://localhost:5173/admin/dashboard | Admin   | Charts + analytics         |
| http://localhost:5173/admin/mess     | Admin    | Create mess + QR download  |
| http://localhost:5173/admin/insights | Admin    | AI hygiene insights        |

---

## ✅ Features

- 📱 QR code per mess — student scans → feedback form opens
- 🔒 Spam detection — confidence scoring (flags fast/bot submissions)
- 🔁 Duplicate prevention — one feedback per meal per device per day
- 📊 Admin dashboard — bar charts, rankings, recent feedback
- 🤖 AI hygiene insights — auto recommendations per mess
- 🔐 JWT authentication — secure admin panel
- 📥 QR download — PNG download for printing

---

## 🛠️ Tech Stack

| Layer     | Technology                  |
|-----------|-----------------------------|
| Frontend  | React 18 + Vite             |
| Routing   | React Router v6             |
| Charts    | Chart.js + react-chartjs-2  |
| Backend   | FastAPI (Python)            |
| Database  | MongoDB + Motor (async)     |
| Auth      | JWT + bcrypt                |
| QR        | qrcode[pil]                 |
