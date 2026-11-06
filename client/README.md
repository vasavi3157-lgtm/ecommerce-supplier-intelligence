# Explainable AI-Based E-Commerce Supply Chain and Supplier Intelligence System

## 📌 Project Overview

The **Explainable AI-Based E-Commerce Supply Chain and Supplier Intelligence System** is a web-based application designed to improve customer trust in online shopping by providing supplier reliability insights and delivery risk predictions.

The system helps customers understand supplier performance before placing an order. It uses AI-based predictions and explainable insights to make supplier reliability and delivery risk easier to understand.

## 🎯 Objectives

- Improve customer confidence in online shopping.
- Evaluate supplier reliability using historical data.
- Predict potential delivery delays.
- Provide understandable explanations for AI predictions.
- Support informed purchasing decisions.

## ✨ Key Features

### 1. User Authentication
- Customer registration and login.
- Secure authentication.
- Protected application routes.

### 2. Product Browsing
- Browse available products.
- Explore product categories.
- View detailed product information.

### 3. Supplier Intelligence
- Supplier Trust Score.
- On-time delivery percentage.
- Average delivery performance.
- Supplier reliability insights.

### 4. Delivery Risk Prediction
- AI-based delivery risk prediction.
- Identify potential delivery delays.
- Display expected delivery information.

### 5. Explainable AI
- SHAP-based feature explanations.
- Understand factors influencing predictions.
- Display reasons behind delivery risk assessments.

### 6. Shopping Cart and Orders
- Add products to cart.
- Manage cart items.
- Place customer orders.

## 🛠️ Technologies Used

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Programming | JavaScript, Python |
| Machine Learning | Scikit-learn |
| Explainable AI | SHAP |
| Data Processing | Pandas, NumPy |
| Dataset | Brazilian E-Commerce Public Dataset by Olist |
| Version Control | Git, GitHub |

## 🏗️ Project Structure

```text
ecommerce-supplier-intelligence/
│
├── ai/
│   ├── data/
│   └── models/
│
├── client/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       └── utils/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   └── services/
│
└── README.md
```

## 📊 Dataset

This project uses the **Brazilian E-Commerce Public Dataset by Olist**.

The dataset contains historical e-commerce information, including:
- Orders and order items.
- Products and product categories.
- Sellers and customers.
- Payments and reviews.
- Delivery and geolocation information.

The dataset is used to derive supplier intelligence and support delivery risk analysis.

## ⚙️ Installation and Setup

### Prerequisites
- Node.js
- MongoDB
- Python
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/vasavi3157-lgtm/ecommerce-supplier-intelligence.git
```

### 2. Navigate to the Project

```bash
cd ecommerce-supplier-intelligence
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

Configure your environment variables in a local `.env` file.

### 4. Install Frontend Dependencies

```bash
cd ../client
npm install
```

### 5. Run the Application

Use the development scripts configured in the respective `package.json` files to start the frontend and backend.

**Note:** Large trained ML model files are not included in the GitHub repository. They need to be available locally for the corresponding prediction functionality.

## 🚀 Project Outcome

The system combines e-commerce functionality, supplier intelligence, delivery risk prediction, and Explainable AI to provide customers with better insights before making purchasing decisions.

## 👩‍💻 Developed By

**Team Project – Final Year B.Tech**

Vignan's Nirula Institute of Technology and Science for Women, Guntur.

## 📄 License

This project was developed for academic purposes.
