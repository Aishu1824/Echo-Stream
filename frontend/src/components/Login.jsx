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

    localStorage.setItem("token",data.access_token);

    alert("Login success");
  };

  return (
    <div className="p-10">
      <input
        placeholder="email"
        onChange={(e)=>setEmail(e.target.value)}
        className="border p-2 m-2"
      />
      <input
        type="password"
        placeholder="password"
        onChange={(e)=>setPassword(e.target.value)}
        className="border p-2 m-2"
      />
      <button onClick={handleLogin} className="bg-blue-500 text-white p-2">
        Login
      </button>
    </div>
  );
}

export default Login;