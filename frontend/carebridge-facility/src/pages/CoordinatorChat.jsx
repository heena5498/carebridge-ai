import { useState } from "react";
import Navbar from "../components/Navbar";
import facilityMockData from "../data/facilityMockData";

export default function CoordinatorChat() {
    const [messages, setMessages] = useState(facilityMockData.chat.messages);
    const [input, setInput] = useState("");

    function sendMessage(customText) {
        const text = (customText ?? input).trim();
        if (!text) return;

        const userMessage = {
            role: "user",
            text,
        };

        const assistantMessage = {
            role: "assistant",
            text:
                "This is a frontend prototype response. Later you can connect this to your backend /api/chat endpoint so the answer comes from Agent 5 with real document-grounded citations.",
            sources: ["Agent 5 mock response", "Facility mock dataset"],
            highlight:
                "Use this area for proactive warnings from Medication Safety or Missing Info agents when relevant.",
        };

        setMessages((prev) => [...prev, userMessage, assistantMessage]);
        setInput("");
    }

    return (
        <div className="page-shell">
            <div className="container">
                <Navbar />

                <div
                    style={{
                        marginBottom: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        gap: "16px",
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <h1 className="section-title">Coordinator chat</h1>
                        <p className="section-subtitle">
                            Real-time Q&A grounded in the discharge document and all five agent
                            outputs
                        </p>
                    </div>

                    <span
                        style={{
                            background: "var(--primary-light)",
                            color: "var(--primary)",
                            padding: "5px 12px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 500,
                        }}
                    >
            Grounded
          </span>
                </div>

                <div className="card" style={{ padding: "14px", marginBottom: "16px" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        <div
                            style={{
                                width: "42px",
                                height: "48px",
                                borderRadius: "6px",
                                border: "0.5px solid var(--border)",
                                background: "var(--border-light)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: 500,
                                color: "var(--text-muted)",
                                flexShrink: 0,
                            }}
                        >
                            PDF
                        </div>

                        <div style={{ flex: 1 }}>
                            <p
                                style={{
                                    margin: "0 0 2px",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    color: "var(--text-primary)",
                                }}
                            >
                                {facilityMockData.chat.contextTitle}
                            </p>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "11px",
                                    color: "var(--text-muted)",
                                }}
                            >
                                {facilityMockData.chat.contextMeta}
                            </p>
                        </div>

                        <span
                            style={{
                                background: "var(--primary-light)",
                                color: "var(--primary)",
                                padding: "4px 10px",
                                borderRadius: "999px",
                                fontSize: "10px",
                                fontWeight: 500,
                            }}
                        >
              Grounded
            </span>
                    </div>
                </div>

                <div className="card" style={{ padding: "16px", marginBottom: "14px" }}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px",
                            maxHeight: "480px",
                            overflowY: "auto",
                            paddingRight: "4px",
                        }}
                    >
                        {messages.map((message, index) => {
                            if (message.role === "user") {
                                return (
                                    <div
                                        key={index}
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <div
                                            style={{
                                                maxWidth: "85%",
                                                background: "var(--primary)",
                                                color: "white",
                                                padding: "10px 14px",
                                                borderRadius: "14px 14px 4px 14px",
                                                fontSize: "13px",
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            {message.text}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "10px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "30px",
                                            height: "30px",
                                            borderRadius: "50%",
                                            background: "var(--primary-light)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "var(--primary)",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            flexShrink: 0,
                                        }}
                                    >
                                        CB
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                background: "var(--bg-white)",
                                                border: "0.5px solid var(--border)",
                                                borderRadius: "4px 14px 14px 14px",
                                                padding: "12px 14px",
                                            }}
                                        >
                                            <p
                                                style={{
                                                    margin: 0,
                                                    fontSize: "13px",
                                                    lineHeight: 1.6,
                                                    color: "var(--text-primary)",
                                                }}
                                            >
                                                {message.text}
                                            </p>

                                            {message.highlight && (
                                                <div
                                                    style={{
                                                        marginTop: "10px",
                                                        background: "var(--status-attention-bg)",
                                                        border: "0.5px solid #FDE68A",
                                                        borderRadius: "10px",
                                                        padding: "8px 10px",
                                                    }}
                                                >
                                                    <p
                                                        style={{
                                                            margin: "0 0 4px",
                                                            fontSize: "11px",
                                                            fontWeight: 500,
                                                            color: "var(--status-attention-text)",
                                                        }}
                                                    >
                                                        ! Note from Med Safety agent
                                                    </p>
                                                    <p
                                                        style={{
                                                            margin: 0,
                                                            fontSize: "12px",
                                                            lineHeight: 1.5,
                                                            color: "#78350F",
                                                        }}
                                                    >
                                                        {message.highlight}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {message.sources && (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "6px",
                                                    flexWrap: "wrap",
                                                    marginTop: "6px",
                                                }}
                                            >
                                                {message.sources.map((source, sourceIndex) => (
                                                    <span
                                                        key={sourceIndex}
                                                        style={{
                                                            background: "#F5F0E5",
                                                            color: "var(--text-muted)",
                                                            padding: "4px 8px",
                                                            borderRadius: "999px",
                                                            fontSize: "10px",
                                                        }}
                                                    >
                            {source}
                          </span>
                                                ))}
                                            </div>
                                        )}

                                        <p
                                            style={{
                                                margin: "4px 0 0",
                                                fontSize: "10px",
                                                color: "var(--text-faint)",
                                            }}
                                        >
                                            Just now
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginBottom: "14px",
                    }}
                >
                    {facilityMockData.chat.suggestions.map((item) => (
                        <button
                            key={item}
                            onClick={() => sendMessage(item)}
                            style={{
                                background: "var(--bg-white)",
                                border: "0.5px solid var(--border)",
                                color: "var(--primary)",
                                padding: "7px 12px",
                                borderRadius: "999px",
                                fontSize: "12px",
                                fontWeight: 500,
                            }}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div className="card" style={{ padding: "12px" }}>
                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                        }}
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage();
                            }}
                            placeholder="Ask about this patient's discharge..."
                            style={{
                                flex: 1,
                                border: "0.5px solid var(--border)",
                                borderRadius: "12px",
                                padding: "11px 14px",
                                background: "var(--bg-white)",
                                color: "var(--text-primary)",
                                outline: "none",
                            }}
                        />

                        <button
                            onClick={() => sendMessage()}
                            style={{
                                width: "42px",
                                height: "42px",
                                border: "none",
                                borderRadius: "12px",
                                background: "var(--primary)",
                                color: "white",
                                fontSize: "16px",
                                flexShrink: 0,
                            }}
                        >
                            ↑
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}