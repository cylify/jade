import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function MySinging() {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const SONG_SRC = "/songs/aamarvinsroom.mp3";

  const [isPlaying, setIsPlaying] = useState(false);
  const [canAutoplay, setCanAutoplay] = useState(false);

  // Try autoplay (usually blocked until user interaction).
  useEffect(() => {
    const tryAutoplay = async () => {
      if (!audioRef.current) return;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setCanAutoplay(true);
      } catch {
        // Autoplay blocked — normal.
        setCanAutoplay(false);
      }
    };
    tryAutoplay();
  }, []);

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;

    if (a.paused) {
      try {
        await a.play();
        setIsPlaying(true);
      } catch {
        // If something goes wrong, just do nothing.
      }
    } else {
      a.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-100 to-pink-200 px-6 py-16 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-pink-700 mb-2">
            My Singing
          </h1>

          <p className="text-pink-600 mb-6">
          </p>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={togglePlay}
              className="bg-[#32a86d] hover:bg-[#2a8f5f] text-white font-semibold px-6 py-3 rounded-full shadow-md transition"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            {/* Optional hint if autoplay is blocked */}
            {!canAutoplay && !isPlaying && (
              <p className="text-xs text-gray-600">
                (Your browser might block autoplay, press play.)
              </p>
            )}

            {/* Keep controls hidden for a clean look; audio is controlled by the button */}
            <audio ref={audioRef} src={SONG_SRC} preload="auto" />

            <p className="text-sm text-gray-700 leading-relaxed mt-4">
              It might be terrible but I did my best...
              <br />
              I just wanted you to have it.
              <br />
              I tried my best singing okay?
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 text-pink-600 hover:text-pink-800 underline underline-offset-4"
            >
              Back home
            </button>
            <p className="mt-4 text-xs text-gray-600">
              If you’re still here,&nbsp;
              <button
                onClick={() => navigate("/last")}
                className="underline underline-offset-4 hover:text-pink-700"
              >
                one last thing
              </button>
              .
            </p>

          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#32a86d] opacity-90">
          December 2025
        </p>
      </div>
    </div>
  );
}

export default MySinging;