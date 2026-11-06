const styles = {
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

export const riskLevel = (p) =>
  p < 0.3
    ? { label: "Low Risk", color: "green" }
    : p < 0.6
    ? { label: "Medium Risk", color: "amber" }
    : { label: "High Risk", color: "red" };

export default function RiskChip({ probability }) {
  const risk = riskLevel(probability);
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${styles[risk.color]}`}>
      {risk.label}
    </span>
  );
}