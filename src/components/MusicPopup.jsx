import React, { useState, useRef } from "react";

const songs = [
  {
    name: "Love in December",
    artist: "Club 8",
    url: "/songs/love_in_december.mp3",
  },
  {
    name: "Spin Bout U",
    artist: "Drake, 21 Savage",
    url: "/songs/spin_bout_u.mp3",
  },
  {
    name: "Marvin's Room",
    artist: "Drake",
    url: "/songs/marvins_room.mp3",
  },
  {
    name: "All of Me",
    artist: "John Legend",
    url: "/songs/all_of_me.mp3",
  },
  {
    name: "again",
    artist: "Gunna",
    url: "/songs/again.mp3",
  },
  {
    name: "Everlong",
    artist: "Foo Fighters",
    url: "/songs/everlong.mp3",
  },
  {
    name: "Still into You",
    artist: "Paramore",
    url: "/songs/everlong.mp3",
  },
  {
    name: "Bad Bad Bad",
    artist: "Young Thug, Lil Baby",
    url: "/songs/badbadbad.mp3",
  },
  {
    name: "One Last Time",
    artist: "Ariana Grande",
    url: "/songs/one_last_time.mp3",
  },
  {
    name: "From A Man",
    artist: "Young Thug",
    url: "/songs/from_a_man.mp3",
  },
];

function MusicPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = (song) => {
    if (currentSong?.url === song.url) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    } else {
      setCurrentSong(song);
      setTimeout(() => {
        audioRef.current.play();
      }, 0);
    }
  };

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    audioRef.current.muted = newMuted;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating music bars icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-2 rounded shadow bg-center"
      >
        ≡
      </button>

      {/* Popup UI */}
      {isOpen && (
        <div className="bg-white border border-pink-200 rounded shadow p-4 mt-2 max-w-xs w-72">
          <h3 className="text-pink-600 font-bold mb-2">Music</h3>

          {/* Songs list with scroll */}
          <div className="max-h-48 overflow-y-auto space-y-2">
            {songs.map((song, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center border-b pb-1"
              >
                <div>
                  <p className="font-medium">{song.name}</p>
                  <p className="text-xs text-gray-500">{song.artist}</p>
                </div>
                <button
                  onClick={() => togglePlay(song)}
                  className="text-pink-500 hover:text-pink-700 text-sm"
                >
                  {currentSong?.url === song.url && !audioRef.current?.paused ? "⏸️" : "▶️"}
                </button>
              </div>
            ))}
          </div>

          {/* Volume controls */}
          <div className="flex items-center mt-3 space-x-2">
            <button onClick={toggleMute} className="text-pink-500 hover:text-pink-700">
              {muted ? "🔇" : "🔊"}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-grow accent-pink-500"
            />
          </div>
        </div>
      )}

      {/* Audio player (always mounted) */}
      <audio ref={audioRef} src={currentSong?.url} />
    </div>
  );
}

export default MusicPopup;