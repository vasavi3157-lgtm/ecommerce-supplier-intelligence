
import { Link } from "react-router-dom";
import {
  getCategoryImage,
  getCategoryLabel,
  isCategoryVisible,
} from "../utils/categoryIcons";
import { formatPrice } from "../utils/helpers";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop&q=60";

export default function ProductCard({ product }) {
  if (!isCategoryVisible(product.category)) {
    return null;
  }

  const imageUrl = getCategoryImage(product.category);
  const categoryLabel = getCategoryLabel(product.category);

  const shortId = product.productId
    ? product.productId.slice(-5).toUpperCase()
    : product._id?.slice(-5).toUpperCase();

  return (
    <Link
      to={`/product/${product._id}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col"
    >
      <div className="h-44 bg-stone-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={categoryLabel}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">
          {categoryLabel}
        </span>

        <h3 className="font-semibold text-stone-900 group-hover:text-violet-600 line-clamp-1">
          {categoryLabel} Item
          <span className="text-stone-400 font-normal"> #{shortId}</span>
        </h3>

        <span className="text-lg font-bold text-stone-900 mt-1">
          {formatPrice(product.price)}
        </span>

        <span className="mt-auto pt-2 text-xs font-semibold text-violet-600">
          View supply chain insights →
        </span>
      </div>
    </Link>
  );
}
