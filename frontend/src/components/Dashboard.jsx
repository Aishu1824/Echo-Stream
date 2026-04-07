import Upload from "./Upload";
import AudioList from "./AudioList";
import AskAI from "./AskAI";
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
function Dashboard() {
  const [audios, setAudios] = useState([]);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

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
      console.error("Failed to fetch audios:", error);
    }
  };

  useEffect(() => {
    fetchAudios();

    const interval = setInterval(fetchAudios, 3000);

    return () => clearInterval(interval);
  }, []);

  const totalUploads = audios.length;
  const completedCount = audios.filter(
    (a) => a.status === "completed"
  ).length;

  const processingCount = audios.filter(
    (a) => a.status === "processing"
  ).length;

  const positiveCount = audios.filter(
    (a) => a.sentiment === "Positive"
  ).length;
  const sentimentData = [
  {
    name: "Positive",
    value: audios.filter((a) => a.sentiment === "Positive").length,
  },
  {
    name: "Neutral",
    value: audios.filter((a) => a.sentiment === "Neutral").length,
  },
  {
    name: "Negative",
    value: audios.filter((a) => a.sentiment === "Negative").length,
  },
];
const statusData = [
  { name: "Completed", value: completedCount },
  { name: "Processing", value: processingCount },
];
const uploadsPerDay = {};

audios.forEach((audio) => {
  const day = new Date(audio.upload_time).toLocaleDateString();

  if (!uploadsPerDay[day]) {
    uploadsPerDay[day] = 0;
  }

  uploadsPerDay[day] += 1;
});

const uploadsTrendData = Object.keys(uploadsPerDay).map((day) => ({
  day,
  uploads: uploadsPerDay[day],
}));
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">
          EchoStream AI
        </h1>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow border">
            <p className="text-gray-500 text-sm">Total Uploads</p>
            <h2 className="text-3xl font-bold text-gray-800">
              {totalUploads}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow border">
            <p className="text-gray-500 text-sm">Completed</p>
            <h2 className="text-3xl font-bold text-green-600">
              {completedCount}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow border">
            <p className="text-gray-500 text-sm">Processing</p>
            <h2 className="text-3xl font-bold text-yellow-500">
              {processingCount}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow border">
            <p className="text-gray-500 text-sm">Positive Meetings</p>
            <h2 className="text-3xl font-bold text-blue-600">
              {positiveCount}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
  <div className="bg-white p-6 rounded-2xl shadow border">
    <h2 className="text-lg font-semibold mb-4 text-gray-700">
      Sentiment Analysis
    </h2>

    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={sentimentData}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          label
        >
          <Cell fill="#22c55e" />
          <Cell fill="#9ca3af" />
          <Cell fill="#ef4444" />
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>

  <div className="bg-white p-6 rounded-2xl shadow border">
    <h2 className="text-lg font-semibold mb-4 text-gray-700">
      Upload Status
    </h2>

    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={statusData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
  <div className="bg-white p-6 rounded-2xl shadow border mb-8">
  <h2 className="text-lg font-semibold mb-4 text-gray-700">
    Daily Upload Trends
  </h2>

  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={uploadsTrendData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="day" />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="uploads"
        stroke="#8b5cf6"
        strokeWidth={3}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
</div>


       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
  <div className="lg:col-span-1">
    <Upload />
  </div>

  <div className="lg:col-span-2">
    <AskAI />
  </div>

  <div className="lg:col-span-3">
    <AudioList />
  </div>
</div>
      </div>
    </div>
  );
}

export default Dashboard;