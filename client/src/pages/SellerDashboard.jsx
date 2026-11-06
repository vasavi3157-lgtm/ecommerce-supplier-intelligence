import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSellerStats, getSellerOrders } from "../api/api";
import { formatPrice } from "../utils/helpers";

const RISK_STYLES = {
  Low: "bg-emerald-50 text-emerald-700",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-red-50 text-red-700",
};

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  shipped: "bg-violet-50 text-violet-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getSellerStats()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load seller stats"));

    getSellerOrders()
      .then((res) => setOrders(res.data.orders.slice(0, 5)))
      .catch(() => {});
  }, []);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return <div className="max-w-6xl mx-auto px-6 py-10 text-stone-400">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-900">Welcome back, {stats.sellerName}</h1>
      <p className="text-stone-500 mt-1">Here's how your store is performing.</p>

      {/* Compact KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <span className="text-xs font-semibold text-stone-400 uppercase">Orders</span>
          <p className="text-2xl font-extrabold text-stone-900 mt-1">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <span className="text-xs font-semibold text-stone-400 uppercase">Revenue</span>
          <p className="text-2xl font-extrabold text-stone-900 mt-1">{formatPrice(stats.revenue)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <span className="text-xs font-semibold text-stone-400 uppercase">On-Time Delivery</span>
          <p className="text-2xl font-extrabold text-stone-900 mt-1">{stats.onTimeDeliveryRate}%</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <span className="text-xs font-semibold text-stone-400 uppercase">Customer Rating</span>
          <p className="text-2xl font-extrabold text-stone-900 mt-1">{stats.averageRating}/5</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-stone-900">Recent Orders</h2>
            <Link to="/seller/orders" className="text-sm font-semibold text-violet-600">View all →</Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-stone-400 text-sm">No orders yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((o) => (
                <div key={o._id} className="flex items-center justify-between border-b border-stone-100 pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-stone-900 text-sm">{o.orderId}</p>
                    <p className="text-xs text-stone-400">{new Date(o.purchaseDate || o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[o.status] || "bg-stone-100 text-stone-600"}`}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seller Trust Score */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-stone-900 mb-3">Seller Trust Score</h2>
          <p className="text-4xl font-extrabold text-stone-900">
            {Math.round(stats.trustScore)}<span className="text-lg text-stone-400">/100</span>
          </p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${RISK_STYLES[stats.riskLevel]}`}>
            {stats.riskLevel} Risk
          </span>

          <h3 className="text-sm font-semibold text-stone-700 mt-5 mb-2">Why this score?</h3>
          <ul className="text-sm text-stone-500 flex flex-col gap-1.5">
            {stats.reasons.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="material-symbols-outlined text-base text-violet-500">arrow_right</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
        <h2 className="font-bold text-stone-900 mb-3">Recommended Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stats.actions.map((a, i) => (
            <div key={i} className="flex items-start gap-3 bg-stone-50 rounded-xl p-3">
              <span className="material-symbols-outlined text-amber-500">lightbulb</span>
              <p className="text-sm text-stone-600">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}