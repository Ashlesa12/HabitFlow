import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function Habits() {
  const [habits, setHabits] = useState<any[]>([]);
  const [title, setTitle] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const today = new Date().toISOString().split("T")[0];
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
const month = currentMonth.getMonth();

const daysInMonth = new Date(
  year,
  month + 1,
  0
).getDate();

const days = Array.from(
  { length: daysInMonth },
  (_, i) => i + 1
);

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
  const confirmDelete = window.confirm(
    "Delete this habit?"
  );

  if (!confirmDelete) return;

  await fetch(`${API}/habits/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  fetchHabits();
};

// toggle rest day

const toggleRestDay = async (
  habitId: string,
  date: string
) => {
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

// MONTH NAVIGATION

const previousMonth = () => {
  setCurrentMonth(
    new Date(year, month - 1, 1)
  );
};

const nextMonth = () => {
  setCurrentMonth(
    new Date(year, month + 1, 1)
  );
};

const todayDay =
  new Date().getDate();

const currentMonthIndex =
  new Date().getMonth();

const currentYear =
  new Date().getFullYear();

function calculateStreak(
  completedDates: string[],
  restDates: string[] = []
) {
  const completed = new Set(completedDates || []);
  const rest = new Set(restDates || []);

  let streak = 0;

  let current = new Date();

  const today =
    current.toISOString().split("T")[0];

  // If today is neither completed nor rest,
  // start checking from yesterday.
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

  return (
  <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 text-white px-4 md:px-6 py-6 md:py-10">

    {/* TOP BAR */}
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">

      <button
        onClick={() => navigate("/dashboard")}
        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
      >
        ← Dashboard
      </button>

      <div className="flex items-center gap-4">

        <button
          onClick={previousMonth}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition"
        >
          ←
        </button>

        <h1 className="text-xl md:text-3xl font-bold text-center">
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h1>

        <button
          onClick={nextMonth}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition"
        >
          →
        </button>

      </div>

    </div>

    {/* ADD HABIT */}
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-3">

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none"
        placeholder="Add a new habit..."
      />

      <button
        onClick={addHabit}
        className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 transition"
      >
        Add
      </button>

    </div>

    {/* HABIT TABLE */}
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">

      {/* Only mobile gets scaled */}
      <div className="max-sm:scale-[0.82] max-sm:origin-top-left">

        <table className="min-w-max w-full">

          <thead>
            <tr className="border-b border-white/10">

              <th className="sticky left-0 bg-gray-900 p-4 text-left z-10">
                Habit
              </th>

              {days.map((day) => (
                <th
  key={day}
  className={`p-2 text-center text-sm ${
    year === currentYear &&
    month === currentMonthIndex &&
    day === todayDay
      ? "bg-blue-500/20 text-blue-300"
      : ""
  }`}
>
  {day}
</th>
              ))}

              <th className="p-3">
                Delete
              </th>

            </tr>
          </thead>

          <tbody>

           {habits.map((habit) => {

  const completions =
    habit.completed_dates?.length || 0;

  const percentage =
    Math.round(
      (completions / daysInMonth) * 100
    );

  return (

    <tr
      key={habit.id}
      className="border-b border-white/5"
    >

    <td className="sticky left-0 bg-gray-900 p-4 min-w-32.5">
  <p className="font-medium">
    {habit.title}
  </p>

  <p className="text-xs text-yellow-400 mt-1">
    🔥 {calculateStreak(habit.completed_dates, habit.rest_dates)} day streak
  </p>

  <p className="text-xs text-gray-400">
    {completions} days • {percentage}%
  </p>

  <div className="w-full h-2 bg-white/10 rounded-full mt-2">
    <div
      className="h-2 bg-green-500 rounded-full"
      style={{
        width: `${percentage}%`,
      }}
    />
  </div>
</td>

                {/* DAYS */}
                {days.map((day) => {

                  const fullDate =
                    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isFuture = fullDate > today;
                  const completed =
                    habit.completed_dates?.includes(fullDate);

                    const isRest =
                    habit.rest_dates?.includes(fullDate);

                  return (
                    <td
                      key={day}
                      className="text-center p-1"
                    >
                      <button
  disabled={isFuture}
  onClick={async () => {
  if (isFuture) return;

  if (!completed && !isRest) {
    // Empty → Completed
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
  }

  else if (completed) {
    // Completed → Rest
    await toggleRestDay(
      habit.id,
      fullDate
    );
  }

  else if (isRest) {
    // Rest → Empty
    await toggleRestDay(
      habit.id,
      fullDate
    );
  }

  fetchHabits();
}}

  className={`w-8 h-8 rounded-lg transition ${
    completed
      ? "bg-green-500 text-white"
      : isRest
      ? "bg-blue-500 text-white"
      : isFuture
      ? "bg-white/5 text-gray-600 cursor-not-allowed"
      : "bg-white/10 hover:bg-white/20"
  }`}
>
  {completed
  ? "✓"
  : isRest
  ? "🌙"
  : ""}
</button>
                    </td>
                  );
                })}

                {/* DELETE */}
                <td className="p-2 text-center">
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="px-3 py-2 rounded-lg bg-red-700 hover:bg-red-600 transition"
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