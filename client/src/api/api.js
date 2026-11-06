import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);

// Products
export const getProducts = () => API.get("/products");
export const getProductById = (id) => API.get(`/products/${id}`);
export const browseProducts = (params) => API.get("/products/browse", { params });
export const getCategories = () => API.get("/products/categories");

// Suppliers (market-wide, used by public Suppliers page)
export const getSuppliers = () => API.get("/suppliers");
export const getSupplierStats = () => API.get("/suppliers/stats");
export const getSuppliersForProduct = (id) =>
  API.get(`/supplier-products/product/${id}`);

// AI
export const compareSuppliers = (productId) =>
  API.get(`/ai/compare-suppliers/${productId}`);
export const explainDelivery = (data) => API.post("/ai/explain-delivery", data);

// Orders (customer)
export const createOrder = (data) => API.post("/orders", data);
export const getMyOrders = () => API.get("/orders/my-orders");

// Orders (seller)
export const getSellerOrders = () => API.get("/orders/seller-orders");
export const getSellerStats = () => API.get("/orders/seller-stats");
export const updateOrderStatus = (orderId, status) =>
  API.patch(`/orders/${orderId}/status`, { status });