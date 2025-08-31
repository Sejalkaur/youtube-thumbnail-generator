import React, { useState, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Navbar from "./Navbar";
import { supabase } from "./supabaseClient";

function App() {
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [videoType, setVideoType] = useState("");
  const [mood, setMood] = useState("");
  const [style, setStyle] = useState("");
  const [placement, setPlacement] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [outputFormat, setOutputFormat] = useState("youtube");

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [rewrittenPrompt, setRewrittenPrompt] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [thumbnails, setThumbnails] = useState([]);

  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [user, setUser] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) {
      alert("Please upload a photo first!");
      return;
    }

    setFormSubmitted(true);
    setIsLoading(true);

    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: customPrompt || "Generated with form answers" },
    ]);

    const formData = new FormData();
    formData.append("photo", photo);
    formData.append("videoType", videoType);
    formData.append("mood", mood);
    formData.append("style", style);
    formData.append("placement", placement);
    formData.append("customPrompt", customPrompt);
    formData.append("outputFormat", outputFormat);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.rewrittenPrompt,
          thumbnails: data.images,
        },
      ]);
    } catch (err) {
      console.error("Error uploading:", err);
      alert("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (newPrompt) => {
    setChatMessages((prev) => [...prev, { role: "user", content: newPrompt }]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (photo) formData.append("photo", photo);
      formData.append("customPrompt", newPrompt);
      formData.append("outputFormat", outputFormat);

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.rewrittenPrompt,
          thumbnails: data.images,
        },
      ]);
    } catch (err) {
      console.error("Error refining:", err);
      alert("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <Navbar user={user} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-1/4 bg-gray-900 text-gray-200 p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-3">Chats</h2>
          <button
            onClick={() => {
              setSelectedHistory(null);
              setVideoType("");
              setMood("");
              setStyle("");
              setPlacement("");
              setCustomPrompt("");
              setOutputFormat("youtube");
              setRewrittenPrompt("");
              setThumbnails([]);
              setPreview(null);
              setPhoto(null);
              setChatMessages([]);
              setFormSubmitted(false);
            }}
            className="mb-4 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition self-start"
          >
            + New Chat
          </button>

          <div className="space-y-2 overflow-y-auto">
            {history.length === 0 && (
              <p className="text-gray-500 text-sm">No history yet.</p>
            )}
            {history.map((item, idx) => {
              const title =
                item.customPrompt && item.customPrompt.trim() !== ""
                  ? item.customPrompt.split(" ").slice(0, 6).join(" ") + "..."
                  : item.prompt.split(" ").slice(0, 6).join(" ") + "...";

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedHistory(idx);
                    setVideoType(item.videoType);
                    setMood(item.mood);
                    setStyle(item.style);
                    setPlacement(item.placement);
                    setCustomPrompt(item.customPrompt);
                    setOutputFormat(item.format);
                    setRewrittenPrompt(item.prompt);
                    setThumbnails(item.images);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedHistory === idx
                      ? "bg-gray-700 border border-purple-500"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <p className="text-sm font-medium truncate">{title}</p>
                  <div className="flex gap-1 mt-2">
                    {item.images &&
                      item.images
                        .slice(0, 2)
                        .map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt="thumb"
                            className="w-10 h-7 object-cover rounded"
                          />
                        ))}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            YouTube Thumbnail Generator
          </h1>
          <p className="text-gray-600 mb-6">
            Upload your photo, add context, and generate thumbnails instantly.
          </p>

          {!formSubmitted ? (
            /* First-time form */
            <form
              onSubmit={handleSubmit}
              className="bg-gray-800 text-gray-200 p-6 rounded-2xl shadow-lg space-y-5"
            >
              <div>
                <label className="block font-medium mb-2">Upload Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mt-3 w-48 rounded-xl shadow-md"
                  />
                )}
              </div>

              <div>
                <label className="block font-medium mb-2">Custom Prompt</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  placeholder="e.g. Make me look like Iron Man flying in space..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2">Video Type</label>
                  <input
                    type="text"
                    value={videoType}
                    onChange={(e) => setVideoType(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Mood</label>
                  <input
                    type="text"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Style</label>
                  <input
                    type="text"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Placement</label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  >
                    <option value="">Select</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="center">Center</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2">Thumbnail Type</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full p-3 bg-gray-800 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                >
                  <option value="youtube">YouTube Video (16:9)</option>
                  <option value="shorts">Shorts/Reels (9:16)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
              >
                Generate Thumbnails
              </button>
            </form>
          ) : (
            /* Chat */
            <div className="space-y-6">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl max-w-xl shadow ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white self-end"
                      : "bg-gray-700 text-gray-100 self-start"
                  }`}
                >
                  <p>{msg.content}</p>
                  {msg.thumbnails && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                      {msg.thumbnails.map((img, i) => (
                        <div
                          key={i}
                          className="rounded-xl p-3 bg-gray-900 shadow-md hover:shadow-lg transition hover:scale-105"
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${i}`}
                            className="rounded mb-2 hover:scale-105 transition-transform"
                          />
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = img;
                                link.download = `thumbnail-${i + 1}.png`;
                                link.click();
                              }}
                              className="text-xs px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                            >
                              Download
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch(img);
                                  const blob = await response.blob();
                                  await navigator.clipboard.write([
                                    new ClipboardItem({ [blob.type]: blob }),
                                  ]);
                                  alert("Copied to clipboard!");
                                } catch {
                                  alert("Failed to copy.");
                                }
                              }}
                              className="text-xs px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="p-4 rounded-2xl bg-gray-700 text-gray-300 animate-pulse">
                  Generating thumbnails...
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const newPrompt = e.target.refine.value;
                  if (newPrompt.trim()) {
                    handleRefine(newPrompt);
                    e.target.reset();
                  }
                }}
                className="flex gap-2"
              >
                <input
                  name="refine"
                  placeholder="Refine thumbnail (e.g. change background color)"
                  className="flex-1 p-3 bg-gray-800 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
                <button className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700">
                  Send
                </button>
              </form>
            </div>
          )}

          {/* Thumbnails Section */}
          {thumbnails.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Generated Thumbnails
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {thumbnails.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl p-3 bg-gray-900 shadow-md hover:shadow-lg transition hover:scale-105"
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      className="rounded mb-2 hover:scale-105 transition-transform"
                    />
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = img;
                          link.download = `thumbnail-${idx + 1}.png`;
                          link.click();
                        }}
                        className="flex items-center gap-1 text-sm px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                      >
                        Download
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(img);
                            const blob = await response.blob();
                            await navigator.clipboard.write([
                              new ClipboardItem({ [blob.type]: blob }),
                            ]);
                            alert("Copied to clipboard!");
                          } catch {
                            alert("Failed to copy.");
                          }
                        }}
                        className="flex items-center gap-1 text-sm px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button
                  onClick={async () => {
                    const zip = new JSZip();
                    for (let i = 0; i < thumbnails.length; i++) {
                      const response = await fetch(thumbnails[i]);
                      const blob = await response.blob();
                      zip.file(`thumbnail-${i + 1}.png`, blob);
                    }
                    const content = await zip.generateAsync({ type: "blob" });
                    saveAs(content, "thumbnails.zip");
                  }}
                  className="bg-green-500 text-white px-5 py-2 rounded-xl font-medium hover:bg-green-600 transition"
                >
                  Download All as ZIP
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
