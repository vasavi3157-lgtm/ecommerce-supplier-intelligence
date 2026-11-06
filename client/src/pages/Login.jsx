import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api/api";

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError("");
    try {
      if (isRegister) {
        await registerUser(form);
        setIsRegister(false);
        setError("Registered! Please login now.");
      } else {
        const res = await loginUser({ email: form.email, password: form.password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 bg-slate-50">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-10">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <span className="material-symbols-outlined">hub</span>
              <span className="font-bold text-lg">Suplio</span>
            </div>
            <h1 className="text-2xl font-bold leading-snug">
              Know your supplier before you buy
            </h1>
            <p className="mt-3 text-indigo-100 text-sm">
              AI-powered supplier reliability scores and explainable delivery predictions.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">verified</span>
              Supplier reliability scores
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">schedule</span>
              Delivery time predictions
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">analytics</span>
              Explainable AI on every order
            </li>
          </ul>
        </div>

        {/* Form */}
        <div className="p-8 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-slate-900">
            {isRegister ? "Create an account" : "Welcome back"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isRegister ? "Sign up to start ordering." : "Login to continue."}
          </p>

          {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

          <div className="mt-5 flex flex-col gap-3">
            {isRegister && (
              <input
                name="name"
                placeholder="Full name"
                value={form.name}
                onChange={change}
                className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
            )}
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={change}
              className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={change}
              className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />
            {isRegister && (
              <select
                name="role"
                value={form.role}
                onChange={change}
                className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
              </select>
            )}

            <button
              onClick={submit}
              className="mt-2 w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700"
            >
              {isRegister ? "Create account" : "Sign in"}
            </button>
          </div>

          <p
            className="mt-5 text-sm text-slate-500 text-center cursor-pointer"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Already have an account? Login" : "New here? Register"}
          </p>
        </div>
      </div>
    </div>
  );
}