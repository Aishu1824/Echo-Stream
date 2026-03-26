import { useState } from "react";

function Login() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://127.0.0.1:8000/login",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email,password })
    });

    const data = await res.json();

    localStorage.setItem("token", data.access_token);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded shadow w-80 text-center">
        <h2 className="text-xl mb-4 font-semibold">Login</h2>

        <input
          placeholder="Email"
          className="border p-2 w-full mb-3"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Login
        </button>
                        <p className="text-sm mt-4">
      New user?
      <span
        className="text-blue-600 cursor-pointer"
        onClick={() => window.location.href = "/register"}
      >
        Register
      </span>
    </p>
      </div>
    </div>
  );
}

export default Login;