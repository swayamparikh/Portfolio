"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "What's my next appointment?",
  "Explain my blood pressure medication",
  "What foods should I avoid with hypertension?",
  "What does my CBC test result mean?",
  "How often should I check my blood pressure?",
  "What are the side effects of Amlodipine?",
];

export default function WellnessChatClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm MediAI, your personal wellness assistant 👋\n\nI can help you with:\n• Understanding your appointments and prescriptions\n• Explaining your test results in simple language\n• General wellness and health tips\n• Follow-up reminders\n\n⚠️ **Medical Disclaimer**: I am an AI assistant and cannot provide medical diagnosis or replace professional medical advice. Always consult your doctor for medical concerns.\n\nHow can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const content = text ?? input.trim();
    if (!content || isStreaming) return;

    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    // Add empty assistant message for streaming
    setMessages([...newMessages, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullContent += chunk;
        setMessages([...newMessages, { role: "assistant", content: fullContent }]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment." },
      ]);
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  }

  function renderMessage(content: string) {
    // Simple markdown-like rendering
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/•/g, "•")
      .replace(/\n/g, "<br/>");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: "linear-gradient(135deg, #7c3aed, #0891b2)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
            boxShadow: "0 0 20px rgba(124,58,237,0.3)",
          }} className="animate-pulse-glow">
            🤖
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>MediAI Wellness Assistant</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "pulse-glow 2s infinite" }} />
              <span style={{ fontSize: 12, color: "#4d6280" }}>Online · Powered by GPT-4o</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 10, padding: "10px 16px", marginTop: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <p style={{ fontSize: 12, margin: 0, lineHeight: 1.5, color: "#fbbf24" }}>
            MediAI is an AI assistant and <strong>cannot diagnose conditions or replace your doctor</strong>. For medical emergencies, call <strong>108</strong> immediately.
          </p>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: 12, alignItems: "flex-end" }}>
              {msg.role === "assistant" && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                  🤖
                </div>
              )}
              <div
                className={`chat-bubble ${msg.role}`}
                dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) || (isStreaming && i === messages.length - 1 ? "<span style='opacity:0.5'>Thinking…</span>" : "") }}
              />
              {msg.role === "user" && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#0f766e,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>
                  You
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions (shown when idle) */}
        {messages.length <= 1 && !isStreaming && (
          <div style={{ padding: "0 20px 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                style={{
                  padding: "7px 14px",
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  borderRadius: 100,
                  fontSize: 12,
                  color: "#a78bfa",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 12 }}>
          <input
            ref={inputRef}
            className="form-input"
            style={{ flex: 1 }}
            placeholder="Ask about your appointments, prescriptions, or wellness tips…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={isStreaming}
            id="wellness-chat-input"
          />
          <button
            className="btn-primary"
            onClick={() => sendMessage()}
            disabled={isStreaming || !input.trim()}
            style={{ padding: "10px 20px", flexShrink: 0 }}
            id="send-chat-btn"
          >
            {isStreaming ? "⏳" : "Send →"}
          </button>
        </div>
      </div>
    </div>
  );
}
