import { useState, useRef, useEffect } from "react";
import useChat from "../../hooks/useChat";

const SUGGESTED = [
  "What follow-ups are still missing?",
  "How many meds am I on?",
  "Heart failure warning signs?",
  "Are my meds safe together?",
];

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 mb-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "#1B5E3B" }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 10l3-3 6-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
        style={{ border: "0.5px solid #E0D5C0", background: "#fff", borderRadius: "2px 12px 12px 12px" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`inline-block rounded-full dot-bounce ${i === 1 ? "dot-bounce-delay1" : i === 2 ? "dot-bounce-delay2" : ""}`}
            style={{ width: 7, height: 7, background: "#C4B9A0" }}
          />
        ))}
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-start gap-2 mb-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "#1B5E3B" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 10l3-3 6-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      <div
        className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2.5"
        style={{
          borderRadius: isUser ? "12px 12px 2px 12px" : "2px 12px 12px 12px",
          background: isUser ? "#1B5E3B" : "#fff",
          color: isUser ? "#fff" : "#1E293B",
          border: isUser ? "none" : "0.5px solid #E0D5C0",
          fontSize: "13px",
          lineHeight: "1.5",
          whiteSpace: "pre-wrap",
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatTab({ aiContext = "" }) {
  const { messages, loading, sendMessage } = useChat(aiContext);
  const [input, setInput] = useState("");
  const [hasSent, setHasSent] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    sendMessage(msg);
    setInput("");
    setHasSent(true);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full p-5 max-w-3xl mx-auto w-full">
      <div className="mb-4">
        <h1 className="font-semibold text-xl" style={{ color: "#1E293B" }}>Ask CareBridge</h1>
        <p className="mt-0.5" style={{ fontSize: "13px", color: "#7A6B52" }}>
          Ask anything about your care plans, medications, or follow-ups
        </p>
      </div>

      {/* Context bar */}
      <div
        className="flex items-start justify-between rounded-card px-4 py-3 mb-4"
        style={{ background: "#fff", border: "0.5px solid #E0D5C0" }}
      >
        <div>
          <div className="font-medium" style={{ fontSize: "13px", color: "#1E293B" }}>
            Asking across all 4 care plans
          </div>
          <div style={{ fontSize: "11px", color: "#7A6B52", marginTop: "2px" }}>
            Heart failure, Type 2 diabetes, Hip fracture, UTI
          </div>
        </div>
        <button
          className="text-xs px-3 py-1 rounded-pill font-medium"
          style={{ border: "0.5px solid #1B5E3B", color: "#1B5E3B", background: "transparent", fontSize: "11px" }}
        >
          Switch plan
        </button>
      </div>

      {/* Suggested pills */}
      {!hasSent && (
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTED.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 rounded-pill font-medium transition-colors"
              style={{ background: "#E8F0E4", color: "#1B5E3B", fontSize: "12px", border: "0.5px solid #C4B9A0" }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 min-h-0" style={{ maxHeight: "calc(100vh - 420px)" }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div>
        <div className="flex gap-2 items-end">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            placeholder="Type your question..."
            className="flex-1 rounded-sm2 px-4 py-2.5 outline-none transition-colors"
            style={{
              background: "#FDF6EC",
              border: "0.5px solid #E0D5C0",
              fontSize: "13px",
              color: "#1E293B",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1B5E3B")}
            onBlur={(e) => (e.target.style.borderColor = "#E0D5C0")}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-sm2 flex items-center justify-center shrink-0 transition-opacity"
            style={{ background: "#1B5E3B", opacity: loading || !input.trim() ? 0.5 : 1 }}
          >
            {loading ? (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h12M10 4l6 4-6 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
        <p className="mt-2 text-center" style={{ fontSize: "10px", color: "#A39880" }}>
          CareBridge provides information only — always follow your doctor's advice.
        </p>
      </div>
    </div>
  );
}
