import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getSuppliers, getSupplierStats } from "../api/api";
import ReliabilityBadge from "../components/ReliabilityBadge";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSupplierStats()
      .then((res) => setStats(res.data))
      .catch(() => setError("Could not load supplier stats"));

    getSuppliers()
      .then((res) => setSuppliers(res.data.suppliers))
      .catch(() => setError("Could not load suppliers"));
  }, []);

  const top = stats
    ? stats.topSuppliers.map((s) => ({ name: s.name, score: s.trustScore || 0 }))
    : [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Supplier Dashboard</h1>
      {error && <p className="text-red-600 mt-2">{error}</p>}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <span className="text-sm font-semibold text-slate-500">Total Suppliers</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {stats ? stats.totalSuppliers : "..."}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <span className="text-sm font-semibold text-slate-500">Average Reliability</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {stats ? stats.averageReliability : "..."}<span className="text-base text-slate-400">/100</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <span className="text-sm font-semibold text-slate-500">High-Risk Suppliers</span>
          <p className="text-3xl font-extrabold text-red-600 mt-2">
            {stats ? stats.highRiskCount : "..."}
          </p>
        </div>
      </div>

      {/* Top 10 chart */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mt-8" style={{ height: 320 }}>
        <h2 className="font-bold text-slate-900 mb-3">Top 10 Suppliers by Reliability</h2>
        {top.length === 0 ? (
          <p className="text-slate-400 text-sm">Loading chart...</p>
        ) : (
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={top}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Directory table */}
      <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">All Suppliers (first 100)</h2>
      <div className="bg-white rounded-2xl shadow-sm p-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-400 uppercase text-xs">
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">City</th>
              <th className="py-3 px-3">State</th>
              <th className="py-3 px-3">Rating</th>
              <th className="py-3 px-3">Reliability</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s._id} className="border-t border-slate-100">
                <td className="py-3 px-3 font-medium text-slate-900">{s.name}</td>
                <td className="py-3 px-3">{s.city || "-"}</td>
                <td className="py-3 px-3">{s.state || "-"}</td>
                <td className="py-3 px-3">{s.averageRating ?? "-"}</td>
                <td className="py-3 px-3"><ReliabilityBadge score={s.trustScore || 0} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}