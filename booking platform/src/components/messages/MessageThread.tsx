"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface ThreadMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { name: string | null };
}

export function MessageThread({
  bookingId,
  recipientId,
  currentUserId,
  initialMessages,
  canDraftWithAI = false,
}: {
  bookingId: string;
  recipientId: string;
  currentUserId: string;
  initialMessages: ThreadMessage[];
  canDraftWithAI?: boolean;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [drafting, setDrafting] = useState(false);

  async function sendMessage() {
    if (!draft.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${bookingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft, recipientId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((prev) => [
        ...prev,
        { ...data.message, sender: { name: "You" } },
      ]);
      setDraft("");
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  async function aiDraft() {
    const lastGuestMessage = [...messages].reverse().find((m) => m.senderId !== currentUserId);
    if (!lastGuestMessage) return;

    setDrafting(true);
    try {
      const res = await fetch(`/api/messages/${bookingId}/ai-draft-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestMessage: lastGuestMessage.content }),
      });
      const data = await res.json();
      if (res.ok) setDraft(data.draft);
    } finally {
      setDrafting(false);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-2xl border border-border bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-xs rounded-2xl px-4 py-2 text-sm",
                  mine ? "bg-gradient-to-r from-coral-from to-coral-to text-white" : "bg-surface text-text-body",
                )}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="text-center text-sm text-text-muted">No messages yet — say hello.</p>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        {canDraftWithAI && (
          <button
            onClick={aiDraft}
            disabled={drafting}
            title="Draft a reply with AI"
            className="rounded-full p-2 text-ocean hover:bg-surface disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        )}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Write a message…"
          className="flex-1 rounded-full border border-border px-4 py-2 text-sm outline-none focus:border-ocean"
        />
        <Button size="sm" onClick={sendMessage} disabled={sending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
