# 🚀 ChurnIQ – Full Stack MLOps Telco Churn Prediction System

## 📌 Overview
**ChurnIQ** is an end-to-end **MLOps-powered full-stack application** that predicts customer churn using the Telco dataset.  
It integrates **data versioning, model training, backend APIs, and a frontend interface** to simulate a real-world production ML system.

---

## 🎯 Problem Statement
Customer churn is a major challenge for telecom companies.  
This project aims to:
- Predict whether a customer will churn
- Help businesses take proactive retention actions

---

## 🏗️ Project Architecture
User → Frontend (ChurnIQ UI) → Backend API → ML Model → Prediction Output
↑
DVC Pipeline
↑
Versioned Dataset

---

## ⚙️ Tech Stack

### 🧠 Machine Learning
- Python
- Scikit-learn
- Pandas
- NumPy

### 🔄 MLOps
- DVC (Data Version Control)
- Git & GitHub

### 🌐 Backend
- Node.js / Express

### 🎨 Frontend
- React / Next.js (inside `churniq/`)

---

## 📂 Repository Structure
.
├── churniq/ # Full-stack app (frontend + backend)
├── data/raw/ # Raw dataset (tracked using DVC)
├── docs/ # Architecture & documentation
├── .dvc/ # DVC config files
├── .dvcignore
└── README.md