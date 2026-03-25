import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

function App() {
  const token = localStorage.getItem("token");
  const path = window.location.pathname;

  // 1. If logged in, always show Dashboard (unless they logout)
  if (token) {
    return <Dashboard />;
  }

  // 2. If not logged in and on /register path, show Register
  if (path === "/register") {
    return <Register />;
  }

  // 3. Default: Show Login
  return <Login />;
}

export default App;