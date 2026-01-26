import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

function Pictures() {
  const [pictures, setPictures] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [caption, setCaption] = useState("");
  const [uploader, setUploader] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const picturesCollectionRef = collection(db, "pictures");

  useEffect(() => {
    const unsubscribe = onSnapshot(picturesCollectionRef, (snapshot) => {
      const pics = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      pics.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setPictures(pics);
    });
    return () => unsubscribe();
  }, []);

  const uploadPicture = async (e) => {
    e.preventDefault();
    if (!file || !uploader) {
      alert("Please select an image and enter the uploader name");
      return;
    }

    setUploading(true);
    try {
      console.log("Uploading file:", file);

      const uniqueFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, `pictures/${uniqueFileName}`);

      // Upload using uploadBytes directly for files
      await uploadBytes(storageRef, file);
      console.log("File uploaded successfully to storage");

      const url = await getDownloadURL(storageRef);
      console.log("Download URL obtained:", url);

      await addDoc(picturesCollectionRef, {
        url,
        caption,
        uploader,
        storagePath: `pictures/${uniqueFileName}`,
        createdAt: serverTimestamp(),
      });

      setFile(null);
      setFileName("");
      setCaption("");
      setUploader("");
      setShowForm(false);

      alert("Upload successful!");
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };


  const deletePicture = async (pic) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this picture?");
    if (!confirmDelete) return;

    try {
      if (pic.storagePath) {
        const fileRef = ref(storage, pic.storagePath);
        await deleteObject(fileRef);
      }

      const picDoc = doc(db, "pictures", pic.id);
      await deleteDoc(picDoc);

      setMenuOpenId(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-100 to-pink-200 p-4 font-sans">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-pink-600">Hidden Memories</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-pink-400 hover:bg-pink-500 text-white font-medium px-3 py-1 rounded text-sm"
        >
          {showForm ? "Close" : "Upload Picture"}
        </button>
      </div>

      {/* Upload Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-opacity-10 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300 ease-out">
          <div className="bg-white p-6 rounded shadow max-w-md w-full relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-pink-300"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4 text-pink-600">Upload Picture</h3>
            <form onSubmit={uploadPicture} className="space-y-3">
              <div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    if (selectedFile) {
                      if (selectedFile.size > 10 * 1024 * 1024) {
                        alert("File size must be less than 10MB");
                        e.target.value = "";
                        return;
                      }
                      setFile(selectedFile);
                      setFileName(selectedFile.name);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-block w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold text-center px-4 py-2 rounded"
                >
                  {fileName || "Choose Image (Max 10MB)"}
                </label>
              </div>
              <input
                type="text"
                placeholder="Caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full border border-pink-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Uploader name"
                value={uploader}
                onChange={(e) => setUploader(e.target.value)}
                required
                className="w-full border border-pink-300 rounded px-3 py-2"
              />
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-2 rounded disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pictures Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pictures.map((pic) => (
          <div key={pic.id} className="bg-white rounded shadow overflow-hidden relative">
            <img 
              src={pic.url} 
              alt={pic.caption || "Uploaded image"} 
              className="w-full h-60 object-cover"
              onError={(e) => {
                console.error("Image load error:", e);
                e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+";
              }}
            />
            <div className="p-2">
              <p className="text-sm font-semibold text-pink-600">{pic.caption}</p>
              <p className="text-xs text-gray-500">Uploaded by {pic.uploader}</p>
            </div>

            {/* 3 dots menu */}
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setMenuOpenId(menuOpenId === pic.id ? null : pic.id)}
                className="text-gray-600 hover:text-pink-300 text-xl bg-white bg-opacity-75 rounded-full w-8 h-8 flex items-center justify-center"
              >
                ⋮
              </button>

              {menuOpenId === pic.id && (
                <div className="absolute right-0 mt-2 bg-white border border-pink-200 rounded shadow p-2 space-y-1 z-10">
                  <button
                    onClick={() => deletePicture(pic)}
                    className="block w-full text-left text-red-500 hover:text-red-600 text-sm"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setMenuOpenId(null)}
                    className="block w-full text-left text-gray-500 hover:text-gray-600 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pictures;