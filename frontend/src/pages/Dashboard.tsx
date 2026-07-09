import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
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
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const activeHabits = habits.length;
  const today = new Date().toISOString().split("T")[0];

  const completedToday = habits.filter((h) =>
    h.completed_dates?.includes(today)
  ).length;

  const totalCompletions = habits.reduce(
    (sum, h) => sum + (h.completed_dates?.length || 0),
    0
  );

  const progressPercentage =
    activeHabits === 0 ? 0 : Math.round((completedToday / activeHabits) * 100);

  const currentMonthStr = new Date().toLocaleString("default", { month: "long" });
  const currentMonthISO = new Date().toISOString().slice(0, 7);

  const monthlyCompletions = habits.reduce(
    (sum, h) =>
      sum +
      (h.completed_dates?.filter(
        (d: string) => d.startsWith(currentMonthISO)
      ).length || 0),
    0
  );

  function calculateStreak(completedDates: string[], restDates: string[] = []) {
    const completed = new Set(completedDates || []);
    const rest = new Set(restDates || []);

    let streak = 0;
    let current = new Date();
    const today = current.toISOString().split("T")[0];

    if (!completed.has(today) && !rest.has(today)) {
      current.setDate(current.getDate() - 1);
    }

    while (true) {
      const dateString = current.toISOString().split("T")[0];

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
        calculateStreak(h.completed_dates || [], h.rest_dates || [])
      ),
    0
  );

  const mostConsistentHabit =
    habits.length > 0
      ? habits.reduce((best, current) =>
          calculateStreak(current.completed_dates || [], current.rest_dates || []) >
          calculateStreak(best.completed_dates || [], best.rest_dates || [])
            ? current
            : best
        )
      : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3E8E0] text-slate-900 px-4">
        <div className="flex flex-col items-center gap-3 rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <span className="text-sm font-medium text-slate-500">
            Gathering your dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3E8E0] text-slate-900 px-4 md:px-6 py-6 md:py-10">
      <div className="mx-auto max-w-350 space-y-10">
        
        {/* TOP BRAND NAVIGATION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200/60 pb-8">
          <div className="space-y-4 max-w-2xl">
            {/* Clean floating date tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 shadow-2xs border border-slate-200/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {todayFormatted}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900 leading-none">
              Welcome back to your <span className="font-serif italic font-normal text-slate-800">flow</span> 👋
            </h1>
            
            <p className="text-base text-slate-600 font-medium leading-relaxed">
              Take a deep breath. Here is a beautiful breakdown of your active habits, historical streaks, and daily performance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate("/habits")}
              className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-xs"
            >
              My Habits Page
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center justify-center rounded-3xl bg-white border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 shadow-xs"
            >
              Logout
            </button>
          </div>
        </div>

        {/* COMPACT PROGRESS STRIP */}
        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="rounded-[36px] bg-white p-6 shadow-sm border border-slate-200 flex flex-col justify-between gap-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-slate-500 text-sm uppercase tracking-[0.24em]">
                  Today's focus
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  Daily Progress
                </h2>
              </div>
              <div className="rounded-3xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 border border-emerald-100">
                {progressPercentage}% Complete
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-3xl bg-slate-100 h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-wide">
                Done with {completedToday} out of your {activeHabits} active habits today.
              </p>
            </div>
          </div>

          {/* USER SYNC STRIP */}
          <div className="rounded-[36px] bg-white p-6 shadow-sm border border-slate-200 flex flex-col justify-between gap-4">
            <div>
              <p className="text-slate-500 text-sm uppercase tracking-[0.24em]">
                Session info
              </p>
              <h3 className="mt-1 text-base font-semibold text-slate-900">
                Account Status
              </h3>
            </div>
            {user ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {user.email}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  ID: {user.user_id}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Offline Mode</p>
            )}
          </div>
        </div>

        {/* CORE STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-[36px] bg-white p-6 shadow-sm border border-slate-200 flex flex-col justify-between min-h-[135px]">
            <p className="text-slate-500 text-xs uppercase tracking-[0.2em] font-medium">
              Active Habits
            </p>
            <p className="text-4xl font-semibold text-slate-900 mt-2">
              {activeHabits}
            </p>
          </div>

          <div className="rounded-[36px] bg-white p-6 shadow-sm border border-slate-200 flex flex-col justify-between min-h-[135px]">
            <p className="text-slate-500 text-xs uppercase tracking-[0.2em] font-medium">
              Completed Today
            </p>
            <p className="text-4xl font-semibold text-emerald-600 mt-2">
              {completedToday}
            </p>
          </div>

          <div className="rounded-[36px] bg-white p-6 shadow-sm border border-slate-200 flex flex-col justify-between min-h-[135px]">
            <p className="text-slate-500 text-xs uppercase tracking-[0.2em] font-medium">
              Best Streak
            </p>
            <p className="text-4xl font-semibold text-amber-600 mt-2">
              🔥 {bestStreak} <span className="text-xs font-normal text-slate-400 tracking-normal uppercase">days</span>
            </p>
          </div>

          <div className="rounded-[36px] bg-white p-6 shadow-sm border border-slate-200 flex flex-col justify-between min-h-[135px]">
            <p className="text-slate-500 text-xs uppercase tracking-[0.2em] font-medium">
              Total Check-ins
            </p>
            <p className="text-4xl font-semibold text-slate-900 mt-2">
              {totalCompletions}
            </p>
          </div>
        </div>

        {/* BOTTOM METRICS SPLIT */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          
          {/* CONSISTENCY SPOTLIGHT */}
          <div className="rounded-[36px] bg-white p-6 shadow-sm border border-slate-200 space-y-6">
            <div>
              <p className="text-slate-500 text-sm uppercase tracking-[0.24em]">
                Highlights
              </p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">
                Consistency Insights
              </h3>
            </div>
            
            <div className="grid gap-4">
              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200/40">
                <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Most Consistent Routine</p>
                {mostConsistentHabit ? (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {mostConsistentHabit.title}
                    </p>
                    <p className="text-xs font-bold text-amber-600 mt-0.5">
                      🔥 {calculateStreak(mostConsistentHabit.completed_dates || [], mostConsistentHabit.rest_dates || [])} day current streak
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-slate-400 italic">No historical data available</p>
                )}
              </div>

              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200/40">
                <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Volume in {currentMonthStr}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {monthlyCompletions} <span className="text-xs font-normal text-slate-500 uppercase tracking-widest pl-1">completions</span>
                </p>
              </div>
            </div>
          </div>

          {/* QUICK SNAPSHOT CONTAINER */}
          <div className="rounded-[36px] bg-white p-6 shadow-sm border border-slate-200 flex flex-col justify-between gap-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-slate-500 text-sm uppercase tracking-[0.24em]">
                  Snapshot
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">
                  Routine Overview
                </h3>
              </div>
              <button
                onClick={() => navigate("/habits")}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 transition tracking-wider uppercase border-b border-transparent hover:border-amber-600 pb-0.5"
              >
                Full sheet →
              </button>
            </div>

            {habits.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-medium">
                  Your ritual ledger is currently empty.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {habits.slice(0, 4).map((h) => {
                  const currentStreak = calculateStreak(h.completed_dates || [], h.rest_dates || []);
                  return (
                    <div
                      key={h.id}
                      className="flex items-center justify-between bg-slate-50 px-5 py-3.5 rounded-2xl border border-slate-200/60"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {h.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {h.completed_dates?.length || 0} total hits
                        </p>
                      </div>
                      <span className="shrink-0 rounded-xl bg-white border border-slate-200 px-3 py-1 text-xs font-semibold text-amber-600">
                        🔥 {currentStreak}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}