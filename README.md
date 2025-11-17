🛍️ RetailIQ — AI-Powered Retail Platform
(Currently In Active Development)

RetailIQ is an AI-driven retail management system built to streamline seller operations — from authentication to cart management — and soon full dashboards, analytics, and order flows.
This project uses a Next.js frontend and a Node.js + Firebase backend, organized in a clean monorepo structure.

🚀 Current Progress
Frontend

✔️ Home Page

✔️ Login Page

✔️ Signup Page

✔️ Cart Page (QR flow base)

✔️ Auth routing + basic state

Backend

✔️ Firebase Admin configuration

✔️ Login / Signup APIs

✔️ Cart APIs

✔️ QR scanning API base

📁 Project Structure
RetailIQ/
│── retailiqfrontend/        # Next.js 14 frontend
│── retailiqbackend/         # Node.js backend
│── assets/                  # App screenshots
│── .gitignore
│── README.md

🖼️ Screenshots
🏠 Home Page
<img src="./assets/Home.jpg" width="700"/>
🔐 Login Page
<img src="./assets/login.jpg" width="700"/>
🆕 Signup Page
<img src="./assets/signup.jpg" width="700"/>
📊 Dashboard Page
<img src="./assets/dashboard.jpg" width="700"/>
🚧 In Progress

Seller Dashboard

Product Listing / Inventory Flow

Advanced Analytics

Final QR → Cart → Order journey

Deployment

🛠️ Local Setup
1️⃣ Clone the repo
git clone https://github.com/RohitKamble171012/RetailIQ.git
cd RetailIQ

2️⃣ Start the frontend
cd retailiqfrontend
npm install
npm run dev

3️⃣ Start the backend
cd retailiqbackend
npm install
npm start

🔧 Tech Stack
Frontend

Next.js 14

React

TailwindCSS

ShadCN UI

Backend

Node.js

Express

Firebase Admin SDK

Firestore

📌 Upcoming Features

Full Seller Dashboard

Role-based Access (Admin/Seller)

Order History + Customer Tracking

Payments Integration

Deployment

Frontend → Vercel

Backend → Firebase/Render
