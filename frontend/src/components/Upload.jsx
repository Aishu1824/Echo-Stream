import { useState } from "react";

function Upload() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Select audio file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    alert("Upload Successful 🚀");
  };

  return (
    <div className="bg-white p-10 rounded-xl shadow-lg w-96 text-center">
      
      <h2 className="text-xl font-semibold mb-6">
        Upload Meeting Audio
      </h2>

      <input
        type="file"
        className="mb-6 block w-full text-sm"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        onClick={handleUpload}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
      >
        Upload Audio
      </button>

    </div>
  );
}

export default Upload;