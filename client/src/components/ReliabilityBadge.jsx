const styles = {
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

const colorFor = (score) => (score >= 75 ? "green" : score >= 50 ? "amber" : "red");

export default function ReliabilityBadge({ score }) {
  const color = colorFor(score);
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${styles[color]}`}>
      <span className="material-symbols-outlined text-sm">verified</span>
      {Math.round(score)}/100
    </span>
  );
}