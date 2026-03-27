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

      {audios.map(a=>(
        <div
          key={a.id}
          className="flex justify-between border-b py-2"
        >
          <span>{a.filename}</span>
          <span className={`font-semibold ${
            a.status==="completed" ? "text-green-600" : "text-orange-500"
          }`}>
            {a.status}
          </span>
        </div>
      ))}
    </div>
  );
}

export default AudioList;