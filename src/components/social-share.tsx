"use client";

import { useState } from "react";
import { Share2, Check, Copy, MessageCircle, Send } from "lucide-react";

type Props = {
  title: string;
  url?: string;
  description?: string;
};

export function SocialShare({ title, url, description }: Props) {
  const [copied, setCopied] = useState(false);

  // Fallback to window.location.href in browser if url not explicitly passed
  const shareUrl =
    url ||
    (typeof window !== "undefined"
      ? window.location.href
      : "https://ourmocks.com");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(
    `${title} — Check out this detailed guide on OurMocks:\n${shareUrl}`,
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        padding: "16px 20px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        margin: "24px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Share2 size={17} style={{ color: "var(--blue, #1f5eff)" }} />
        <strong style={{ fontSize: "13px", color: "#0f172a" }}>
          Share this with fellow aspirants
        </strong>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {/* WhatsApp Share */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#25D366",
            color: "#ffffff",
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <MessageCircle size={14} /> WhatsApp
        </a>

        {/* Telegram Share */}
        <a
          href={`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#0088cc",
            color: "#ffffff",
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <Send size={13} /> Telegram
        </a>

        {/* X / Twitter Share */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: "#0f172a",
            color: "#ffffff",
            padding: "6px 12px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          𝕏 Share
        </a>

        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopy}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: copied ? "#dcfce7" : "#ffffff",
            color: copied ? "#15803d" : "#334155",
            border: "1px solid #cbd5e1",
            padding: "6px 12px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Link Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
