import { useState } from "react";
import { Eye, EyeOff, Sparkles } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const API = import.meta.env.VITE_API_URL;

    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = "/";
      } else {
        setError(data.detail || data.error || "Registration failed");
      }
    } catch {
      setError("Server not responding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50/60 text-stone-800 px-4 font-sans selection:bg-amber-200">
      <div className="w-full max-w-md bg-white border border-stone-200/80 rounded-3xl shadow-xl shadow-stone-200/50 p-8 sm:p-10 transition-all duration-300">

        {/* Cozy Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-2xl text-emerald-700 mb-4">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-800 tracking-tight">
            Create Account
          </h1>
          <p className="text-stone-500 text-sm mt-2">
            Join HabitFlow and start tracking habits
          </p>
        </div>

        {/* Gentle Error Notice */}
        {error && (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 text-sm p-3.5 rounded-xl mb-6 text-center font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-5">

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 tracking-wide uppercase block ml-0.5">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 tracking-wide uppercase block ml-0.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 pr-11"
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Warm Earthy Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 text-amber-50 font-semibold p-3.5 rounded-xl shadow-md shadow-emerald-700/10 hover:shadow-emerald-700/20 active:scale-[0.99] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-amber-50" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating account...</span>
              </>
            ) : (
              <span>Sign Up</span>
            )}
          </button>
        </form>

        {/* Soft Footer Link */}
        <p className="text-sm text-stone-500 text-center mt-8 pt-6 border-t border-stone-100">
          Already have an account?{" "}
          <a href="/" className="text-emerald-700 font-semibold hover:underline transition-colors">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}