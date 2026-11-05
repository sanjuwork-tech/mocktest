"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, Send, Share2 } from "lucide-react";
import "./social-share.css";

type Props = {
  title: string;
  /** Absolute canonical URL of the page being shared. */
  url: string;
  description?: string;
};

export function SocialShare({ title, url }: Props) {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title}: a guide on OurMocks\n${url}`);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    setTimeout(() => setCopied("idle"), 2500);
  };

  const newTab = <span className="sr-only"> (opens in a new tab)</span>;

  return (
    <div className="share-box">
      <p className="share-title">
        <Share2 size={18} aria-hidden="true" /> Share this with a friend preparing too
      </p>
      <div className="share-actions">
        <a className="share-button" href={`https://api.whatsapp.com/send?text=${encodedText}`} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={16} aria-hidden="true" /> WhatsApp{newTab}
        </a>
        <a
          className="share-button"
          href={`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Send size={16} aria-hidden="true" /> Telegram{newTab}
        </a>
        <a
          className="share-button"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share on X{newTab}
        </a>
        <button type="button" className={`share-button${copied === "done" ? " is-done" : ""}`} onClick={handleCopy}>
          {copied === "done" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          <span aria-live="polite">
            {copied === "done" ? "Link copied" : copied === "failed" ? "Couldn't copy. Use the address bar" : "Copy link"}
          </span>
        </button>
      </div>
    </div>
  );
}
