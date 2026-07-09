import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, LogOut, CheckCircle2, TrendingUp, Calendar, Trophy, Zap, ListTodo } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const token = getToken();

    if (!token) {
      window.location.href = "/";
      return;
    }

    fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data.user));

    fetch(`${API}/habits`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setHabits(data))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const activeHabits = habits.length;

  const today = new Date().toISOString().split("T")[0];

  const completedToday = habits.filter((h) =>
    h.completed_dates?.includes(today)
  ).length;

  const totalCompletions =
  habits.reduce(
    (sum, h) =>
      sum + (h.completed_dates?.length || 0),
    0
  );

  const progressPercentage =
  activeHabits === 0
    ? 0
    : Math.round(
        (completedToday / activeHabits) * 100
      );

  const mostConsistentHabit =
  habits.length > 0
    ? habits.reduce((best, current) =>
        calculateStreak(
          current.completed_dates || [],
          current.rest_dates || []
        ) >
        calculateStreak(
          best.completed_dates || [],
          best.rest_dates || []
        )
          ? current
          : best
      )
    : null;

  const currentMonth =
  new Date().toISOString().slice(0, 7);

  const monthlyCompletions =
  habits.reduce(
    (sum, h) =>
      sum +
      (h.completed_dates?.filter(
        (d: string) =>
          d.startsWith(currentMonth)
      ).length || 0),
    0
  );

  function calculateStreak(
    completedDates: string[],
    restDates: string[] = []
  ) {
    const completed = new Set(completedDates || []);
    const rest = new Set(restDates || []);

    let streak = 0;
    let current = new Date();
    const today = current.toISOString().split("T")[0];

    if (
      !completed.has(today) &&
      !rest.has(today)
    ) {
      current.setDate(current.getDate() - 1);
    }

    while (true) {
      const dateString =
        current.toISOString().split("T")[0];

      if (completed.has(dateString)) {
        streak++;
      } else if (rest.has(dateString)) {
        // Keep alive
      } else {
        break;
      }

      current.setDate(current.getDate() - 1);
    }

    return streak;
  }

  const bestStreak = habits.reduce(
    (max, h) =>
      Math.max(
        max,
        calculateStreak(
          h.completed_dates || [],
          h.rest_dates || []
        )
      ),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50/60 text-stone-800">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-emerald-700" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-stone-500 font-medium text-sm">Gathering your habits...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/40 text-stone-800 px-4 sm:px-8 py-10 font-sans selection:bg-amber-200">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white border border-stone-200/60 rounded-3xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 rounded-lg text-emerald-800 inline-flex">
                <Sparkles size={18} />
              </span>
              <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                HabitFlow
              </h1>
            </div>
            <p className="text-stone-500 text-xs mt-1">
              Build discipline, one day at a time
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/habits")}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-amber-50 text-sm font-semibold shadow-sm shadow-emerald-700/10 transition-colors"
            >
              My Habits
            </button>

            <button
              onClick={logout}
              className="p-2.5 rounded-xl text-stone-400 hover:text-orange-700 hover:bg-orange-50 transition-colors inline-flex items-center gap-2 text-sm font-medium"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* PROFILE OVERVIEW */}
<div className="bg-linear-to-r from-emerald-50/60 to-amber-50/40 border border-emerald-100/60 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  <div>
    <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
      Welcome back to your flow 👋
    </h2>
    <p className="text-stone-500 text-xs mt-1">
      Take a deep breath. Today is a brand new day to build your streak.
    </p>
  </div>
  
  {user && (
    <div className="text-stone-400 text-[11px] font-medium border-t sm:border-t-0 sm:border-l border-stone-200/60 pt-3 sm:pt-0 sm:pl-6 shrink-0">
      <span className="block text-stone-500 font-semibold text-xs">{user.email}</span>
      <span className="block text-[10px] opacity-80 mt-0.5 font-mono">UID: {user.user_id}</span>
    </div>
  )}
