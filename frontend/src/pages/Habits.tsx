import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

export default function Habits() {
  const [habits, setHabits] = useState<any[]>([]);
  const [title, setTitle] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const today = new Date().toISOString().split("T")[0];

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

  const completeHabit = async (id: string) => {
    await fetch(`${API}/habits/${id}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchHabits();
  };

  const undoHabit = async (id: string) => {
    await fetch(`${API}/habits/${id}/undo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchHabits();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 text-white px-6 py-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Habits</h1>
          <p className="text-gray-400 text-sm">
            Track consistency, build discipline
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10"
        >
          ← Dashboard
        </button>
      </div>

      {/* ADD HABIT */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 backdrop-blur-md flex gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Write a new habit..."
        />

        <button
          onClick={addHabit}
          className="px-6 py-3 rounded-xl bg-linear-to-r from-green-500 to-emerald-600 hover:opacity-90 transition shadow-lg shadow-green-900/30"
        >
          Add
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-4">

        {habits.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            No habits yet. Start building your first one 🚀
          </div>
        ) : (
          habits.map((h) => {
            const isDoneToday = h.completed_dates?.includes(today);

            return (
              <div
                key={h.id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5 hover:scale-[1.01] transition"
              >

                {/* LEFT */}
                <div>
                  <p className="text-lg font-semibold text-white">
                    {h.title}
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    🔥 Streak:{" "}
                    <span className="text-yellow-400 font-medium">
                      {h.streak}
                    </span>
                  </p>
                </div>

                {/* RIGHT BUTTONS */}
                <div className="flex gap-2">

                  {!isDoneToday ? (
                    <button
                      onClick={() => completeHabit(h.id)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-sm"
                    >
                      Done ✓
                    </button>
                  ) : (
                    <button
                      onClick={() => undoHabit(h.id)}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition text-sm"
                    >
                      Undo ↩
                    </button>
                  )}

                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}