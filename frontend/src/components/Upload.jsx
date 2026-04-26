import { useState } from "react";
import toast from "react-hot-toast";

function Upload({ darkMode }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You are not logged in");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.detail || "Upload failed");
        return;
      }

      toast.success(`Upload successful! Audio ID: ${data.audio_id}`);
      setFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`${
        darkMode
          ? "bg-gray-800 text-white border-gray-700"
          : "bg-white text-black border-gray-200"
      } p-6 rounded-2xl shadow-lg border w-full`}
    >
      <h2 className="text-xl font-semibold mb-2">Upload Audio</h2>

      <p
        className={`text-sm mb-5 ${
          darkMode ? "text-gray-300" : "text-gray-500"
        }`}
      >
        Upload meeting recordings to generate transcripts, summaries, action items, and sentiment insights.
      </p>

      <div
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
          darkMode
            ? "border-gray-600 bg-gray-700"
            : "border-gray-300 bg-gray-50"
        }`}
      >
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
          className={`w-full text-sm ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        />

        {file && (
          <div
            className={`mt-4 p-3 rounded-xl text-sm ${
              darkMode
                ? "bg-gray-800 text-gray-200"
                : "bg-white text-gray-700"
            }`}
          >
            <p className="font-medium">Selected File:</p>
            <p className="truncate mt-1">{file.name}</p>
            <p className="text-xs mt-1">
              Size: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        className={`w-full mt-5 py-3 rounded-xl font-semibold text-white transition ${
          uploading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 shadow-md"
        }`}
      >
        {uploading ? "Uploading..." : "Upload Audio"}
      </button>

      {uploading && (
        <p className="text-sm text-blue-500 mt-3 text-center animate-pulse">
          Uploading and sending for AI processing...
        </p>
      )}
    </div>
  );
}

export default Upload;