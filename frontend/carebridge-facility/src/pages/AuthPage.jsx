import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/icon.png";
import { loginUser, registerUser } from "../api/auth";
import { saveAuth } from "../utils/authStorage";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const role = searchParams.get("role") || "facility";
  const patientPortalLogin =
    import.meta.env.VITE_PATIENT_PORTAL_URL || "http://localhost:3001/login";
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  const pageContent = useMemo(() => {
    return {
      title: mode === "login" ? "Facility staff login" : "Create your facility account",
      subtitle:
        "Access patient lists, intake dashboards, care plans, and coordinator chat.",
      primaryAction:
        mode === "login" ? "Login as facility staff" : "Register as facility staff",
    };
  }, [role, mode]);

  useEffect(() => {
    if (role === "patient") {
      window.location.replace(patientPortalLogin);
    }
  }, [role, patientPortalLogin]);

  if (role === "patient") {
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorText("");
    setLoading(true);

    try {
      let data;

      if (mode === "register") {
        data = await registerUser({
          full_name: fullName,
          email,
          password,
          role: "facility",
        });
      } else {
        data = await loginUser({
          email,
          password,
        });
      }

      saveAuth(data);

      navigate("/facility/patients");
    } catch (error) {
      setErrorText(
        error?.response?.data?.detail || "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="container">
        <div
          className="card"
          style={{
            marginBottom: "20px",
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={logo}
              alt="CareBridge logo"
              style={{
                width: "36px",
                height: "36px",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
            <div
              style={{
                fontWeight: 500,
                color: "var(--primary)",
                fontSize: "18px",
                marginBottom: "2px",
              }}
            >
              CareBridge
            </div>
          </div>

          <Link
            to="/"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--primary)",
            }}
          >
            ← Back to home
          </Link>
        </div>

        <div style={{ maxWidth: "520px", margin: "40px auto 0" }}>
          <div className="card" style={{ padding: "28px" }}>
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <div
                style={{
                  display: "inline-block",
                  fontSize: "11px",
                  padding: "5px 12px",
                  borderRadius: "999px",
                  background:
                    role === "facility"
                      ? "var(--status-attention-bg)"
                      : "var(--status-normal-bg)",
                  color:
                    role === "facility"
                      ? "var(--status-attention-text)"
                      : "var(--status-normal-text)",
                  fontWeight: 500,
                  marginBottom: "12px",
                }}
              >
                {role === "facility" ? "Facility staff" : "Patient"}
              </div>

              <h1
                style={{
                  margin: "0 0 8px",
                  fontSize: "28px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}
              >
                {pageContent.title}
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: 1.7,
                  color: "var(--text-muted)",
                }}
              >
                {pageContent.subtitle}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "20px",
                background: "var(--border-light)",
                padding: "4px",
                borderRadius: "12px",
              }}
            >
              <button
                onClick={() => setMode("login")}
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px",
                  background: mode === "login" ? "white" : "transparent",
                  color: mode === "login" ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                Login
              </button>

              <button
                onClick={() => setMode("register")}
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px",
                  background: mode === "register" ? "white" : "transparent",
                  color: mode === "register" ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {mode === "register" && (
                <div style={{ marginBottom: "14px" }}>
                  <label style={labelStyle}>Full name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
              )}

              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              {errorText ? (
                <p
                  style={{
                    margin: "0 0 14px",
                    fontSize: "12px",
                    color: "var(--status-critical-text)",
                  }}
                >
                  {errorText}
                </p>
              ) : null}

              <button
                type="submit"
                className="primary-btn"
                style={{ width: "100%", padding: "12px 16px" }}
                disabled={loading}
              >
                {loading ? "Please wait..." : pageContent.primaryAction}
              </button>
            </form>

            <p
              style={{
                margin: "16px 0 0",
                textAlign: "center",
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              {mode === "login" ? "Don’t have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "var(--primary)",
                  fontWeight: 500,
                  padding: 0,
                }}
              >
                {mode === "login" ? "Register" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  color: "var(--text-primary)",
  fontWeight: 500,
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: "0.5px solid var(--border)",
  borderRadius: "12px",
  background: "var(--bg-white)",
  color: "var(--text-primary)",
  outline: "none",
};