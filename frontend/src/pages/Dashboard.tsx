import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

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

  // If today is neither completed nor a rest day,
  // start checking from yesterday.
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
      // Completed day increases streak
      streak++;
    } else if (rest.has(dateString)) {
      // Rest day keeps streak alive
    } else {
      // Empty day breaks streak
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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 to-gray-900 text-white">
        <div className="animate-pulse text-gray-400">
          Loading your dashboard...
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 text-white px-6 py-10">

      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-10">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            HabitFlow
          </h1>
          <p className="text-gray-400 text-sm">
            Build discipline, one day at a time
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/habits")}
            className="px-4 py-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition shadow-lg shadow-blue-900/30"
          >
            Habits
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* USER CARD */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-md">
        <h2 className="text-lg font-semibold mb-2">
          Welcome back 👋
        </h2>

        {user ? (
          <div className="text-gray-300 text-sm space-y-1">
            <p>
              <span className="text-gray-500">Email:</span>{" "}
              {user.email}
            </p>
            <p>
              <span className="text-gray-500">User ID:</span>{" "}
              {user.user_id}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">Loading user...</p>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:scale-[1.02] transition">
          <p className="text-gray-400 text-sm">Active Habits</p>
          <p className="text-4xl font-bold mt-2 text-blue-400">
            {activeHabits}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:scale-[1.02] transition">
          <p className="text-gray-400 text-sm">Completed Today</p>
          <p className="text-4xl font-bold mt-2 text-green-400">
            {completedToday}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:scale-[1.02] transition">
  <p className="text-gray-400 text-sm">
    Best Streak
  </p>

  <p className="text-4xl font-bold mt-2 text-orange-400">
    🔥 {bestStreak}
  </p>
</div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:scale-[1.02] transition">
 
  <p className="text-gray-400 text-sm">
    Total Completions
  </p>

  <p className="text-4xl font-bold mt-2 text-yellow-400">
    {totalCompletions}
  </p>
</div>

<div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:scale-[1.02] transition">
  <p className="text-gray-400 text-sm">
    Today's Progress
  </p>

  <p className="text-4xl font-bold mt-2 text-cyan-400">
    {progressPercentage}%
  </p>

  <div className="w-full h-2 bg-white/10 rounded-full mt-4">
    <div
      className="h-2 bg-cyan-500 rounded-full"
      style={{
        width: `${progressPercentage}%`,
      }}
    />
  </div>
</div>

<div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:scale-[1.02] transition">
  <h3 className="font-semibold mb-2">
    🏆 Most Consistent
  </h3>

  {mostConsistentHabit ? (
    <>
      <p className="text-lg font-medium">
        {mostConsistentHabit.title}
      </p>

      <p className="text-sm text-yellow-400 mt-1">
        🔥{" "}
        {calculateStreak(
          mostConsistentHabit.completed_dates || [],
          mostConsistentHabit.rest_dates || []
        )}{" "}
        day streak
      </p>
    </>
  ) : (
    <p className="text-gray-500">
      No habits yet
    </p>
  )}
</div>

<div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:scale-[1.02] transition">
  <p className="text-gray-400 text-sm">
    This Month
  </p>

  <p className="text-4xl font-bold mt-2 text-purple-400">
    {monthlyCompletions}
  </p>

  <p className="text-sm text-gray-500 mt-2">
    completions
  </p>
</div>

      </div>

      {/* HABITS PREVIEW */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Your Habits
          </h2>

          <button
            onClick={() => navigate("/habits")}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View all →
          </button>
        </div>

       {habits.length === 0 ? (
  <p className="text-gray-500">
    No habits yet. Start building your first habit 🚀
  </p>
) : (
  <div className="space-y-2">
    {habits.slice(0, 4).map((h) => (
      <div
        key={h.id}
        className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/10"
      >
        <div>
          <p className="text-gray-200 font-medium">
            {h.title}
          </p>

          <p className="text-xs text-gray-500">
            {h.completed_dates?.length || 0} completions
          </p>
        </div>

        <span className="text-sm text-yellow-400 font-medium">
          🔥 {calculateStreak(h.completed_dates || [],   h.rest_dates || [])}
        </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}