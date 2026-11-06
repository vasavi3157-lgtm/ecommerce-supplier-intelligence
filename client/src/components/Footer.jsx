export default function Footer() {
  return (
    <footer className="mt-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-600">hub</span>
          <span className="font-bold text-slate-900">Suplio</span>
        </div>
        <p className="text-sm text-slate-500">
          © 2026 Suplio. AI-powered supplier reliability and delivery intelligence.
        </p>
      </div>
    </footer>
  );
}