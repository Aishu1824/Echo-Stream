import { useEffect, useState } from "react";

function AudioList() {
  const [audios,setAudios] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(()=>{
  fetchAudios();

  const interval = setInterval(()=>{
    fetchAudios();
  },3000);

  return ()=>clearInterval(interval);
},[]);

  const fetchAudios = async () => {
    const token = localStorage.getItem("token");
    console.log("TOKEN:", token);
    const res = await fetch("http://127.0.0.1:8000/audios",{
      headers:{
        Authorization:`Bearer ${token}`,
      },
    });

    const data = await res.json();
    setAudios(data);
  };
  const sortedAudios = [...audios].sort(
  (a, b) => new Date(b.upload_time) - new Date(a.upload_time)
);
  const filteredAudios = sortedAudios.filter((a) =>
  a.filename.toLowerCase().includes(search.toLowerCase()) ||
  (a.transcript &&
    a.transcript.toLowerCase().includes(search.toLowerCase()))
);
  return (
    <div className="bg-white mt-10 p-6 rounded shadow w-[600px]">
            <input
        type="text"
        placeholder="Search transcripts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />
      <h2 className="text-lg font-semibold mb-4">Upload History</h2>

      {filteredAudios.map((a) => (
  <div key={a.id} className="border-b py-4">
    {/* Top Row: Filename and Status */}
    <div className="flex justify-between items-start">
      <span className="font-medium text-gray-800">{a.filename}</span>
          <p className="text-xs text-gray-400 mt-1">
      Uploaded: {new Date(a.upload_time).toLocaleString()}
    </p>
      <span
        className={`text-xs font-bold uppercase px-2 py-1 rounded ${
          a.status === "completed"
            ? "bg-green-100 text-green-600"
            : "bg-orange-100 text-orange-500"
        }`}
      >
        {a.status}
      </span>
    </div>

    {/* Bottom Row: Transcript (Full Width below filename) */}
    {expandedId === a.id && a.transcript && (
  <div className="bg-gray-50 p-3 rounded mt-2 text-sm text-gray-700">
    <span className="font-semibold">Transcript:</span>
    <p className="mt-1">{a.transcript}</p>
  </div>
)}
<button
  onClick={() =>
    setExpandedId(expandedId === a.id ? null : a.id)
  }
  className="text-blue-600 text-sm mt-2"
>
  {expandedId === a.id ? "Hide Transcript" : "Show Transcript"}
</button>
  </div>
))}
    </div>
  );
}

export default AudioList;