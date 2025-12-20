import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/Navbar";
import MusicPopup from "./components/MusicPopup";
import AuthProvider from "./components/AuthProvider";

import Jaan from "./pages/Jaan";
import Home from "./pages/Home";
import Wishlist from "./pages/Wishlist";
import Pictures from "./pages/Pictures";
import Todo from "./pages/Todo";
import Yap from "./pages/Yap";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Drawing from "./pages/Drawing";


function App() {
  return (
    <Router>
      <Navbar />
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
      <MusicPopup />
    </Router>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/wishlist" element={<PageWrapper><Wishlist /></PageWrapper>} />
        <Route path="/pictures" element={<PageWrapper><Pictures /></PageWrapper>} />
        <Route path="/todo" element={<PageWrapper><Todo /></PageWrapper>} />
        <Route path="/yap" element={<PageWrapper><Yap /></PageWrapper>} />
        <Route path="/jaan" element={<PageWrapper><Jaan /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/drawing" element={<PageWrapper><Drawing /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

export default App;