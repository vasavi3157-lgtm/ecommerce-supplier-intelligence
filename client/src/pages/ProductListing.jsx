import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { browseProducts, getCategories } from "../api/api";
import ProductCard from "../components/ProductCard";
import { getCategoryLabel } from "../utils/categoryIcons";

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "popular";
  const page = Number(searchParams.get("page") || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    browseProducts({ search, category, minPrice, maxPrice, sort, page, limit: 24 })
      .then((res) => {
        setProducts(res.data.products);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .catch(() => setError("Could not load products"))
      .finally(() => setLoading(false));
  }, [search, category, minPrice, maxPrice, sort, page]);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.set("page", "1");
    setSearchParams(next);
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">
        {category ? getCategoryLabel(category) : "All Products"}
      </h1>
      <p className="text-sm text-slate-500 mb-6">{total} result{total !== 1 ? "s" : ""}</p>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="flex flex-col gap-6">
          <form
            onSubmit={(e) => { e.preventDefault(); updateParams({ search: searchInput }); }}
            className="flex items-center gap-2 bg-white rounded-xl shadow-sm p-2"
          >
            <span className="material-symbols-outlined text-slate-400 ml-1">search</span>
            <input
              className="flex-1 outline-none text-sm py-1.5"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Category</h3>
            <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1">
              <button
                onClick={() => updateParams({ category: "" })}
                className={`text-left text-sm px-2 py-1.5 rounded-lg ${!category ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  onClick={() => updateParams({ category: c._id })}
                  className={`text-left text-sm px-2 py-1.5 rounded-lg flex justify-between ${category === c._id ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <span className="truncate">{getCategoryLabel(c._id)}</span>
                  <span className="text-slate-400">{c.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Price Range (₹)</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minInput}
                onChange={(e) => setMinInput(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxInput}
                onChange={(e) => setMaxInput(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
            <button
              onClick={() => updateParams({ minPrice: minInput, maxPrice: maxInput })}
              className="mt-3 w-full py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200"
            >
              Apply
            </button>
          </div>
        </aside>

        {/* Main */}
        <div>
          <div className="flex justify-end mb-4">
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="popular">Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {error && <p className="text-red-600">{error}</p>}
          {loading && <p className="text-slate-400">Loading products...</p>}

          {!loading && products.length === 0 && (
            <p className="text-slate-500">No products match these filters.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-white shadow-sm text-sm disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-sm text-slate-500">Page {page} of {pages}</span>
              <button
                onClick={() => goToPage(Math.min(pages, page + 1))}
                disabled={page >= pages}
                className="px-3 py-1.5 rounded-lg bg-white shadow-sm text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}