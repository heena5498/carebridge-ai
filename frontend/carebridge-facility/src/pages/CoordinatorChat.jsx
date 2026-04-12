import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { sendChatMessage, clearChatSession } from "../api/chat";
import { fetchCases } from "../api/cases";

export default function CoordinatorChat() {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlCaseId = searchParams.get("case_id")
        ? Number(searchParams.get("case_id"))
        : null;

    const [selectedCaseId, setSelectedCaseId] = useState(urlCaseId);
    const [cases, setCases] = useState([]);
    const [casesLoading, setCasesLoading] = useState(true);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);

    // Load case list for the dropdown
    useEffect(() => {
        fetchCases()
            .then((data) => setCases(data))
            .catch(() => setCases([]))
            .finally(() => setCasesLoading(false));
    }, []);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleClear = useCallback(async () => {
        if (sessionId) {
            try {
                await clearChatSession(sessionId);
            } catch {
                // ignore — session may already be gone server-side
            }
        }
        setMessages([]);
        setSessionId(null);
        setError(null);
    }, [sessionId]);

    async function handleCaseChange(e) {
        const val = e.target.value;
        const newCaseId = val ? Number(val) : null;
        setSelectedCaseId(newCaseId);

        if (newCaseId) {
            setSearchParams({ case_id: newCaseId });
        } else {
            setSearchParams({});
        }

        // Await the clear so state is fully reset before user interacts again
        await handleClear();
    }

    async function sendMessage(customText) {
        const text = (customText ?? input).trim();
        if (!text || loading) return;

        // Add user message immediately for responsiveness
        const userMsg = { role: "user", text };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setError(null);
        setLoading(true);

        try {
            const payload = { message: text };
            if (sessionId) payload.session_id = sessionId;
            if (selectedCaseId) payload.case_id = selectedCaseId;

            const data = await sendChatMessage(payload);

            setSessionId(data.session_id);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", text: data.reply },
            ]);
        } catch (err) {
            const detail =
                err.response?.data?.detail || err.message || "Something went wrong";
            setError(detail);
            // Remove the optimistic user message since it wasn't processed
            setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.role === "user" && last.text === text) {
                    return prev.slice(0, -1);
                }
                return prev;
            });
            // Restore the input so the user can retry
            setInput(text);
        } finally {
            setLoading(false);
        }
    }

    const selectedCase = cases.find((c) => c.id === selectedCaseId);

    const suggestions = selectedCaseId
        ? [
              "Summarize this patient's case",
              "What medications are prescribed?",
              "Are there any high risks?",
              "What follow-ups are scheduled?",
          ]
        : [
              "How do I create a new care plan?",
              "What is the intake workflow?",
          ];

    return (
        <div className="page-shell">
            <div className="container">
                <Navbar />

                {/* Header */}
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
                            AI assistant grounded in patient case data
                        </p>
                    </div>

                    <button
                        onClick={handleClear}
                        className="outline-btn"
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                        disabled={loading}
                    >
                        Clear chat
                    </button>
                </div>

                {/* Patient selector */}
                <div
                    className="card"
                    style={{
                        padding: "14px",
                        marginBottom: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                    }}
                >
                    <label
                        style={{
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "var(--text-primary)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Patient context:
                    </label>
                    <select
                        value={selectedCaseId ?? ""}
                        onChange={handleCaseChange}
                        disabled={casesLoading || loading}
                        style={{
                            flex: 1,
                            minWidth: "200px",
                            padding: "9px 12px",
                            border: "0.5px solid var(--border)",
                            borderRadius: "10px",
                            background: "var(--bg-white)",
                            color: "var(--text-primary)",
                            fontSize: "13px",
                            outline: "none",
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        <option value="">
                            {casesLoading
                                ? "Loading patients..."
                                : "No patient selected (general chat)"}
                        </option>
                        {cases.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.patient_name} — {c.status.replace(/_/g, " ")}
                            </option>
                        ))}
                    </select>
                    {selectedCase && (
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
                            Case #{selectedCaseId}
                        </span>
                    )}
                </div>

                {/* Messages area */}
                <div className="card" style={{ padding: "16px", marginBottom: "14px" }}>
                    <div
                        ref={scrollRef}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px",
                            maxHeight: "480px",
                            overflowY: "auto",
                            paddingRight: "4px",
                        }}
                    >
                        {messages.length === 0 && !loading && (
                            <p
                                style={{
                                    textAlign: "center",
                                    color: "var(--text-muted)",
                                    fontSize: "13px",
                                    padding: "40px 0",
                                }}
                            >
                                {selectedCaseId
                                    ? `Ask anything about ${selectedCase?.patient_name || "this patient"}`
                                    : "Select a patient above for case-aware chat, or ask a general question"}
                            </p>
                        )}

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
                                                    whiteSpace: "pre-wrap",
                                                }}
                                            >
                                                {message.text}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {loading && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
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
                                <div
                                    style={{
                                        background: "var(--bg-white)",
                                        border: "0.5px solid var(--border)",
                                        borderRadius: "4px 14px 14px 14px",
                                        padding: "12px 14px",
                                        fontSize: "13px",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error banner */}
                {error && (
                    <div
                        style={{
                            background: "#FEF2F2",
                            border: "1px solid #FECACA",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            marginBottom: "14px",
                            fontSize: "12px",
                            color: "#991B1B",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <span>{error}</span>
                        <button
                            onClick={() => setError(null)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#991B1B",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: 700,
                                padding: "0 4px",
                                flexShrink: 0,
                            }}
                        >
                            x
                        </button>
                    </div>
                )}

                {/* Suggestion chips */}
                {messages.length === 0 && (
                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                            marginBottom: "14px",
                        }}
                    >
                        {suggestions.map((item) => (
                            <button
                                key={item}
                                onClick={() => sendMessage(item)}
                                disabled={loading}
                                style={{
                                    background: "var(--bg-white)",
                                    border: "0.5px solid var(--border)",
                                    color: "var(--primary)",
                                    padding: "7px 12px",
                                    borderRadius: "999px",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    cursor: loading ? "not-allowed" : "pointer",
                                    opacity: loading ? 0.5 : 1,
                                }}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input area */}
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
                                if (e.key === "Enter" && !e.shiftKey) sendMessage();
                            }}
                            placeholder={
                                selectedCaseId
                                    ? `Ask about ${selectedCase?.patient_name || "this patient"}...`
                                    : "Ask a question..."
                            }
                            disabled={loading}
                            style={{
                                flex: 1,
                                border: "0.5px solid var(--border)",
                                borderRadius: "12px",
                                padding: "11px 14px",
                                background: "var(--bg-white)",
                                color: "var(--text-primary)",
                                outline: "none",
                                opacity: loading ? 0.6 : 1,
                            }}
                        />

                        <button
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            style={{
                                width: "42px",
                                height: "42px",
                                border: "none",
                                borderRadius: "12px",
                                background: "var(--primary)",
                                color: "white",
                                fontSize: "16px",
                                flexShrink: 0,
                                cursor:
                                    loading || !input.trim()
                                        ? "not-allowed"
                                        : "pointer",
                                opacity: loading || !input.trim() ? 0.5 : 1,
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
