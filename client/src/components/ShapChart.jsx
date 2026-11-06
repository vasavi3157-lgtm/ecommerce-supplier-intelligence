import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { formatFeature } from "../utils/formatFeature";

export default function ShapChart({ explanations }) {
  const data = explanations.map((e) => ({
    name: formatFeature(e.feature),
    value: e.shap_value,
  }));

  return (
    <div>
      <div style={{ width: "100%", height: 340 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => `${v > 0 ? "+" : ""}${v} days`} />
            <ReferenceLine x={0} stroke="#94a3b8" />
            <Bar dataKey="value">
              {data.map((d, i) => (
                <Cell key={i} fill={d.value > 0 ? "#ef4444" : "#22c55e"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-slate-500 mt-2">
        🔴 Red = makes delivery slower &nbsp; 🟢 Green = makes delivery faster
      </p>
    </div>
  );
}