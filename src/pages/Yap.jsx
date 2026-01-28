import React, { useEffect, useMemo, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const yapsCollectionRef = collection(db, "yaps");
const ADI_UID = "1Gvr1MdzC9e6ovjIHD9HVLjdfhl2";

function Yap() {
  const [yaps, setYaps] = useState([]);
  const [newYap, setNewYap] = useState("");
  const [share, setShare] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setYaps([]);
        return;
      }

      const ownQuery = query(yapsCollectionRef, where("ownerUid", "==", user.uid));

      const sharedToAdiQuery = query(
        yapsCollectionRef,
        where("shared", "==", true),
        where("sharedToUid", "==", ADI_UID)
      );

      const ownUnsub = onSnapshot(
        ownQuery,
        (snapshot) => {
          const own = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));

          setYaps((prev) => {
            const sharedOthers = prev.filter(
              (y) => y.ownerUid !== user.uid && y.sharedToUid === ADI_UID && y.shared === true
            );
            return [...own, ...sharedOthers];
          });
        },
        (err) => console.error("OWN query snapshot error:", err)
      );

      const sharedUnsub = onSnapshot(
        sharedToAdiQuery,
        (snapshot) => {
          const shared = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));

          setYaps((prev) => {
            const own = prev.filter((y) => y.ownerUid === user.uid);
            return [...own, ...shared];
          });
        },
        (err) => console.error("SHARED query snapshot error:", err)
      );

      return () => {
        ownUnsub();
        sharedUnsub();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  // Merge duplicates and sort newest-first safely
  const mergedYaps = useMemo(() => {
    const map = new Map();
    for (const y of yaps) map.set(y.id, y);

    const toMs = (t) => {
      if (!t) return 0;
      if (typeof t.toMillis === "function") return t.toMillis(); // Firestore Timestamp
      if (t.seconds) return t.seconds * 1000; // Timestamp-like
      const d = new Date(t);
      return Number.isNaN(d.getTime()) ? 0 : d.getTime();
    };

    return Array.from(map.values()).sort((a, b) => toMs(b.timestamp) - toMs(a.timestamp));
  }, [yaps]);

  const addYap = async (e) => {
    e.preventDefault();

    if (!newYap.trim()) {
      alert("Please enter your thought.");
      return;
    }

    if (!auth.currentUser) {
      alert("You must be logged in to post a message.");
      return;
    }

    await addDoc(yapsCollectionRef, {
      text: newYap.trim(),
      timestamp: serverTimestamp(),
      ownerUid: auth.currentUser.uid,
      shared: share,
      sharedToUid: share ? ADI_UID : null,
    });

    setNewYap("");
    setShare(false);
  };

  const deleteYap = async (id) => {
    await deleteDoc(doc(db, "yaps", id));
  };

  const toggleShare = async (yap) => {
    const nextShared = !yap.shared;

    await updateDoc(doc(db, "yaps", yap.id), {
      shared: nextShared,
      sharedToUid: nextShared ? ADI_UID : null,
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-100 to-pink-200 p-4 font-sans">
      <h2 className="text-3xl font-bold text-pink-600 mb-4 text-center">
        Missed Messages
      </h2>

      <p className="text-sm font-semibold text-pink-600 mb-6 text-center">
        A private place to put your thoughts.
        <br />
        <span className="font-normal text-pink-500">
          I can’t see anything unless you choose to share it.
        </span>
      </p>

      {/* Add Yap Form */}
      <form
        onSubmit={addYap}
        className="bg-white p-4 rounded shadow mb-6 max-w-xl mx-auto space-y-3"
      >
        <textarea
          placeholder="Write what you'd like, at your own time..."
          value={newYap}
          onChange={(e) => setNewYap(e.target.value)}
          rows={5}
          className="w-full border border-pink-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-pink-200 text-gray-800"
        />

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={share}
            onChange={(e) => setShare(e.target.checked)}
          />
          <label className="text-sm text-gray-700">Share this with Adi</label>
        </div>

        <button
          type="submit"
          className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-2 rounded"
        >
          Post
        </button>
      </form>

      {/* Yap List */}
      <div className="max-w-xl mx-auto space-y-4">
        {mergedYaps.map((yap) => (
          <div
            key={yap.id}
            className="bg-white border border-pink-200 rounded p-4 shadow relative"
          >
            <p className="text-gray-800 whitespace-pre-wrap">{yap.text}</p>

            {/* Only owner can manage */}
            {yap.ownerUid === auth.currentUser?.uid && (
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => toggleShare(yap)}
                  className="!text-[#32a86d] hover:!text-[#2a8f5f] text-sm"
                >
                  {yap.shared ? "Unshare" : "Share"}
                </button>
                <button
                  onClick={() => deleteYap(yap.id)}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Yap;
