import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/icon.png";

export default function AuthPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const role = searchParams.get("role") || "facility";
    const [mode, setMode] = useState("login");

    const pageContent = useMemo(() => {
        if (role === "patient") {
            return {
                title:
                    mode === "login" ? "Patient login" : "Create your patient account",
                subtitle:
                    "Access your discharge summary in plain language and view your next steps.",
                primaryAction:
                    mode === "login" ? "Login as patient" : "Register as patient",
            };
        }

        return {
            title:
                mode === "login"
                    ? "Facility staff login"
                    : "Create your facility account",
            subtitle:
                "Access intake dashboards, care plans, and coordinator chat for new admissions.",
            primaryAction:
                mode === "login" ? "Login as facility staff" : "Register as facility staff",
        };
    }, [role, mode]);

    function handleSubmit(e) {
        e.preventDefault();

        if (role === "facility") {
            navigate("/facility/patients");
        } else {
            navigate("/facility/dashboard");
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

                <div
                    style={{
                        maxWidth: "520px",
                        margin: "40px auto 0",
                    }}
                >
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
                                    color:
                                        mode === "register" ? "var(--primary)" : "var(--text-muted)",
                                    fontWeight: 500,
                                }}
                            >
                                Register
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {mode === "register" && (
                                <div style={{ marginBottom: "14px" }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "6px",
                                            fontSize: "13px",
                                            color: "var(--text-primary)",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Full name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        style={inputStyle}
                                    />
                                </div>
                            )}

                            <div style={{ marginBottom: "14px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "6px",
                                        fontSize: "13px",
                                        color: "var(--text-primary)",
                                        fontWeight: 500,
                                    }}
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ marginBottom: "18px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "6px",
                                        fontSize: "13px",
                                        color: "var(--text-primary)",
                                        fontWeight: 500,
                                    }}
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    style={inputStyle}
                                />
                            </div>

                            <button
                                type="submit"
                                className="primary-btn"
                                style={{
                                    width: "100%",
                                    padding: "12px 16px",
                                }}
                            >
                                {pageContent.primaryAction}
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
                            {mode === "login"
                                ? "Don’t have an account?"
                                : "Already have an account?"}{" "}
                            <button
                                type="button"
                                onClick={() =>
                                    setMode((prev) => (prev === "login" ? "register" : "login"))
                                }
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

const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "0.5px solid var(--border)",
    borderRadius: "12px",
    background: "var(--bg-white)",
    color: "var(--text-primary)",
    outline: "none",
};