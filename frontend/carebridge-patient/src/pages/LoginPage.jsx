import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { loginPatient } from "../api/auth";

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2 mb-2">
      <img src="/icon.png" alt="CareBridge" className="w-9 h-9 rounded-lg object-cover" />
      <span className="font-semibold text-xl" style={{ color: "#1B5E3B" }}>CareBridge</span>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginPatient(email, password);
      localStorage.setItem("carebridge_access_token", data.access_token);
      localStorage.setItem("carebridge_user", JSON.stringify(data.user));
      navigate("/home");
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "0.5px solid #E0D5C0",
    background: "#FDF6EC",
    fontSize: "13px",
    color: "#1E293B",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#FDF6EC" }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-card px-8 py-10"
        style={{ border: "0.5px solid #E0D5C0" }}
      >
        <div className="text-center mb-7">
          <Logo />
          <p className="mt-2" style={{ fontSize: "13px", color: "#7A6B52" }}>
            Patient care portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              className="block mb-1 font-medium"
              style={{ fontSize: "12px", color: "#5C4A2E" }}
            >
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#1B5E3B")}
              onBlur={(e) => (e.target.style.borderColor = "#E0D5C0")}
            />
          </div>

          <div>
            <label
              className="block mb-1 font-medium"
              style={{ fontSize: "12px", color: "#5C4A2E" }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#1B5E3B")}
              onBlur={(e) => (e.target.style.borderColor = "#E0D5C0")}
            />
          </div>

          {error && (
            <div
              className="rounded-sm2 px-3 py-2 text-xs"
              style={{ background: "#FEE2E2", color: "#991B1B" }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-sm2 font-semibold transition-opacity mt-1"
            style={{
              background: "#1B5E3B",
              color: "#fff",
              fontSize: "14px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontSize: "11px", color: "#A39880" }}>
          Don't have an account? <Link to="/register" style={{ color: "#1B5E3B" }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
