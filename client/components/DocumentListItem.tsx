import React from "react";
import { FileText, Layers, Clock, Trash2 } from "lucide-react";
import type { DocumentInfo } from "@/lib/api";

interface DocumentListItemProps {
  doc: DocumentInfo;
  isActive: boolean;
  onSelect: (docId: string) => void;
  onDelete: (e: React.MouseEvent, doc: DocumentInfo) => void;
}

export default function DocumentListItem({ doc, isActive, onSelect, onDelete }: DocumentListItemProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div
      onClick={() => onSelect(doc.id)}
      className="animate-fade-in group"
      style={{
        padding: "12px", marginBottom: "6px", borderRadius: "var(--radius-md)",
        cursor: "pointer", transition: "all 0.2s ease",
        background: isActive ? "var(--bg-hover)" : "transparent",
        border: isActive ? "1px solid var(--border-accent)" : "1px solid transparent",
      }}
      onMouseOver={(e) => {
        if (!isActive)
          (e.currentTarget as HTMLElement).style.background = "var(--bg-tertiary)";
      }}
      onMouseOut={(e) => {
        if (!isActive)
          (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <div style={{ display: "flex", alignItems: "start", gap: "10px" }}>
        <FileText size={18} style={{ color: "var(--accent-primary)", flexShrink: 0, marginTop: "2px" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: "13px", fontWeight: 600, overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{doc.filename}</p>
          <div style={{ display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px" }}>
              <Layers size={10} /> {doc.totalChunks} chunks
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px" }}>
              <Clock size={10} /> {formatDate(doc.uploadedAt)}
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {doc.totalPages} pages • {formatSize(doc.fileSize)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <button
            type="button"
            onClick={(e) => onDelete(e, doc)}
            aria-label="Delete document"
            className="delete-btn"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "4px",
              borderRadius: "6px",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--error)";
              (e.currentTarget as HTMLElement).style.background = "var(--error-bg)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
