import { useState, useCallback } from "react";

const GEMINI_MODEL = "gemini-2.0-flash";

export default function useChat(aiContext = "No care-plan context available.") {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const systemPrompt = `You are CareBridge AI, a warm and compassionate health assistant helping a patient understand their hospital discharge records and care plans. Speak in simple, plain language like a knowledgeable friend, not a doctor. Keep answers to 2-3 short paragraphs maximum. Never diagnose conditions, never prescribe treatments, never contradict a doctor's instructions. Always encourage the patient to check with their care team for anything serious. You have access to the following patient care context: ${aiContext}`;

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);
    setError(null);

    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing REACT_APP_GEMINI_API_KEY environment variable.");

      // Gemini uses "model" for assistant turns (not "assistant")
      const geminiContents = updated.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: geminiContents,
            generationConfig: { maxOutputTokens: 500 },
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I encountered an error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, systemPrompt]);

  return { messages, loading, error, sendMessage };
}
