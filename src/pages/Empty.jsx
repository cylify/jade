import React from "react";
import { useNavigate } from "react-router-dom";

function Empty() {
  const navigate = useNavigate();
  const petals = Array.from({ length: 18 });

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-pink-100 to-pink-200 flex items-center justify-center">
      {/* Soft petals (lighter than Home) */}
      {petals.map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}vw`,
            top: `-${Math.random() * 30}vh`,
            animation: `fall ${8 + Math.random() * 6}s linear infinite`,
            animationDelay: `${Math.random() * 6}s`,
            opacity: 0.6,
          }}
        >
          <div
            className="rounded-full bg-pink-300"
            style={{
              width: `${8 + Math.random() * 12}px`,
              height: `${8 + Math.random() * 12}px`,
              animation: `sway ${4 + Math.random() * 3}s ease-in-out infinite alternate`,
              borderRadius: "50% 50% 50% 50%",
              filter: "blur(0.2px)",
            }}
          />
        </div>
      ))}

      {/* A single quiet “dot” so it doesn't feel broken */}
      <div className="z-10 flex flex-col items-center gap-6">
        <div className="w-2 h-2 rounded-full bg-[#32a86d] opacity-70 animate-pulse" />

        <button
            onClick={() => navigate("/jaan")}
            className="text-pink-600 hover:text-pink-800 underline underline-offset-4 text-sm"
            >
            continue
        </button>

        <button
          onClick={() => navigate(-1)}
          className="text-pink-600 hover:text-pink-800 underline underline-offset-4 text-sm"
        >
          back
        </button>
      </div>


      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(0vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
          }
          @keyframes sway {
            0% { transform: translateX(0px); }
            100% { transform: translateX(18px); }
          }
        `}
      </style>
    </div>
  );
}

export default Empty;