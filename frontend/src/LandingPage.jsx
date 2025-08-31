import React from "react";
import { useNavigate } from "react-router-dom";
import { Wand2, Upload, Download } from "lucide-react"; // icons
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col">
      {/* Navbar */}
      <header className="p-6 flex justify-between items-center text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wand2 size={28} /> AI Thumbnail Generator
        </h1>
        <button
          onClick={() => navigate("/auth")}
          className="bg-purple-600 px-5 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
        >
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 items-center justify-center px-8 py-12">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left Text */}
          <div className="text-white text-center md:text-left">
            <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Create <span className="text-yellow-400">Thumbnails</span> That
              Pop ✨
            </h2>
            <p className="mt-6 text-lg opacity-80">
              Generate stunning YouTube and Shorts thumbnails instantly with AI.
              Upload your photo, add context, and let AI do the magic.
            </p>
            <div className="mt-8">
              <button
                onClick={() => navigate("/auth")}
                className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition"
              >
                Get Started →
              </button>
            </div>
          </div>

          {/* Right Floating Thumbnails */}
          <div className="relative w-full flex justify-center">
            <div className="relative w-[500px] h-[400px]">
              {[
                "../public/images/image2.png",
                "../public/images/image1.png",
                "../public/images/image.png",
                // "../public/images/thumb4.jpg",
                // "../public/images/thumb5.jpg",
                // "../public/images/thumb6.jpg",
              ].map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`absolute w-40 md:w-52 rounded-xl shadow-2xl transform transition duration-500 hover:scale-110 hover:z-50
          animate-float${idx % 2 === 0 ? "1" : "2"}
          ${idx === 0 ? "top-0 left-10 rotate-[-8deg]" : ""}
          ${idx === 1 ? "top-10 left-36 rotate-[6deg]" : ""}
          ${idx === 2 ? "top-20 left-0 rotate-[10deg]" : ""}
          ${idx === 3 ? "top-28 left-48 rotate-[-5deg]" : ""}
          ${idx === 4 ? "top-40 left-20 rotate-[7deg]" : ""}
          ${idx === 5 ? "top-52 left-64 rotate-[-6deg]" : ""}
        `}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
            <Upload className="mx-auto text-purple-600" size={40} />
            <h3 className="mt-4 text-xl font-semibold">Upload Photo</h3>
            <p className="mt-2 text-gray-600">Start with your own image.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
            <Wand2 className="mx-auto text-yellow-500" size={40} />
            <h3 className="mt-4 text-xl font-semibold">Customize Prompt</h3>
            <p className="mt-2 text-gray-600">Guide AI with your own ideas.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
            <Download className="mx-auto text-green-600" size={40} />
            <h3 className="mt-4 text-xl font-semibold">Download Thumbnails</h3>
            <p className="mt-2 text-gray-600">
              Save in YouTube or Shorts format.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-400 py-6 text-sm">
        © {new Date().getFullYear()} AI Thumbnail Generator. Built with ❤️ by
        Sejal
      </footer>
    </div>
  );
}

export default LandingPage;
