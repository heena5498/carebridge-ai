import { Link, useLocation } from "react-router-dom";
import logo from "../assets/icon.png";

export default function Navbar() {
    const location = useLocation();

    const tabs = [
        { label: "Patients", path: "/facility/patients" },
        { label: "Dashboard", path: "/facility/dashboard" },
        { label: "Care plan", path: "/facility/care-plan" },
        { label: "Chat", path: "/facility/chat" },
    ];

    return (
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

                <div>
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
                    <div
                        style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                        }}
                    >
                        Facility staff view
                    </div>
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: "6px",
                        background: "var(--border-light)",
                        padding: "4px",
                        borderRadius: "12px",
                        flexWrap: "wrap",
                    }}
                >
                    {tabs.map((tab) => {
                        const active = location.pathname === tab.path;

                        return (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: "10px",
                                    background: active ? "var(--bg-white)" : "transparent",
                                    color: active ? "var(--primary)" : "var(--text-muted)",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    border: active
                                        ? "0.5px solid var(--border)"
                                        : "0.5px solid transparent",
                                }}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>

                <Link to="/facility/new-plan">
                    <button className="primary-btn">Upload PDF</button>
                </Link>
            </div>
        </div>
    );
}