import Upload from "./components/Upload";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Navbar */}
      <div className="bg-white shadow px-8 py-4 text-2xl font-bold">
        🎧 EchoStream AI
      </div>

      {/* Center Section */}
      <div className="flex items-center justify-center mt-24">
        <Upload />
      </div>

    </div>
  );
}

export default App;