import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProducts } from "../api/api";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";

const POPULAR_CATEGORIES = [
  "eletronicos",
  "bebes",
  "beleza_saude",
  "moveis_decoracao",
  "esporte_lazer",
  "fashion_bolsas_e_acessorios",
  "informatica_acessorios",
  "brinquedos",
];

const BENEFITS = [
  { icon: "verified_user", title: "Trusted Sellers", text: "Every seller is scored on reliability, so you always know who you're buying from." },
  { icon: "lock", title: "Secure Checkout", text: "Your orders and details are protected throughout the buying process." },
  { icon: "local_shipping", title: "Reliable Delivery", text: "AI-predicted delivery times help you plan with confidence." },
  { icon: "autorenew", title: "Easy Returns", text: "Simple, hassle-free return process on eligible items." },
];

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getProducts()
      .then((res) => {
        const all = res.data.products;
        setFeatured(all.slice(0, 8));
        setTrending(all.slice(8, 16));
      })
      .catch(() => setError("Could not load products. Is the backend running?"));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-50 via-stone-50 to-amber-50">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm text-xs font-semibold text-violet-600 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              AI-powered seller intelligence
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Discover products you'll love
            </h1>
            <p className="mt-4 text-lg text-stone-500 max-w-md">
              Shop with confidence. Every product shows real seller reliability and
              AI-predicted delivery times before you buy.
            </p>

            <form onSubmit={handleSearch} className="mt-7 flex items-center gap-2 bg-white p-2 rounded-2xl shadow max-w-md">
              <span className="material-symbols-outlined text-stone-400 ml-2">search</span>
              <input
                className="flex-1 outline-none text-sm py-2"
                placeholder="Search for products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700">
                Search
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <Link to="/products" className="px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700">
                Shop Now
              </Link>
              <a href="#categories" className="px-6 py-3 rounded-xl bg-white text-stone-700 font-semibold shadow-sm hover:bg-stone-50">
                Explore Categories
              </a>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="h-40 rounded-3xl bg-gradient-to-br from-violet-300 to-violet-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-white">shopping_bag</span>
              </div>
              <div className="h-40 rounded-3xl bg-gradient-to-br from-emerald-300 to-emerald-400 flex items-center justify-center mt-8">
                <span className="material-symbols-outlined text-5xl text-white">local_shipping</span>
              </div>
              <div className="h-40 rounded-3xl bg-gradient-to-br from-amber-300 to-amber-400 flex items-center justify-center -mt-8">
                <span className="material-symbols-outlined text-5xl text-white">verified</span>
              </div>
              <div className="h-40 rounded-3xl bg-gradient-to-br from-rose-300 to-rose-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-white">favorite</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-bold text-stone-900">Shop by Category</h2>
          <Link to="/products" className="text-sm font-semibold text-violet-600">View all →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {POPULAR_CATEGORIES.map((c) => (
            <CategoryCard key={c} category={c} />
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-bold text-stone-900">Featured Products</h2>
          <Link to="/products" className="text-sm font-semibold text-violet-600">View all →</Link>
        </div>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* Trending products */}
      {trending.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-bold text-stone-900">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trending.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* Why shop with us */}
      <section className="bg-white py-14 mt-6 border-y border-stone-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-stone-900 text-center mb-10">Why Shop With Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-stone-50 rounded-2xl p-6 text-center">
                <span className="material-symbols-outlined text-3xl text-amber-500">{b.icon}</span>
                <h3 className="font-semibold text-stone-900 mt-3">{b.title}</h3>
                <p className="text-sm text-stone-500 mt-1">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-extrabold text-stone-900">Find your next favorite product</h2>
        <p className="text-stone-500 mt-2">Thousands of products, verified sellers, smart delivery predictions.</p>
        <Link to="/products" className="inline-block mt-6 px-8 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700">
          Start Shopping
        </Link>
      </section>
    </div>
  );
}