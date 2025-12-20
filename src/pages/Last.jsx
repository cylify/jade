import React from "react";
import { useNavigate } from "react-router-dom";

function Last() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-100 to-pink-200 px-6 py-16 flex items-center justify-center">
      <div className="w-full max-w-xl text-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-10">
          <p className="text-2xl sm:text-3xl font-semibold text-pink-700 leading-snug">
            You don’t owe me anything for this.
          </p>

          <p className="mt-6 text-sm text-gray-700">
            I just wanted you to have it.
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-10 bg-[#32a86d] hover:bg-[#2a8f5f] text-white font-semibold px-6 py-3 rounded-full shadow-md transition"
          >
            Back to the beginning
          </button>
        </div>

        <p className="mt-6 text-xs text-[#32a86d] opacity-90">December 2025</p>
      </div>
    </div>
  );
}

export default Last;