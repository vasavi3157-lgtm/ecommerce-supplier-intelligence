// Olist prices are in Brazilian Reais (R$). We convert to Indian Rupees (₹)
// using an approximate exchange rate for realistic display.
const BRL_TO_INR_RATE = 17;

export const formatPrice = (brlPrice) => {
  const inr = (Number(brlPrice) || 0) * BRL_TO_INR_RATE;
  return `₹${inr.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

export const riskLevel = (p) =>
  p < 0.3 ? { label: "Low", color: "green", hex: "#22c55e" }
  : p < 0.6 ? { label: "Medium", color: "amber", hex: "#f59e0b" }
  : { label: "High", color: "red", hex: "#ef4444" };

export const scoreColor = (s) =>
  s >= 75 ? "green" : s >= 50 ? "amber" : "red";

export const deliveryDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + Math.ceil(days || 0));
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};