import React from "react";
import { supabase } from "./supabaseClient";
import { LogOut } from "lucide-react";

function Navbar({ user }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <nav className="w-full bg-gray-900 text-gray-200 px-6 py-3 flex justify-between items-center border-b border-gray-800">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎬</span>
        <h1 className="text-lg font-bold">AI Thumbnail Generator</h1>
      </div>

      {/* Right: User Info */}
      {user && (
        <div className="flex items-center gap-4">
          {/* Avatar + Email */}
          <div className="flex items-center gap-2">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                // alt="avatar"
                className="w-9 h-9 rounded-full border border-gray-700 object-cover"
              />
            ) : (
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-purple-600 text-white font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm truncate max-w-[150px]">{user.email}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 transition"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
