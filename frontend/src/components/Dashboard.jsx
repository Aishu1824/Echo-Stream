import Upload from "./Upload";
import AudioList from "./AudioList";
import AskAI from "./AskAI";
import toast from "react-hot-toast";
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
  const [darkMode, setDarkMode] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    toast.success("Logged out successfully");

    setTimeout(() => {
      window.location.reload();
    }, 1000);
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
  }
};
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchAudios();

    const interval = setInterval(fetchAudios, 10000);

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

  const userEmail = localStorage.getItem("email");

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      } min-h-screen transition-all duration-300`}
    >
      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } shadow-md px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b transition-all duration-300`}
      >
        <div>
          <h1 className="text-3xl font-bold text-blue-600">
            EchoStream AI
          </h1>

          <p
            className={`text-sm mt-1 ${
              darkMode ? "text-gray-300" : "text-gray-500"
            }`}
          >
            Logged in as {userEmail || "User"}
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              darkMode
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div
            className={`${
              darkMode
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-black border-gray-200"
            } p-5 rounded-2xl shadow border`}
          >
            <p className="text-gray-500 text-sm">Total Uploads</p>
            <h2 className="text-3xl font-bold mt-2">{totalUploads}</h2>
          </div>

          <div
            className={`${
              darkMode
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-black border-gray-200"
            } p-5 rounded-2xl shadow border`}
          >
            <p className="text-gray-500 text-sm">Completed</p>
            <h2 className="text-3xl font-bold text-green-500 mt-2">
              {completedCount}
            </h2>
          </div>

          <div
            className={`${
              darkMode
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-black border-gray-200"
            } p-5 rounded-2xl shadow border`}
          >
            <p className="text-gray-500 text-sm">Processing</p>
            <h2 className="text-3xl font-bold text-yellow-500 mt-2">
              {processingCount}
            </h2>
          </div>

          <div
            className={`${
              darkMode
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-black border-gray-200"
            } p-5 rounded-2xl shadow border`}
          >
            <p className="text-gray-500 text-sm">Positive Meetings</p>
            <h2 className="text-3xl font-bold text-blue-500 mt-2">
              {positiveCount}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <div
            className={`${
              darkMode
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-black border-gray-200"
            } p-6 rounded-2xl shadow border`}
          >
            <h2 className="text-lg font-semibold mb-4">
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

          <div
            className={`${
              darkMode
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-black border-gray-200"
            } p-6 rounded-2xl shadow border`}
          >
            <h2 className="text-lg font-semibold mb-4">
              Upload Status
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className={`${
            darkMode
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-black border-gray-200"
          } p-6 rounded-2xl shadow border mb-8`}
        >
          <h2 className="text-lg font-semibold mb-4">
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <div className="xl:col-span-1">
            <Upload darkMode={darkMode} />
          </div>

          <div className="xl:col-span-2">
            <AskAI darkMode={darkMode} />
          </div>

          <div className="xl:col-span-3">
            <AudioList darkMode={darkMode} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;