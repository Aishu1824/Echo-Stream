import { useState } from "react";
import toast from "react-hot-toast";
function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You are not logged in!");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      toast.success("Upload success. Audio ID: " + data.audio_id);

    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }

    setUploading(false);
  };

  return (
    <div className="bg-white p-10 rounded-xl shadow-lg w-96 text-center">
      <h2 className="text-xl font-semibold mb-6">Upload Audio</h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-6"
      />

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

export default Upload;