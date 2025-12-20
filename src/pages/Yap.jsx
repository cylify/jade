import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { query, where } from "firebase/firestore";

const yapsCollectionRef = collection(db, "yaps");

function Yap() {
  const [yaps, setYaps] = useState([]);
  const [newYap, setNewYap] = useState("");
  const [share, setShare] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return; // not logged in

      const ownQuery = query(yapsCollectionRef, where("ownerUid", "==", user.uid));
      const sharedQuery = query(yapsCollectionRef, where("shared", "==", true));

      const ownUnsub = onSnapshot(ownQuery, (snapshot) => {
        setYaps(prev => {
          const others = prev.filter(y => y.ownerUid !== user.uid);
          const ownYaps = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          return [...others, ...ownYaps];
        });
      });

      const sharedUnsub = onSnapshot(sharedQuery, (snapshot) => {
        setYaps(prev => {
          const own = prev.filter(y => y.ownerUid === user.uid);
          const sharedYaps = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          return [...own, ...sharedYaps];
        });
      });

      return () => {
        ownUnsub();
        sharedUnsub();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  const addYap = async (e) => {
    e.preventDefault();
    if (!newYap) {
      alert("Please enter your poem or thought.");
      return;
    }

    if (!auth.currentUser) {
      alert("You must be logged in to post a yap.");
      return;
    }

    await addDoc(yapsCollectionRef, {
      text: newYap,
      timestamp: new Date(),
      ownerUid: auth.currentUser.uid,
      shared: share,
    });
    setNewYap("");
    setShare(false);
  };

  const deleteYap = async (id) => {
    const yapDoc = doc(db, "yaps", id);
    await deleteDoc(yapDoc);
  };

  const toggleShare = async (yap) => {
    const yapDoc = doc(db, "yaps", yap.id);
    await updateDoc(yapDoc, { shared: !yap.shared });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-100 to-pink-200 p-4 font-sans">
      <h2 className="text-3xl font-bold text-pink-600 mb-6 text-center">Missed Messages</h2>
      <p className="text-xm font-bold text-pink-600 mb-6 text-center">
        For when you need to let your thoughts out. (P.S. I can't see it unless you choose to share. It's your private place.)
      </p>

      {/* Add Yap Form */}
      <form onSubmit={addYap} className="bg-white p-4 rounded shadow mb-6 max-w-xl mx-auto space-y-3">
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
          Post Yap
        </button>
      </form>

      {/* Yap List */}
      <div className="max-w-xl mx-auto space-y-4">
        {yaps
          .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)
          .map((yap) => (
          <div key={yap.id} className="bg-white border border-pink-200 rounded p-4 shadow relative">
            <p className="text-gray-800 whitespace-pre-wrap">{yap.text}</p>

            {yap.ownerUid === auth.currentUser?.uid && (
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => toggleShare(yap)}
                  className="text-blue-500 hover:text-blue-600 text-sm"
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