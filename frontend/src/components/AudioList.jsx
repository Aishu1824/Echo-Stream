import { useEffect, useState } from "react";

function AudioList() {
  const [audios,setAudios] = useState([]);

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

  return (
    <div className="bg-white mt-10 p-6 rounded shadow w-[600px]">
      <h2 className="text-lg font-semibold mb-4">Upload History</h2>

      {audios.map((a) => (
  <div key={a.id} className="border-b py-4">
    {/* Top Row: Filename and Status */}
    <div className="flex justify-between items-start">
      <span className="font-medium text-gray-800">{a.filename}</span>
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
    {a.transcript && (
      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-sm text-gray-600 italic">
          "{a.transcript}"
        </p>
      </div>
    )}
  </div>
))}
    </div>
  );
}

export default AudioList;