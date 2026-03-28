import { useEffect, useState, useMemo } from "react";

function AudioList() {
  const [audios, setAudios] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  // Fetch Logic
  const fetchAudios = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/audios", {
        headers: { Authorization: `Bearer ${token}` },
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

  // Performance: Memoize the Filtered & Sorted list
  const filteredAudios = useMemo(() => {
    return [...audios]
      .sort((a, b) => {
        return new Date(b.upload_time).getTime() - new Date(a.upload_time).getTime();
      })
      .filter((a) => {
        const searchTerm = search.toLowerCase();
        return (
          a.filename.toLowerCase().includes(searchTerm) ||
          (a.transcript && a.transcript.toLowerCase().includes(searchTerm))
        );
      });
  }, [audios, search]);

  return (
    <div className="bg-white mt-10 p-6 rounded shadow w-[600px] mx-auto">
      <input
        type="text"
        placeholder="Search files or transcripts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
      />
      
      <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Upload History</h2>

      {filteredAudios.length === 0 ? (
        <p className="text-gray-500 text-center py-4 text-sm">No recordings found.</p>
      ) : (
        filteredAudios.map((a) => (
          <div key={a.id} className="border-b last:border-0 py-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium text-gray-900 block">{a.filename}</span>
                <span className="text-[10px] text-gray-400">
                  {new Date(a.upload_time).toLocaleString()}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
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

            {/* Content Section */}
            {expandedId === a.id && a.transcript && (
              <div className="bg-gray-50 p-3 rounded mt-2 text-sm text-gray-700 border-l-4 border-blue-400">
                <p className="leading-relaxed">{a.transcript}</p>
              </div>
            )}

            {/* Smart Button: Only show if transcript is ready */}
            {a.status === "completed" && a.transcript && (
              <button
                onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                className="text-blue-600 hover:text-blue-800 text-xs font-semibold mt-2 transition-colors"
              >
                {expandedId === a.id ? "↑ Hide Transcript" : "↓ View Transcript"}
              </button>
            )}
            
            {a.status === "processing" && (
              <p className="text-gray-400 text-[10px] mt-2 italic">Transcribing... please wait.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default AudioList;