</div>

        {/* GRID STATS PLATFORM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Active Habits */}
          <div className="bg-white border border-stone-200/60 p-6 rounded-3xl shadow-xs flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Active Habits</p>
              <p className="text-4xl font-serif font-bold mt-2 text-stone-900">{activeHabits}</p>
            </div>
            <div className="p-2 bg-stone-50 rounded-xl text-stone-500"><ListTodo size={20} /></div>
          </div>

          {/* Completed Today */}
          <div className="bg-white border border-stone-200/60 p-6 rounded-3xl shadow-xs flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Completed Today</p>
              <p className="text-4xl font-serif font-bold mt-2 text-emerald-700">{completedToday}</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700"><CheckCircle2 size={20} /></div>
          </div>

          {/* Best Streak */}
          <div className="bg-white border border-stone-200/60 p-6 rounded-3xl shadow-xs flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Best Streak</p>
              <p className="text-4xl font-serif font-bold mt-2 text-amber-600">🔥 {bestStreak}</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Zap size={20} /></div>
          </div>

          {/* Total Completions */}
          <div className="bg-white border border-stone-200/60 p-6 rounded-3xl shadow-xs flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Completions</p>
              <p className="text-4xl font-serif font-bold mt-2 text-stone-900">{totalCompletions}</p>
            </div>
            <div className="p-2 bg-stone-50 rounded-xl text-stone-400"><Trophy size={20} /></div>
          </div>

          {/* Today's Progress Bar card */}
          <div className="bg-white border border-stone-200/60 p-6 rounded-3xl shadow-xs sm:col-span-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Today's Progress</p>
                <p className="text-3xl font-serif font-bold mt-1 text-emerald-800">{progressPercentage}%</p>
              </div>
              <div className="p-2 bg-stone-50 rounded-xl text-stone-400"><TrendingUp size={20} /></div>
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Most Consistent */}
          <div className="bg-white border border-stone-200/60 p-6 rounded-3xl shadow-xs">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🏆</span> Most Consistent
            </p>
            {mostConsistentHabit ? (
              <div className="mt-3">
                <p className="text-base font-bold text-stone-800 truncate">
                  {mostConsistentHabit.title}
                </p>
                <p className="text-xs text-amber-600 font-medium mt-0.5">
                  🔥 {calculateStreak(mostConsistentHabit.completed_dates || [], mostConsistentHabit.rest_dates || [])} day streak
                </p>
              </div>
            ) : (
              <p className="text-stone-400 text-xs mt-4 italic">No habits yet</p>
            )}
          </div>

          {/* This Month Performance */}
          <div className="bg-white border border-stone-200/60 p-6 rounded-3xl shadow-xs flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">This Month</p>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-4xl font-serif font-bold text-stone-900">{monthlyCompletions}</span>
                <span className="text-xs text-stone-400 font-medium">hits</span>
              </div>
            </div>
            <div className="p-2 bg-stone-50 rounded-xl text-stone-400"><Calendar size={20} /></div>
          </div>

        </div>

        {/* HABITS LIST PREVIEW BOX */}
        <div className="bg-white border border-stone-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900">
                Your Habits
              </h2>
              <p className="text-stone-400 text-xs mt-0.5">Quick glance at your top practices</p>
            </div>

            <button
              onClick={() => navigate("/habits")}
              className="text-xs text-emerald-700 font-bold hover:text-emerald-800 hover:underline transition-all"
            >
              View all →
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-8 bg-stone-50/50 border border-dashed border-stone-200 rounded-2xl">
              <p className="text-stone-400 text-sm">
                No habits yet. Start building your first habit 🚀
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {habits.slice(0, 4).map((h) => (
                <div
                  key={h.id}
                  className="flex justify-between items-center bg-stone-50/60 p-4 rounded-2xl border border-stone-200/40 hover:bg-stone-50 hover:border-stone-200 transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-stone-800 font-semibold truncate text-sm">
                      {h.title}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {h.completed_dates?.length || 0} completions total
                    </p>
                  </div>

                  <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-lg border border-amber-200/40 shrink-0 flex items-center gap-0.5">
                    🔥 {calculateStreak(h.completed_dates || [], h.rest_dates || [])}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}