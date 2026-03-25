import Upload from "./Upload";

function Dashboard() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      
      <div className="bg-white shadow p-4 flex justify-between">
        <h1 className="text-xl font-bold">EchoStream AI</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-1 rounded"
        >
          Logout
        </button>
      </div>

      <div className="flex justify-center mt-20">
        <Upload />
      </div>

    </div>
  );
}

export default Dashboard;