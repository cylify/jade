import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Timer() {
  const navigate = useNavigate();

  // ✅ Set the moment you want the timer to start from.
  // Change this to the date/time you told her you'd wait, or any meaningful moment.
  // Example: Dec 20, 2025 at midnight Toronto time (-05:00)
  const START_ISO = "2025-12-18T09:25:00-05:00";

  const startDate = useMemo(() => new Date(START_ISO), []);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diffMs = Math.max(0, now.getTime() - startDate.getTime());

  const totalSeconds = Math.floor(diffMs / 1000);
  const seconds = totalSeconds % 60;

  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;

  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;

  const totalDays = Math.floor(totalHours / 24);

  // Optional: show years/months-ish (approx) without heavy date libs
  const years = Math.floor(totalDays / 365);
  const daysRemainder = totalDays % 365;

  const pad2 = (n) => String(n).padStart(2, "0");

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-100 to-pink-200 px-6 py-16 flex items-center justify-center">
      <div className="w-full max-w-xl text-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-2">
            I’ll wait.
          </h1>

          <p className="text-pink-600 mb-8">
            Just to let you know
          </p>

          <div className="rounded-xl bg-white/70 p-6 shadow-inner">
            <div className="text-sm text-gray-600 mb-2">Time since I said it</div>

            {/* Main timer display */}
            <div className="font-mono text-3xl sm:text-4xl text-[#32a86d] tracking-wide">
              {years > 0 ? `${years}y ${daysRemainder}d` : `${totalDays}d`}{" "}
              {pad2(hours)}:{pad2(minutes)}:{pad2(seconds)}
            </div>

            <div className="text-xs text-gray-600 mt-2">
              {startDate.toLocaleString()}
            </div>
          </div>

          <button
            onClick={() => navigate("/empty")}
            className="mt-10 bg-[#32a86d] hover:bg-[#2a8f5f] text-white font-semibold px-6 py-3 rounded-full shadow-md transition"
          >
            Continue
          </button>

          <div className="mt-6 text-xs text-gray-600">
            (Just me keeping my word.)
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-6 text-pink-600 hover:text-pink-800 underline underline-offset-4"
        >
          Back home
        </button>
      </div>
    </div>
  );
}

export default Timer;