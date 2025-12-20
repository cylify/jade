import React, { useRef, useState, useEffect } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { storage, db } from "../firebase";
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, onSnapshot, serverTimestamp, deleteDoc, doc } from "firebase/firestore";

function Drawing() {
  const canvasRef = useRef(null);
  const [drawings, setDrawings] = useState([]);
  const [brushColor, setBrushColor] = useState("#d63384");
  const [title, setTitle] = useState("");

  // Canvas size states
  const [canvasWidth, setCanvasWidth] = useState(600);
  const [canvasHeight, setCanvasHeight] = useState(400);
  const [inputWidth, setInputWidth] = useState(600);
  const [inputHeight, setInputHeight] = useState(400);

  const drawingsCollectionRef = collection(db, "drawings");

  useEffect(() => {
    const unsubscribe = onSnapshot(drawingsCollectionRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setDrawings(data);
    });
    return () => unsubscribe();
  }, []);

  const saveDrawing = async () => {
    const canvas = canvasRef.current;
    const dataUrl = await canvas.exportImage("png");

    const filename = `${Date.now()}.png`;
    const storagePath = `drawings/${filename}`;
    const storageRef = ref(storage, storagePath);

    await uploadString(storageRef, dataUrl, "data_url");
    const url = await getDownloadURL(storageRef);

    await addDoc(drawingsCollectionRef, {
      url,
      storagePath, // Save storage path for deletion
      title,
      createdAt: serverTimestamp(),
    });

    await canvas.clearCanvas();
    setTitle("");
  };

  const downloadDrawing = async () => {
    const canvas = canvasRef.current;
    const dataUrl = await canvas.exportImage("png");

    const link = document.createElement("a");
    link.download = `drawing_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const deleteDrawing = async (id, storagePath) => {
    const confirmDelete = window.confirm("Delete this drawing?");
    if (!confirmDelete) return;

    try {
      // Delete from storage
      if (storagePath) {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      }

      // Delete from Firestore
      const docRef = doc(db, "drawings", id);
      await deleteDoc(docRef);

    } catch (error) {
      console.error("Delete error:", error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  const applyCanvasSize = () => {
    setCanvasWidth(inputWidth);
    setCanvasHeight(inputHeight);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-100 to-pink-200 p-8 flex flex-col items-center font-sans">
      <h2 className="text-3xl font-bold text-pink-600 mb-4">Drawing Pad</h2>
      <p className="mb-8">DOODLING!!</p>

      <div className="bg-white p-4 rounded shadow mb-6">
        <ReactSketchCanvas
          ref={canvasRef}
          width={`${canvasWidth}px`}
          height={`${canvasHeight}px`}
          strokeColor={brushColor}
          strokeWidth={2}
          className="rounded border border-pink-300"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-2">
          <input
            type="text"
            placeholder="Title / Note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-pink-300 rounded px-3 py-2 w-full sm:w-auto"
          />

          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="w-10 h-10 p-0 border-none cursor-pointer"
          />
        </div>

        {/* Canvas size controls */}
        <div className="flex flex-wrap items-center justify-between mt-3 gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="width" className="text-pink-600">Width:</label>
            <input
              id="width"
              type="number"
              min="100"
              max="2000"
              value={inputWidth}
              onChange={(e) => setInputWidth(parseInt(e.target.value))}
              className="border border-pink-300 rounded px-2 py-1 w-24"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="height" className="text-pink-600">Height:</label>
            <input
              id="height"
              type="number"
              min="100"
              max="2000"
              value={inputHeight}
              onChange={(e) => setInputHeight(parseInt(e.target.value))}
              className="border border-pink-300 rounded px-2 py-1 w-24"
            />
          </div>
          <button
            onClick={applyCanvasSize}
            className="bg-pink-400 hover:bg-pink-500 text-white px-3 py-1 rounded"
          >
            Set Size
          </button>
        </div>

        <div className="flex flex-wrap justify-between mt-3 gap-2">
          <button
            onClick={() => canvasRef.current.clearCanvas()}
            className="bg-pink-400 hover:bg-pink-500 text-white px-3 py-1 rounded"
          >
            Clear
          </button>
          <button
            onClick={() => canvasRef.current.undo()}
            className="bg-pink-400 hover:bg-pink-500 text-white px-3 py-1 rounded"
          >
            Undo
          </button>
          <button
            onClick={downloadDrawing}
            className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded"
          >
            Download
          </button>
          <button
            onClick={saveDrawing}
            className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded"
          >
            Save
          </button>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-pink-500 mb-4">Saved Drawings</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {drawings.map((draw) => (
          <div key={draw.id} className="bg-white p-2 rounded shadow flex flex-col items-center relative">
            <button
              onClick={() => deleteDrawing(draw.id, draw.storagePath)}
              className="absolute top-2 right-2 text-pink-400 hover:text-pink-600 text-xl"
            >
              ⋮
            </button>
            <img src={draw.url} alt="drawing" className="w-48 h-48 object-contain" />
            <p className="text-sm text-pink-600 mt-2">{draw.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Drawing;