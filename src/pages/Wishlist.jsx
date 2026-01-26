import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "firebase/firestore";

const TYPE_OPTIONS = [
  { value: "memory", label: "Memory" },
  { value: "place", label: "Place" },
  { value: "song", label: "Song" },
  { value: "idea", label: "Idea" },
  { value: "gift", label: "Gift (small)" }
];

function Wishlist() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    link: "",
    type: "memory",
    // Keeping your existing DB field name so you don't have to migrate:
    isGifted: false
  });

  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("now"); // "now" | "saved"
  const [menuOpenId, setMenuOpenId] = useState(null);

  const colRef = collection(db, "wishes");
  const titleInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      setItems(snapshot.docs.map((d) => ({ ...d.data(), id: d.id })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showForm && titleInputRef.current) titleInputRef.current.focus();
  }, [showForm]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") closeForm();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const closeForm = () => {
    setShowForm(false);
    setNewItem({
      title: "",
      description: "",
      link: "",
      type: "memory",
      isGifted: false
    });
  };

  const addItem = async (e) => {
    e.preventDefault();
    await addDoc(colRef, {
      ...newItem,
      createdAt: Date.now()
    });
    closeForm();
  };

  const editItem = async (id, currentTitle, currentDescription) => {
    const updatedTitle = prompt("Edit title:", currentTitle);
    const updatedDescription = prompt("Edit note:", currentDescription);

    if (updatedTitle !== null && updatedDescription !== null) {
      await updateDoc(doc(db, "wishes", id), {
        title: updatedTitle,
        description: updatedDescription
      });
    }
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, "wishes", id));
  };

  const toggleSaved = async (id, currentStatus) => {
    // still using isGifted under the hood
    await updateDoc(doc(db, "wishes", id), { isGifted: !currentStatus });
  };

  const filtered =
    activeTab === "now"
      ? items.filter((x) => !x.isGifted)
      : items.filter((x) => x.isGifted);

  const typeLabel = (value) =>
    TYPE_OPTIONS.find((t) => t.value === value)?.label ?? "Note";

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-100 to-pink-200 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-pink-700">Little Things</h2>
            <p className="text-sm text-gray-700 mt-1 max-w-2xl">
              This isn’t about buying anything. It’s just how I remember.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="bg-[#32a86d] hover:bg-[#2a8f5f] text-white font-semibold px-4 py-2 rounded-full shadow transition"
          >
            Add
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 relative">
          <div className="absolute bottom-0 w-full h-px bg-pink-300/70" />

          <button
            onClick={() => setActiveTab("now")}
            className={`relative px-4 py-2 font-medium bg-transparent border-none ${
              activeTab === "now"
                ? "text-pink-700 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-pink-600 after:rounded-full"
                : "text-pink-500 hover:text-pink-700"
            }`}
          >
            Now
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`relative px-4 py-2 font-medium bg-transparent border-none ${
              activeTab === "saved"
                ? "text-pink-700 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-pink-600 after:rounded-full"
                : "text-pink-500 hover:text-pink-700"
            }`}
          >
            Saved
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white/85 backdrop-blur border border-pink-200 rounded-2xl p-5 shadow-sm relative"
            >
              {/* menu */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={() =>
                    setMenuOpenId(item.id === menuOpenId ? null : item.id)
                  }
                  className="cursor-pointer text-gray-500 text-sm hover:text-pink-500 bg-transparent border-none"
                >
                  •••
                </button>

                {menuOpenId === item.id && (
                  <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow z-10 overflow-hidden">
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="w-full text-left text-red-600 px-4 py-2 hover:bg-red-50 text-sm bg-transparent"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* type badge */}
              <div className="text-xs text-[#32a86d] font-semibold mb-2">
                {typeLabel(item.type)}
              </div>

              <h3 className="text-lg font-bold text-pink-700 mb-2">
                {item.title}
              </h3>

              {item.description && (
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  {item.description}
                </p>
              )}

              {/* link (optional, subtle) */}
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-pink-600 hover:text-pink-800 underline underline-offset-4"
                >
                  reference
                </a>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => editItem(item.id, item.title, item.description)}
                  className="px-3 py-1.5 rounded-full text-xs bg-gray-900 text-white hover:text-pink-200 transition"
                >
                  Edit
                </button>

                <button
                  onClick={() => toggleSaved(item.id, item.isGifted)}
                  className="px-3 py-1.5 rounded-full text-xs bg-gray-900 text-white hover:text-pink-200 transition"
                >
                  {item.isGifted ? "Unsave" : "Save"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full relative">
              <button
                onClick={closeForm}
                className="absolute top-3 right-3 text-gray-600 hover:text-pink-500"
              >
                ✕
              </button>

              <h3 className="text-2xl font-bold mb-2 text-pink-700">
                Add a little thing
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                A memory, a place, a song, an idea, anything I don’t want to forget.
              </p>

              <form onSubmit={addItem} className="space-y-3">
                <select
                  value={newItem.type}
                  onChange={(e) =>
                    setNewItem({ ...newItem, type: e.target.value })
                  }
                  className="w-full border border-pink-200 rounded-xl px-3 py-2 focus:outline-none focus:ring focus:ring-pink-200 text-gray-800"
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <input
                  ref={titleInputRef}
                  type="text"
                  placeholder="Title (short)"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  required
                  className="w-full border border-pink-200 rounded-xl px-3 py-2 focus:outline-none focus:ring focus:ring-pink-200 text-gray-800"
                />

                <textarea
                  placeholder="Note (optional)"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-pink-200 rounded-xl px-3 py-2 focus:outline-none focus:ring focus:ring-pink-200 text-gray-800"
                />

                <input
                  type="text"
                  placeholder="Reference link (optional)"
                  value={newItem.link}
                  onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                  className="w-full border border-pink-200 rounded-xl px-3 py-2 focus:outline-none focus:ring focus:ring-pink-200 text-gray-800"
                />

                <button
                  type="submit"
                  className="w-full bg-[#32a86d] hover:bg-[#2a8f5f] text-white font-semibold py-2.5 rounded-xl shadow transition"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-gray-600">
          You don’t owe me anything for knowing these. (You practically told me all of this anyways)
        </p>
      </div>
    </div>
  );
}

export default Wishlist;
