import { useState } from "react";

function Register() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleRegister = async () => {
    const res = await fetch("http://127.0.0.1:8000/signup",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email,password })
    });

    const data = await res.json();

    alert("Account created. Please login.");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded shadow w-80 text-center">
        <h2 className="text-xl mb-4 font-semibold">Register</h2>

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
          onClick={handleRegister}
          className="bg-green-600 text-white w-full py-2 rounded"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

export default Register;