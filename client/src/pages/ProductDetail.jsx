import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductById, compareSuppliers, explainDelivery } from "../api/api";
import ReliabilityBadge from "../components/ReliabilityBadge";
import RiskChip, { riskLevel } from "../components/RiskChip";
import ShapChart from "../components/ShapChart";
import { getCategoryImage, getCategoryLabel } from "../utils/categoryIcons";
import { formatPrice, deliveryDate } from "../utils/helpers";
import { addToCart } from "../utils/cart";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop&q=60";

const recommendations = (s) => {
  const tips = [];
  const risk = riskLevel(s.delayProbability);
  if (risk.label === "High Risk") tips.push({ icon: "warning", text: "High delay risk. Consider another supplier or allow extra time." });
  if (risk.label === "Low Risk") tips.push({ icon: "check_circle", text: "Low delay risk. Safe to order for time-sensitive needs." });
  if (s.trustScore < 50) tips.push({ icon: "search", text: "Low supplier trust score. Check reviews before ordering." });
  if (s.trustScore >= 75) tips.push({ icon: "star", text: "Highly reliable supplier based on past orders." });
  if (s.freightValue > s.price * 0.3) tips.push({ icon: "local_shipping", text: "Freight cost is high relative to price. Compare other suppliers." });
  if (tips.length === 0) tips.push({ icon: "thumb_up", text: "This supplier looks balanced on price, speed and reliability." });
  return tips.slice(0, 4);
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [data, setData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [shap, setShap] = useState([]);
  const [error, setError] = useState("");
  const [shapError, setShapError] = useState("");

  useEffect(() => {
    getProductById(id)
      .then((res) => setProduct(res.data.product))
      .catch(() => setError("Product not found"));

    compareSuppliers(id)
      .then((res) => {
        setData(res.data);
        setSelectedId(res.data.recommendedSupplier?.supplierId);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load supplier intelligence"));
  }, [id]);

  const selected = data?.suppliers.find((s) => s.supplierId === selectedId);

  useEffect(() => {
    if (!product || !selected) return;
    setShap([]);
    setShapError("");
    explainDelivery({
      price: selected.price,
      freight_value: selected.freightValue || 0,
      product_category_name: product.category || "unknown",
      product_weight_g: product.weight || 0,
      product_length_cm: product.length || 0,
      product_height_cm: product.height || 0,
      product_width_cm: product.width || 0,
      product_photos_qty: product.photosQuantity || 0,
    })
      .then((res) => setShap(res.data.explanations))
      .catch(() => setShapError("Could not generate explanation"));
  }, [product, selectedId]);

  const handleAddToCart = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) {
      navigate("/login");
      return;
    }

    addToCart({
      productId: product._id,
      supplierId: selected.supplierId,
      supplierName: selected.supplier,
      name: label,
      price: selected.price,
      image: imageUrl,
      predictedDeliveryDays: selected.predictedDeliveryDays,
    });

    navigate("/cart");
  };

  if (error)
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Link to="/" className="text-stone-500 text-sm">← Back</Link>
        <p className="text-red-600 mt-4">{error}</p>
      </div>
    );
  if (!product || !data || !selected)
    return <div className="max-w-6xl mx-auto px-6 py-10 text-stone-500">Loading...</div>;

  const risk = riskLevel(selected.delayProbability);
  const imageUrl = getCategoryImage(product.category);
  const label = getCategoryLabel(product.category);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Link to="/" className="text-stone-500 text-sm">← Back to products</Link>

      {/* Top card */}
      <div className="mt-4 bg-white rounded-2xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-60 rounded-xl overflow-hidden bg-stone-100">
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_IMAGE;
            }}
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-xs font-semibold text-stone-400 uppercase">{product.category}</span>
          <h1 className="text-2xl font-bold text-stone-900 mt-1">{label}</h1>
          <p className="mt-1 text-stone-500">Sold by <span className="font-semibold text-violet-600">{selected.supplier}</span></p>
          <div className="mt-3"><ReliabilityBadge score={selected.trustScore} /></div>
          <span className="text-3xl font-extrabold text-stone-900 mt-4">{formatPrice(selected.price)}</span>
          <p className="text-sm text-stone-500 mt-1">Expected delivery: {deliveryDate(selected.predictedDeliveryDays)}</p>
          <button
            onClick={handleAddToCart}
            className="mt-5 w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">shopping_cart</span>
            Add to Cart
          </button>
        </div>
      </div>

      {/* Supply Chain Intelligence */}
      <h2 className="text-xl font-bold text-stone-900 mt-10 mb-4">Supply Chain Intelligence</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <span className="text-sm font-semibold text-stone-500">Supplier Reliability</span>
          <p className="text-3xl font-extrabold text-stone-900 mt-2">
            {Math.round(selected.trustScore)}<span className="text-base text-stone-400">/100</span>
          </p>
          <div className="w-full h-2 bg-stone-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selected.trustScore}%` }} />
          </div>
          <p className="text-xs text-stone-400 mt-2">Avg rating: {selected.averageRating}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <span className="text-sm font-semibold text-stone-500">Predicted Delivery</span>
          <p className="text-3xl font-extrabold text-stone-900 mt-2">
            {selected.predictedDeliveryDays} <span className="text-base text-stone-400">days</span>
          </p>
          <p className="text-xs text-stone-400 mt-2">Arrives around {deliveryDate(selected.predictedDeliveryDays)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <span className="text-sm font-semibold text-stone-500">Delay Risk</span>
          <p className="text-3xl font-extrabold text-stone-900 mt-2">
            {Math.round(selected.delayProbability * 100)}%
          </p>
          <div className="w-full h-2 bg-stone-100 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${risk.color === "green" ? "bg-emerald-500" : risk.color === "amber" ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${selected.delayProbability * 100}%` }}
            />
          </div>
          <div className="mt-2"><RiskChip probability={selected.delayProbability} /></div>
        </div>
      </div>

      {/* Why this prediction */}
      <h2 className="text-xl font-bold text-stone-900 mt-10 mb-4">Why this prediction?</h2>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {shapError && <p className="text-red-600">{shapError}</p>}
        {!shapError && shap.length === 0 && <p className="text-stone-500">Loading explanation...</p>}
        {shap.length > 0 && <ShapChart explanations={shap} />}
      </div>

      {/* Recommendations */}
      <h2 className="text-xl font-bold text-stone-900 mt-10 mb-4">Recommendations</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {recommendations(selected).map((t, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2">
            <span className="material-symbols-outlined text-violet-600 text-2xl">{t.icon}</span>
            <p className="text-sm text-stone-600">{t.text}</p>
          </div>
        ))}
      </div>

      {/* Compare Suppliers */}
      <h2 className="text-xl font-bold text-stone-900 mt-10 mb-4">Compare Suppliers</h2>
      <div className="bg-white rounded-2xl shadow-sm p-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-stone-400 uppercase text-xs">
              <th className="py-3 px-3">Supplier</th>
              <th className="py-3 px-3">Price</th>
              <th className="py-3 px-3">Trust</th>
              <th className="py-3 px-3">Delivery</th>
              <th className="py-3 px-3">Delay Risk</th>
              <th className="py-3 px-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {data.suppliers.map((s) => (
              <tr
                key={s.supplierId}
                onClick={() => setSelectedId(s.supplierId)}
                className={`cursor-pointer border-t border-stone-100 ${s.supplierId === selectedId ? "bg-violet-50" : "hover:bg-stone-50"}`}
              >
                <td className="py-3 px-3 font-medium text-stone-900">
                  {s.supplier}
                  {s.supplierId === data.recommendedSupplier?.supplierId && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">Best</span>
                  )}
                </td>
                <td className="py-3 px-3">{formatPrice(s.price)}</td>
                <td className="py-3 px-3">{Math.round(s.trustScore)}</td>
                <td className="py-3 px-3">{s.predictedDeliveryDays}d</td>
                <td className="py-3 px-3">{Math.round(s.delayProbability * 100)}%</td>
                <td className="py-3 px-3 font-semibold">{s.recommendationScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-stone-400 mt-3 px-3">Click a row to view that supplier's predictions.</p>
      </div>
    </div>
  );
}