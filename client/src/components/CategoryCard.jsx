
import { useNavigate } from "react-router-dom";
import {
  getCategoryImage,
  getCategoryLabel,
  isCategoryVisible,
} from "../utils/categoryIcons";

export default function CategoryCard({ category }) {
  const navigate = useNavigate();

  if (!isCategoryVisible(category)) {
    return null;
  }

  const image = getCategoryImage(category);
  const label = getCategoryLabel(category);

  return (
    <button
      onClick={() =>
        navigate(`/products?category=${encodeURIComponent(category)}`)
      }
      className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all overflow-hidden"
    >
      <div className="w-full h-28 rounded-xl overflow-hidden bg-stone-100">
        <img
          src={image}
          alt={label}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <span className="text-sm font-semibold text-slate-700 text-center">
        {label}
      </span>
    </button>
  );
}
