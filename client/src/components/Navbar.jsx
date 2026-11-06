import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCartCount } from "../utils/cart";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [cartCount, setCartCount] = useState(getCartCount());

  useEffect(() => {
    const refresh = () => setCartCount(getCartCount());
    window.addEventListener("cart-updated", refresh);
    return () => window.removeEventListener("cart-updated", refresh);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isSeller = user && (user.role === "supplier" || user.role === "admin");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-violet-600 text-2xl">hub</span>
          <span className="font-bold text-lg text-stone-900 tracking-tight">Suplio</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900">
            Home
          </Link>
          <Link to="/products" className="px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900">
            Products
          </Link>
          {isSeller && (
            <>
              <Link to="/seller/dashboard" className="px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900">
                Seller Portal
              </Link>
              <Link to="/seller/orders" className="px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900">
                My Orders
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/cart" className="relative p-2 rounded-lg hover:bg-stone-100">
            <span className="material-symbols-outlined text-stone-700">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <span className="hidden sm:block text-sm text-stone-500">Hi, {user.name}</span>
              <button
                onClick={logout}
                className="px-4 py-1.5 rounded-lg bg-violet-50 text-violet-600 text-sm font-semibold hover:bg-violet-100"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}