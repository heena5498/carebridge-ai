import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerPatient } from "../api/auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const data = await registerPatient(fullName, email, password);
      localStorage.setItem("carebridge_access_token", data.access_token);
      localStorage.setItem("carebridge_user", JSON.stringify(data.user));
      navigate("/home");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FDF6EC" }}>
      <div className="w-full max-w-sm bg-white rounded-card px-8 py-10" style={{ border: "0.5px solid #E0D5C0" }}>
        <div className="text-center mb-7">
          <h1 className="font-semibold text-xl" style={{ color: "#1B5E3B" }}>Create patient account</h1>
          <p className="mt-2" style={{ fontSize: "13px", color: "#7A6B52" }}>
            Register with the same email your facility used during care-plan creation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium" style={{ fontSize: "12px", color: "#5C4A2E" }}>
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium" style={{ fontSize: "12px", color: "#5C4A2E" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium" style={{ fontSize: "12px", color: "#5C4A2E" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium" style={{ fontSize: "12px", color: "#5C4A2E" }}>
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {error ? (
            <div className="rounded-sm2 px-3 py-2 text-xs" style={{ background: "#FEE2E2", color: "#991B1B" }}>
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-sm2 font-semibold transition-opacity mt-1"
            style={{ background: "#1B5E3B", color: "#fff", fontSize: "14px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontSize: "11px", color: "#A39880" }}>
          Already have an account? <Link to="/login" style={{ color: "#1B5E3B" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
