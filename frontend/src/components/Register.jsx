import { useState } from "react";
import toast from "react-hot-toast";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.detail || "Registration failed");
        setLoading(false);
        return;
      }

      toast.success("Account created successfully");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (error) {
      console.error("Register error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-blue-100 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">
            Create Account
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Join EchoStream AI and start analyzing meetings
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleRegister}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 shadow-md"
            }`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </div>

        <p className="text-sm text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <span
            className="text-green-600 cursor-pointer font-semibold hover:underline"
            onClick={() => (window.location.href = "/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;