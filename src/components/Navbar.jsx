import React from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import "animate.css";


function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const hideOnRoutes = ["/login", "/register"];
  if (hideOnRoutes.includes(location.pathname)) return null;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

return (
    <nav className="z-50 bg-white bg-opacity-20 backdrop-blur-lg shadow-md py-3 px-6 flex justify-between items-center rounded-xl mx-4 mt-4 animate__animated animate__fadeInDown">
      <Link to="/" className="font-bold text-xl no-underline !text-[#32a86d] hover:!text-[#2a8f5f]">
        Archives
      </Link>

      <div className="flex gap-4 items-center">
        <Link to="/wishlist" className="!text-[#32a86d] hover:!text-[#2a8f5f] font-medium no-underline !text-[#32a86d]">Little Things</Link>
        <Link to="/pictures" className="!text-[#32a86d] hover:!text-[#2a8f5f] font-medium no-underline !text-[#32a86d]">Gallery</Link>
        <Link to="/yap" className="!text-[#32a86d] hover:!text-[#2a8f5f] font-medium no-underline !text-[#32a86d]">Yap</Link>
        <Link to="/drawing" className="!text-[#32a86d] hover:!text-[#2a8f5f] font-medium no-underline !text-[#32a86d]">Draw</Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="focus:outline-none"
          >
            <svg
              className="w-6 h-6 text-pink-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                // X icon
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                // Hamburger icon
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-pink-300 rounded shadow-md z-50">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-pink-700 hover:bg-pink-100"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
