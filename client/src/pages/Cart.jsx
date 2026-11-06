import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createOrder } from "../api/api";
import { getCart, removeFromCart, updateQuantity, clearCart } from "../utils/cart";
import { formatPrice } from "../utils/helpers";

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [placing, setPlacing] = useState(false);

  const refresh = () => setItems(getCart());

  useEffect(() => {
    refresh();
    window.addEventListener("cart-updated", refresh);
    return () => window.removeEventListener("cart-updated", refresh);
  }, []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handlePlaceOrder = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) {
      navigate("/login");
      return;
    }

    if (items.length === 0) return;

    setPlacing(true);
    setMessage("");

    try {
      await createOrder({
        orderId: `ORD-${Date.now()}`,
        items: items.map((i) => ({
          product: i.productId,
          supplier: i.supplierId,
          price: i.price,
          quantity: i.quantity,
        })),
        purchaseDate: new Date(),
        estimatedDeliveryDate: new Date(
          Date.now() + (items[0]?.predictedDeliveryDays || 5) * 24 * 60 * 60 * 1000
        ),
      });
      clearCart();
      setMessage("Order placed successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0 && !message) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300">shopping_cart</span>
        <h1 className="text-xl font-bold text-slate-900 mt-4">Your cart is empty</h1>
        <Link to="/" className="inline-block mt-4 text-indigo-600 font-semibold">
          ← Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Cart</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-xl ${message.includes("success") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {message}
          {message.includes("success") && (
            <Link to="/" className="block mt-2 font-semibold underline">
              Continue shopping →
            </Link>
          )}
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.supplierId}`}
                className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4"
              >
                <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="material-symbols-outlined text-3xl text-slate-500">{item.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  <p className="text-sm text-slate-500">Sold by {item.supplierName}</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.supplierId, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.supplierId, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId, item.supplierId)}
                  className="text-red-500 hover:text-red-700"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{items.reduce((s, i) => s + i.quantity, 0)} item(s)</p>
              <p className="text-2xl font-extrabold text-slate-900">{formatPrice(total)}</p>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {placing ? "Placing order..." : "Place Order"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}