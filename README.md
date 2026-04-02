# 🚀 ChurnIQ – Telco Customer Churn Prediction (MLOps + Full Stack)

## 📌 What is this?
ChurnIQ is an **end-to-end machine learning system** that predicts whether a telecom customer will churn.

It combines:
- 📊 Machine Learning model
- 🔄 MLOps pipeline using DVC
- 🌐 Backend API
- 🎨 Frontend interface

---

## 🎯 Why this project?
Customer churn directly impacts revenue.

This system helps:
- Identify customers likely to leave
- Enable proactive retention strategies

---

## ⚙️ Tech Stack

**Machine Learning**
- Python, Scikit-learn, Pandas, NumPy

**MLOps**
- DVC (Data Version Control)
- Git & GitHub

**Backend**
- Node.js + Express

**Frontend**
- React / Next.js

---

## 🏗️ How it Works


User Input → Frontend → Backend API → ML Model → Prediction
↑
DVC Pipeline
↑
Versioned Dataset


---

## 📂 Project Structure


telco-churn-mlops/
│
├── churniq/ # Full-stack app (frontend + backend)
├── data/raw/ # Dataset (tracked using DVC)
├── docs/ # Architecture docs
├── .dvc/ # DVC config
├── .dvcignore
└── README.md


---

## 🚀 How to Run

### 1. Clone the repo
```bash
git clone https://github.com/AasthaKapoor27/telco-churn-mlops.git
cd telco-churn-mlops
2. Pull dataset using DVC
dvc pull
3. Run backend
cd churniq/backend
npm install
npm start
4. Run frontend
cd churniq/frontend
npm install
npm run dev