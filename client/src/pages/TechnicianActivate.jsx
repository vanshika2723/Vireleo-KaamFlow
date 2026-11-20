
import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import API from "../services/api";

function TechnicianActivate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid activation link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post(
        "/technician-applications/activate",
        {
          token,
          password
        }
      );

      setSuccess(
        response.data.message ||
        "Account activated successfully!"
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2500);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to activate account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-7 sm:p-9">

        <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-6">
          <ShieldCheck size={30} />
        </div>

        <h1 className="text-2xl font-bold text-slate-800">
          Activate Your Account
        </h1>

        <p className="text-sm text-slate-500 mt-2 mb-7">
          Welcome to KAAMFLOW! Create a secure password to activate your technician account.
        </p>

        {!token && (
          <div className="p-4 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            Invalid activation link. Please contact Admin.
          </div>
        )}

        {success && (
          <div className="p-4 mb-5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="p-4 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              New Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                minLength={8}
                required
                disabled={!token || loading || !!success}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-11 py-3 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength={8}
              required
              disabled={!token || loading || !!success}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <p className="text-xs text-slate-400">
            Password must contain at least 8 characters.
          </p>

          <button
            type="submit"
            disabled={!token || loading || !!success}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Activating Account..." : "Activate Account"}
          </button>

        </form>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-sm text-violet-600 hover:text-violet-700 font-medium"
          >
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default TechnicianActivate;
