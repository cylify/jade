import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

function Wishlist() {
  const [wishes, setWishes] = useState([]);
  const [newWish, setNewWish] = useState({
    title: "",
    description: "",
    imageUrl: "",
    link: "",
    isGifted: false
  });
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("wishes");
  const [menuOpenId, setMenuOpenId] = useState(null);

  const wishesCollectionRef = collection(db, "wishes");
  const titleInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(wishesCollectionRef, (snapshot) => {
      setWishes(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showForm && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [showForm]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") closeForm();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const addWish = async (e) => {
    e.preventDefault();
    await addDoc(wishesCollectionRef, newWish);
    closeForm();
  };

  const closeForm = () => {
    setShowForm(false);
    setNewWish({ title: "", description: "", imageUrl: "", link: "", isGifted: false });
  };

  const editWish = async (id, currentTitle, currentDescription) => {
    const updatedTitle = prompt("Enter new title:", currentTitle);
    const updatedDescription = prompt("Enter new description:", currentDescription);

    if (updatedTitle !== null && updatedDescription !== null) {
      const wishDoc = doc(db, "wishes", id);
      await updateDoc(wishDoc, {
        title: updatedTitle,
        description: updatedDescription
      });
    }
  };

  const deleteWish = async (id) => {
    const wishDoc = doc(db, "wishes", id);
    await deleteDoc(wishDoc);
  };

  const markGifted = async (id, currentStatus) => {
    const wishDoc = doc(db, "wishes", id);
    await updateDoc(wishDoc, { isGifted: !currentStatus });
  };

  const fetchImageFromLink = async () => {
    if (!newWish.link) {
      alert("Please enter a product link first.");
      return;
    }
    try {
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(newWish.link)}`);
      const data = await res.json();
      const imageUrl = data.data.image.url;
      setNewWish({ ...newWish, imageUrl });
      alert("Image fetched!");
    } catch (error) {
      console.error(error);
      alert("Failed to fetch image.");
    }
  };

  const filteredWishes = activeTab === "wishes" ? wishes.filter(w => !w.isGifted) : wishes.filter(w => w.isGifted);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-100 to-pink-200 p-4 font-sans">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-pink-600">Your Wishlist</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-pink-400 hover:bg-pink-500 text-white font-medium px-3 py-1 rounded text-sm"
        >
          Add Wish
        </button>
      </div>

      <div className="flex justify-center mb-6 relative">
        <div className="absolute bottom-0 w-full h-px bg-pink-300 shadow-inner"></div>

        {/* Wishes Tab */}
        <button
          onClick={() => setActiveTab("wishes")}
          className={`relative px-4 py-2 font-medium focus:outline-none focus:ring-0 ${
            activeTab === "wishes"
              ? "text-pink-600 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-pink-500 after:shadow after:rounded-full"
              : "text-pink-500 hover:text-pink-600"
          }`}
          style={{ backgroundColor: "transparent", outline: "none", boxShadow: "none", border: "none"}}
        >
          Wishes
        </button>

        {/* Gifted Tab */}
        <button
          onClick={() => setActiveTab("gifted")}
          className={`relative px-4 py-2 font-medium focus:outline-none focus:ring-0 ${
            activeTab === "gifted"
              ? "text-pink-600 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-pink-500 after:shadow after:rounded-full"
              : "text-pink-500 hover:text-pink-600"
          }`}
          style={{ backgroundColor: "transparent", outline: "none", boxShadow: "none", border: "none"}}
        >
          Gifted
        </button>

      </div>


      {/* Wishes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
        {filteredWishes.map((wish) => (
          <div key={wish.id} className="bg-white border border-pink-200 rounded-lg p-4 shadow relative min-w-60 min-h-50">
            {/* Three dots menu */}
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setMenuOpenId(wish.id === menuOpenId ? null : wish.id)}
                className="cursor-pointer text-gray-500 text-xs hover:text-pink-400 focus:outline-none bg-transparent border-none shadow-none p-0 m-0"
                style={{ background: "none" }}
              >
                •••
              </button>

              {menuOpenId === wish.id && (
                <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow z-10">
                  <button onClick={() => deleteWish(wish.id)} className="w-full text-left text-red-500 px-3 py-1 hover:bg-red-50 text-sm bg-transparent">Delete Wish</button>
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold text-pink-600 mb-1">{wish.title}</h3>
            <p className="text-gray-700 mb-1 text-sm">{wish.description}</p>
            {wish.imageUrl && <img src={wish.imageUrl} alt={wish.title} className="w-full rounded mb-1" />}
            {wish.link && <p><a href={wish.link} target="_blank" rel="noreferrer" className="text-pink-500 underline text-sm">Product Link</a></p>}

            <div className="flex gap-2 mt-2">
              <button onClick={() => editWish(wish.id, wish.title, wish.description)} className="bg-gray-900 px-2 py-1 rounded text-xs text-white hover:text-pink-300">Edit</button>
              <button
                onClick={() => markGifted(wish.id, wish.isGifted)}
                className={`px-2 py-1 rounded text-xs ${wish.isGifted ? "bg-gray-900 text-white hover:text-pink-300" : "bg-gray-900 text-white hover:text-pink-300"}`}
              >
                {wish.isGifted ? "Unmark" : "Gifted"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-opacity-10 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300 ease-out">
          <div className="bg-white p-6 rounded shadow max-w-md w-full relative">
            <button
              onClick={closeForm}
              className="absolute top-2 right-2 text-gray-600 hover:text-pink-300"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-4 text-pink-600">Add a Wish</h3>

            <form onSubmit={addWish} className="space-y-3">
              <input
                ref={titleInputRef}
                type="text"
                placeholder="Title"
                value={newWish.title}
                onChange={(e) => setNewWish({ ...newWish, title: e.target.value })}
                required
                className="w-full border border-pink-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-pink-200 text-gray-800"
              />
              <input
                type="text"
                placeholder="Description"
                value={newWish.description}
                onChange={(e) => setNewWish({ ...newWish, description: e.target.value })}
                className="w-full border border-pink-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-pink-200 text-gray-800"
              />
              <input
                type="text"
                placeholder="Product Link"
                value={newWish.link}
                onChange={(e) => setNewWish({ ...newWish, link: e.target.value })}
                className="w-full border border-pink-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-pink-200 text-gray-800"
              />

              <button
                type="button"
                onClick={fetchImageFromLink}
                className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-2 rounded"
              >
                Fetch Image From Link
              </button>

              {newWish.imageUrl && (
                <img src={newWish.imageUrl} alt="Preview" className="w-32 mx-auto mt-2 rounded" />
              )}

              <button
                type="submit"
                className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-2 rounded"
              >
                Add Wish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wishlist;