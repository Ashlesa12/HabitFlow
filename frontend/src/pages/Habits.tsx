import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function Habits() {
  const [habits, setHabits] = useState<any[]>([]);
  const [title, setTitle] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const today = new Date().toISOString().split("T")[0];
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const fetchHabits = async () => {
    const res = await fetch(`${API}/habits`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setHabits(data);
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const addHabit = async () => {
    if (!title.trim()) return;

    await fetch(`${API}/habits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    setTitle("");
    fetchHabits();
  };

  const deleteHabit = async (id: string) => {
    const confirmDelete = window.confirm("Delete this habit?");
    if (!confirmDelete) return;

    await fetch(`${API}/habits/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchHabits();
  };

  const toggleRestDay = async (habitId: string, date: string) => {
    await fetch(`${API}/habits/${habitId}/rest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date,
      }),
    });

    fetchHabits();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const todayDay = new Date().getDate();
  const currentMonthIndex = new Date().getMonth();
  const currentYear = new Date().getFullYear();

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
      } else {
        break;
      }

      current.setDate(current.getDate() - 1);
    }

    return streak;
  }

  return (
    <div className="min-h-screen bg-[#F3E8E0] text-slate-900 px-4 md:px-6 py-6 md:py-10">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-500">
              {todayFormatted}
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Your daily habits
            </h1>
            <p className="max-w-2xl text-slate-600">
              Track your routines, keep your streaks going, and stay on top of
              every day with a clean and calm design.
            </p>
          </div>

          <div className="rounded-3xl bg-white/90 border border-slate-200 px-4 py-3 shadow-sm flex items-center gap-3">
            <button
              onClick={previousMonth}
              className="h-11 w-11 rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
            >
              ←
            </button>
            <div className="text-center">
              <p className="text-xs uppercase text-slate-500 tracking-[0.2em]">
                Month
              </p>
              <p className="font-semibold text-slate-900">
                {currentMonth.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={nextMonth}
              className="h-11 w-11 rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="rounded-[36px] bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-slate-500 text-sm uppercase tracking-[0.24em]">
                  New habit
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Add a routine
                </h2>
              </div>
              <div className="rounded-3xl bg-yellow-100 px-4 py-3 text-sm font-semibold text-amber-800">
                + Habit
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-amber-300"
                placeholder="Drink a glass of water"
              />

              <button
                onClick={addHabit}
                className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Save habit
              </button>
            </div>
          </div>

          <div className="rounded-[36px] bg-white p-6 shadow-sm border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              Weekly summary
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              Your habits are organized by month. Tap a day to mark it complete,
              rest, or clear it.
            </p>
            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Total habits</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {habits.length}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Current month</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {currentMonth.toLocaleString("default", {
                    month: "long",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[36px] bg-white p-4 shadow-sm border border-slate-200 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200/80">
                <th className="sticky left-0 z-10 bg-white px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Habit
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className={`px-3 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 ${
                      year === currentYear &&
                      month === currentMonthIndex &&
                      day === todayDay
                        ? "text-amber-600"
                        : ""
                    }`}
                  >
                    {day}
                  </th>
                ))}
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                  Remove
                </th>
              </tr>
            </thead>

            <tbody>
              {habits.map((habit) => {
                const completions = habit.completed_dates?.length || 0;
                const percentage = Math.round((completions / daysInMonth) * 100);

                return (
                  <tr
                    key={habit.id}
                    className="border-b border-slate-200/70 last:border-0"
                  >
                    <td className="sticky left-0 z-10 bg-white px-6 py-5 min-w-[260px]">
                      <div className="space-y-3">
                        <div>
                          <p className="text-base font-semibold text-slate-900">
                            {habit.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {completions} days • {percentage}%
                          </p>
                        </div>

                        <div className="rounded-3xl bg-slate-100 h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <p className="text-xs font-medium text-amber-600">
                          🔥 {calculateStreak(habit.completed_dates, habit.rest_dates)} day streak
                        </p>
                      </div>
                    </td>

                    {days.map((day) => {
                      const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const isFuture = fullDate > today;
                      const completed = habit.completed_dates?.includes(fullDate);
                      const isRest = habit.rest_dates?.includes(fullDate);

                      return (
                        <td key={day} className="px-1 py-3 text-center">
                          <button
                            disabled={isFuture}
                            onClick={async () => {
                              if (isFuture) return;

                              if (!completed && !isRest) {
                                await fetch(`${API}/habits/${habit.id}/toggle`, {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({
                                    date: fullDate,
                                  }),
                                });
                              } else {
                                await toggleRestDay(habit.id, fullDate);
                              }

                              fetchHabits();
                            }}
                            className={`mx-auto flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold transition ${
                              completed
                                ? "bg-emerald-600 text-white shadow-sm"
                                : isRest
                                ? "bg-sky-200 text-slate-900 shadow-sm"
                                : isFuture
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {completed ? "✓" : isRest ? "🌙" : ""}
                          </button>
                        </td>
                      );
                    })}

                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-white transition hover:bg-rose-400"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}