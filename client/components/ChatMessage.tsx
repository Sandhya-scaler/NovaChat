import React from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles } from "lucide-react";
import SourceCitation from "./SourceCitation";
import type { Source } from "@/lib/api";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: Message;
  onSourceClick?: (pageNumber: number) => void;
}

export default function ChatMessage({ message, onSourceClick }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={isUser ? "animate-slide-right flex justify-end gap-3" : "animate-slide-left flex justify-start gap-3"}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--gradient-primary)] flex items-center justify-center shrink-0 mt-1">
          <Sparkles size={16} color="white" />
        </div>
      )}

      <div
        className={`message-bubble ${isUser ? "user-bubble" : "assistant-bubble"} relative max-w-[75%]`}
        style={{
          padding: isUser ? "12px 18px" : "16px 20px",
          borderRadius: isUser
            ? "var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)"
            : "var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px",
          border: isUser ? "none" : "1px solid var(--border)",
          color: "var(--text-primary)",
        }}
      >
        {!isUser ? (
          <div className="markdown-content">
            <ReactMarkdown>{message.content || ""}</ReactMarkdown>
            {message.isStreaming && <span className="streaming-cursor" aria-hidden="true" />}
          </div>
        ) : (
          <p className="text-sm leading-relaxed">
            {message.content}
          </p>
        )}

        {/* Source Citations */}
        {message.sources && message.sources.length > 0 && (
          <SourceCitation sources={message.sources} onSelectSource={onSourceClick} />
        )}
      </div>
    </div>
  );
}
