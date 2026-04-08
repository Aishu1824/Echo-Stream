import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
function AudioList() {
  const [audios, setAudios] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("All");

  const fetchAudios = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:8000/audios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setAudios(data);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  useEffect(() => {
    fetchAudios();

    const interval = setInterval(fetchAudios, 3000);

    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="bg-white mt-10 p-6 rounded-2xl shadow-lg border border-gray-200 w-full mx-auto">
      <h2 className="text-xl font-bold mb-5 text-gray-800 border-b pb-3">
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
        className="border border-gray-300 p-3 rounded-xl w-full mb-5 focus:ring-2 focus:ring-blue-500 outline-none"
      />

      {filteredAudios.length === 0 ? (
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
            className="bg-gray-50 rounded-xl p-5 mb-4 border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <span className="font-medium text-gray-900 block truncate max-w-[400px]">
                  {a.filename}
                </span>

                <span className="text-xs text-gray-400">
                  Uploaded: {new Date(a.upload_time).toLocaleString()}
                </span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                  a.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : a.status === "processing"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {a.status}
              </span>
            </div>

            {a.status === "processing" && (
              <div className="mt-3">
  <p className="text-yellow-600 text-xs italic mb-2 animate-pulse">
    Processing audio and generating AI insights...
  </p>

  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
    <div className="bg-yellow-500 h-2 rounded-full animate-pulse w-3/4"></div>
  </div>
</div>
            )}

            {a.status === "completed" && a.transcript && (
              <button
                onClick={() =>
                  setExpandedId(expandedId === a.id ? null : a.id)
                }
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold mt-4 transition-colors"
              >
                {expandedId === a.id
                  ? "↑ Hide Transcript"
                  : "↓ View Transcript"}
              </button>
            )}

            {expandedId === a.id && a.transcript && (
              <div className="bg-slate-50 p-4 rounded-lg mt-3 text-sm text-gray-700 border border-slate-200">
                <p className="leading-relaxed whitespace-pre-line">
                  {a.transcript}
                </p>
              </div>
            )}

            {a.summary && (
              <div className="bg-blue-50 p-4 rounded-lg mt-4 text-sm text-blue-900 border border-blue-100">
                <span className="font-semibold">📝 Summary:</span>
                <p className="mt-1 leading-relaxed">{a.summary}</p>
              </div>
            )}

            {a.action_items && (
              <div className="bg-yellow-50 p-4 rounded-lg mt-4 text-sm text-yellow-900 border border-yellow-100">
                <span className="font-semibold">📌 Action Items:</span>
                <p className="whitespace-pre-line mt-1 leading-relaxed">
                  {a.action_items}
                </p>
              </div>
            )}

            {a.sentiment && (
              <div className="mt-4 flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-700">
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
                <button
            onClick={() => downloadPDF(a)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Download Report PDF
          </button>
          </div>
        ))
      )}
    </div>
  );
}

export default AudioList;