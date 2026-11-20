
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Wrench, ArrowRight, ShieldCheck } from "lucide-react";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


const handleLogin = async (e) => {
  e.preventDefault();

  if (loading) return;

  setError("");

  const email = formData.email.trim().toLowerCase();
  const password = formData.password;

  if (!email || !password) {
    setError("Please enter your email and password.");
    return;
  }

  setLoading(true);

  try {
    const { data } = await API.post("/auth/login", {
      email,
      password,
    });

    const token = data.token || data.data?.token;
    const user = data.user || data.data?.user;

    if (!token) {
      throw new Error("Authentication token missing.");
    }

    localStorage.setItem("kaamflow_token", token);

    if (user) {
      localStorage.setItem("kaamflow_user", JSON.stringify(user));
    }

    navigate("/dashboard", { replace: true });

  } catch (err) {
    setError(
      err.response?.data?.message ||
      err.message ||
      "Login failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-[#f5f7fc] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/70">

        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 p-12 text-white">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                <Wrench size={25} />
              </div>
              <span className="text-2xl font-extrabold tracking-wide">
                KAAMFLOW
              </span>
            </div>

            <div className="mt-24">
              <p className="text-indigo-200 text-sm font-semibold uppercase tracking-[3px]">
                Repair Operations Platform
              </p>

              <h1 className="text-4xl font-extrabold leading-tight mt-5">
                Smarter Repairs.
                <br />
                Better Outcomes.
              </h1>

              <p className="text-indigo-100 mt-6 leading-7 max-w-sm">
                Manage service requests, technicians, repairs and customer
                outcomes from one organised workspace.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-indigo-100">
            <ShieldCheck size={20} />
            Secure workspace access
          </div>
        </div>

        <div className="p-7 sm:p-12 lg:p-14 flex flex-col justify-center">
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Wrench size={24} />
            </div>
            <span className="text-2xl font-extrabold text-slate-800">
              KAAMFLOW
            </span>
          </div>

          <div>
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">
              Welcome Back
            </p>

            <h2 className="text-3xl font-extrabold text-slate-800 mt-3">
              Sign in to your account
            </h2>

            <p className="text-slate-500 mt-3 text-sm">
              Enter your credentials to access your workspace.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-9 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@kaamflow.com"
                autoComplete="username"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-9">
            KAAMFLOW · Repair Operations & Outcome Intelligence
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
