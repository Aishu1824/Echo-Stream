import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";

function AudioList({ darkMode }) {
  const [audios, setAudios] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchAudios = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("${import.meta.env.VITE_API_BASE_URL}/audios", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    setAudios((prevAudios) => {
      const oldData = JSON.stringify(prevAudios);
      const newData = JSON.stringify(data);

      if (oldData !== newData) {
        return data;
      }

      return prevAudios;
    });
  } catch (error) {
    console.error("Failed to fetch audios:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAudios();

    const interval = setInterval(fetchAudios, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/audio/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast.error("Delete failed");
        return;
      }

      toast.success("Audio deleted successfully");
      fetchAudios();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const downloadTranscript = (filename, transcript) => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.txt`;
    link.click();
  };

  const downloadPDF = (audio) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("EchoStream AI Meeting Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`File: ${audio.filename}`, 20, 35);
    doc.text(`Status: ${audio.status}`, 20, 45);
    doc.text(`Sentiment: ${audio.sentiment || "N/A"}`, 20, 55);

    doc.text("Summary:", 20, 70);
    doc.text(audio.summary || "No summary available", 20, 80, {
      maxWidth: 170,
    });

    doc.text("Action Items:", 20, 120);
    doc.text(audio.action_items || "No action items available", 20, 130, {
      maxWidth: 170,
    });

    doc.text("Transcript:", 20, 170);
    doc.text(audio.transcript || "No transcript available", 20, 180, {
      maxWidth: 170,
    });

    doc.save(`${audio.filename}.pdf`);
  };

  const filteredAudios = useMemo(() => {
    let filtered = [...audios];

    if (filter === "Completed") {
      filtered = filtered.filter((a) => a.status === "completed");
    } else if (filter === "Processing") {
      filtered = filtered.filter((a) => a.status === "processing");
    } else if (filter === "Positive") {
      filtered = filtered.filter((a) => a.sentiment === "Positive");
    } else if (filter === "Neutral") {
      filtered = filtered.filter((a) => a.sentiment === "Neutral");
    } else if (filter === "Negative") {
      filtered = filtered.filter((a) => a.sentiment === "Negative");
    }

    return filtered
      .sort((a, b) => {
        return (
          new Date(b.upload_time).getTime() -
          new Date(a.upload_time).getTime()
        );
      })
      .filter((a) => {
        const searchTerm = search.toLowerCase();

        return (
          a.filename.toLowerCase().includes(searchTerm) ||
          (a.transcript &&
            a.transcript.toLowerCase().includes(searchTerm)) ||
          (a.summary && a.summary.toLowerCase().includes(searchTerm))
        );
      });
  }, [audios, search, filter]);

  return (
    <div
      className={`${
        darkMode
          ? "bg-gray-800 text-white border-gray-700"
          : "bg-white text-black border-gray-200"
      } mt-10 p-6 rounded-2xl shadow-lg border w-full mx-auto`}
    >
      <h2
        className={`text-xl font-bold mb-5 border-b pb-3 ${
          darkMode ? "text-white border-gray-700" : "text-gray-800 border-gray-200"
        }`}
      >
        Upload History
      </h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          "All",
          "Completed",
          "Processing",
          "Positive",
          "Neutral",
          "Negative",
        ].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === item
                ? "bg-blue-600 text-white"
                : darkMode
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search files, transcripts, or summaries..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`${
          darkMode
            ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
            : "bg-white text-black border-gray-300"
        } border p-3 rounded-xl w-full mb-5 focus:ring-2 focus:ring-blue-500 outline-none`}
      />

      {loading ? (
        <div className="text-center py-10">
          <p className="text-blue-500 animate-pulse text-lg">
            Loading recordings...
          </p>
        </div>
      ) : filteredAudios.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg font-medium">No recordings found</p>
          <p className="text-sm mt-1">
            Upload audio files to see AI-generated insights here.
          </p>
        </div>
      ) : (
        filteredAudios.map((a) => (
          <div
            key={a.id}
            className={`${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-gray-50 border-gray-100 text-black"
            } rounded-xl p-5 mb-4 border hover:shadow-md transition`}
          >
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
              <div className="flex-1">
                <span
                  className={`font-medium block truncate max-w-[500px] ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {a.filename}
                </span>

                <span className="text-xs text-gray-400">
                  Uploaded: {new Date(a.upload_time).toLocaleString()}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                    a.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : a.status === "processing"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {a.status === "completed"
                    ? "✅ Completed"
                    : a.status === "processing"
                    ? "⏳ Processing"
                    : "❌ Failed"}
                </span>

                <button
                  onClick={() => handleDelete(a.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs"
                >
                  Delete
                </button>
              </div>
            </div>

            {a.status === "processing" && (
              <div className="mt-3">
                <p className="text-yellow-500 text-xs italic mb-2 animate-pulse">
                  Processing audio and generating AI insights...
                </p>

                <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                  <div className="bg-yellow-500 h-2 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            )}

            {a.status === "completed" && a.transcript && (
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() =>
                    setExpandedId(expandedId === a.id ? null : a.id)
                  }
                  className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                >
                  {expandedId === a.id
                    ? "↑ Hide Transcript"
                    : "↓ View Transcript"}
                </button>

                <button
                  onClick={() =>
                    downloadTranscript(a.filename, a.transcript)
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs"
                >
                  Download Transcript
                </button>

                <button
                  onClick={() => copyText(a.transcript, "Transcript")}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-xs"
                >
                  Copy Transcript
                </button>

                <button
                  onClick={() => downloadPDF(a)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-xs"
                >
                  Download PDF
                </button>
              </div>
            )}

            {expandedId === a.id && a.transcript && (
              <div
                className={`${
                  darkMode
                    ? "bg-gray-800 border-gray-600 text-gray-200"
                    : "bg-slate-50 border-slate-200 text-gray-700"
                } p-4 rounded-lg mt-3 text-sm border`}
              >
                <p className="leading-relaxed whitespace-pre-line">
                  {a.transcript}
                </p>
              </div>
            )}

            {a.summary && (
              <div className="bg-blue-50 p-4 rounded-lg mt-4 text-sm text-blue-900 border border-blue-100">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">📝 Summary</span>

                  <button
                    onClick={() => copyText(a.summary, "Summary")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs"
                  >
                    Copy
                  </button>
                </div>

                <p className="mt-2 leading-relaxed">{a.summary}</p>
              </div>
            )}

            {a.action_items && (
              <div className="bg-yellow-50 p-4 rounded-lg mt-4 text-sm text-yellow-900 border border-yellow-100">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">📌 Action Items</span>

                  <button
                    onClick={() =>
                      copyText(a.action_items, "Action items")
                    }
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-xs"
                  >
                    Copy
                  </button>
                </div>

                <p className="whitespace-pre-line mt-2 leading-relaxed">
                  {a.action_items}
                </p>
              </div>
            )}

            {a.sentiment && (
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`font-semibold text-sm ${
                    darkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  😊 Sentiment:
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    a.sentiment === "Positive"
                      ? "bg-green-100 text-green-700"
                      : a.sentiment === "Negative"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {a.sentiment}
                </span>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default AudioList;