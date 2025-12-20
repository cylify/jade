import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

function Todo() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [addedBy, setAddedBy] = useState("");

  const todosCollectionRef = collection(db, "todos");

  useEffect(() => {
    const unsubscribe = onSnapshot(todosCollectionRef, (snapshot) => {
      setTodos(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe();
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo || !addedBy) {
      alert("Please enter both to-do and your name.");
      return;
    }
    await addDoc(todosCollectionRef, {
      text: newTodo,
      addedBy,
      completed: false,
    });
    setNewTodo("");
    setAddedBy("");
  };

  const toggleCompleted = async (id, currentStatus) => {
    const todoDoc = doc(db, "todos", id);
    await updateDoc(todoDoc, { completed: !currentStatus });
  };

  const deleteTodo = async (id) => {
    const todoDoc = doc(db, "todos", id);
    await deleteDoc(todoDoc);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-100 to-pink-200 p-4 font-sans">
      <h2 className="text-3xl font-bold text-pink-600 mb-6 text-center">To-do 📝</h2>
      <p className="text-xm font-bold text-pink-600 mb-6 text-center">Things for US TO DO (I know probably not the best to hear this right now)</p>

      {/* Add Todo Form */}
      <form onSubmit={addTodo} className="bg-white p-4 rounded shadow mb-6 max-w-md mx-auto space-y-3">
        <input
          type="text"
          placeholder="What should WE DO??"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="w-full border border-pink-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-pink-200 text-gray-800"
        />
        <input
          type="text"
          placeholder="Your name"
          value={addedBy}
          onChange={(e) => setAddedBy(e.target.value)}
          className="w-full border border-pink-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-pink-200 text-gray-800"
        />
        <button
          type="submit"
          className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-2 rounded"
        >
          Add Todo
        </button>
      </form>

      {/* Todo List */}
      <div className="max-w-md mx-auto space-y-3">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="bg-white border border-pink-200 rounded px-4 py-2 flex justify-between items-center shadow"
          >
            <div>
              <p className={`text-gray-800 ${todo.completed ? "line-through" : ""}`}>{todo.text}</p>
              <p className="text-xs text-gray-500">Added by: {todo.addedBy}</p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleCompleted(todo.id, todo.completed)}
                className="accent-pink-500"
              />
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-600 text-sm"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Todo;