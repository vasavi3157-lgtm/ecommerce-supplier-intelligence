import { useEffect, useState } from "react";
import { getSellerOrders, updateOrderStatus } from "../api/api";
import { formatPrice } from "../utils/helpers";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  shipped: "bg-violet-50 text-violet-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  const load = () => {
    getSellerOrders()
      .then((res) => setOrders(res.data.orders))
      .catch((err) => setError(err.response?.data?.message || "Could not load orders"));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      load();
    } catch {
      setError("Could not update order status");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const orderTotal = (order) =>
    order.items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-900">My Orders</h1>
      {error && <p className="text-red-600 mt-2">{error}</p>}

      <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize whitespace-nowrap ${
              filter === s ? "bg-violet-600 text-white" : "bg-white text-stone-600 shadow-sm"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-stone-400 uppercase text-xs border-b border-stone-100">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan="5" className="py-8 text-center text-stone-400">No orders found.</td></tr>
            )}
            {filtered.map((o) => (
              <tr key={o._id} className="border-b border-stone-50 last:border-0">
                <td className="py-3 px-4 font-medium text-stone-900">{o.orderId}</td>
                <td className="py-3 px-4">{o.customer?.name || "Customer"}</td>
                <td className="py-3 px-4">{new Date(o.purchaseDate || o.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4 font-semibold">{formatPrice(orderTotal(o))}</td>
                <td className="py-3 px-4">
                  <select
                    value={o.status}
                    disabled={updating === o._id}
                    onChange={(e) => handleStatusChange(o._id, e.target.value)}
                    className={`text-xs font-semibold capitalize rounded-full px-3 py-1.5 border-0 outline-none cursor-pointer ${STATUS_STYLES[o.status] || "bg-stone-100"}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}