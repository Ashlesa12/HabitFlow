import { useState } from "react";
import { loginUser } from "../api/api";
import { Eye, EyeOff, Sparkles } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("The server is resting right now. Please try again soon.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f7ece3] via-[#f5e3d7] to-[#f2e4e0] text-slate-900 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-[36px] border border-white/80 bg-white/95 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 shadow-sm">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
            HabitFlow
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-3 text-slate-600">
            Log in and continue building your morning routine.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Your Email
            </label>
            <input
              type="email"
              placeholder="name@domain.com"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition duration-200 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-400/10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Password
              </label>
              <a
                href="#forgot"
                className="text-xs font-medium text-slate-400 transition hover:text-emerald-700"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none transition duration-200 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-400/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-3xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Opening HabitFlow...
              </>
            ) : (
              "Continue to HabitFlow"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          New here?{" "}
          <a
            href="/register"
            className="font-semibold text-emerald-700 transition hover:underline"
          >
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}