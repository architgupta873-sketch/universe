"use client";

import { Event, useAppContext } from "@/context/AppContext";
import { useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";

interface EventDetailModalProps {
  event: Event;
  onClose: () => void;
}

// ── Category icon system (matches EventCard) ──
const CATEGORY_ICONS: Record<string, { color: string; bg: string; border: string; icon: JSX.Element }> = {
  Technical: {
    color: "#38bdf8", bg: "rgba(56, 189, 248, 0.10)", border: "rgba(56, 189, 248, 0.20)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
  },
  Cultural: {
    color: "#a78bfa", bg: "rgba(167, 139, 250, 0.10)", border: "rgba(167, 139, 250, 0.20)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  },
  Competitions: {
    color: "#fbbf24", bg: "rgba(251, 191, 36, 0.10)", border: "rgba(251, 191, 36, 0.20)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  },
  Workshops: {
    color: "#34d399", bg: "rgba(52, 211, 153, 0.10)", border: "rgba(52, 211, 153, 0.20)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  },
  Fun: {
    color: "#f472b6", bg: "rgba(244, 114, 182, 0.10)", border: "rgba(244, 114, 182, 0.20)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>,
  },
  Sports: {
    color: "#fb923c", bg: "rgba(251, 146, 60, 0.10)", border: "rgba(251, 146, 60, 0.20)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>,
  },
  Gaming: {
    color: "#22d3ee", bg: "rgba(34, 211, 238, 0.10)", border: "rgba(34, 211, 238, 0.20)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" /><line x1="15" y1="13" x2="15.01" y2="13" /><line x1="18" y1="11" x2="18.01" y2="11" /><rect x="2" y="6" width="20" height="12" rx="2" /></svg>,
  },
};

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const { registeredEventIds, registerForEvent, unregisterFromEvent } = useAppContext();
  const isRegistered = registeredEventIds.includes(event.id);
  const [justRegistered, setJustRegistered] = useState(false);
  const [copied, setCopied] = useState(false);

  const catTheme = CATEGORY_ICONS[event.genre] || CATEGORY_ICONS.Technical;

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#a78bfa", "#8b5cf6", "#c4b5fd", "#34d399", "#fbbf24"],
      disableForReducedMotion: true,
    });
  }, []);

  const handleRegister = () => {
    registerForEvent(event.id);
    setJustRegistered(true);
    fireConfetti();
    setTimeout(() => setJustRegistered(false), 2500);
  };

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleAddToCalendar = () => {
    const start = event.date.replace(/-/g, "");
    const end = start; // single day event
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue || "")}`;
    window.open(url, "_blank");
  };

  const handleShare = async () => {
    const text = `${event.title} — ${formatDate(event.date)} at ${event.venue || "TBA"}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header accent bar — uses category color */}
        <div
          className="h-1.5 rounded-t-[20px]"
          style={{ background: `linear-gradient(90deg, ${catTheme.color}, ${catTheme.color}40)` }}
        />

        <div className="p-6 sm:p-8">
          {/* Close button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
              aria-label="Close modal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Category icon + badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center border"
              style={{ color: catTheme.color, background: catTheme.bg, borderColor: catTheme.border }}
            >
              {catTheme.icon}
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{ background: catTheme.bg, color: catTheme.color, borderColor: catTheme.border }}
            >
              {event.genre}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10">
              {event.clubName}
            </span>
            {event.eventType && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                event.eventType === "Free"
                  ? "bg-[#10b981]/10 text-[#34d399] border-[#10b981]/25"
                  : "bg-[#ffa502]/10 text-[#ffa502] border-[#ffa502]/25"
              }`}>
                {event.eventType}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
            {event.title}
          </h2>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {/* Date */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: catTheme.bg, color: catTheme.color }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Date</p>
                <p className="text-sm text-white font-medium">{formatDate(event.date)}</p>
              </div>
            </div>

            {/* Venue */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: catTheme.bg, color: catTheme.color }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Venue</p>
                <p className="text-sm text-white font-medium">{event.venue || "TBA"}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">About this event</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{event.description}</p>
          </div>

          {/* Quick actions: Calendar & Share */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={handleAddToCalendar}
              className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg bg-white/[0.04] border border-white/8 text-gray-400 hover:text-white hover:border-white/15 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Add to Calendar
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg bg-white/[0.04] border border-white/8 text-gray-400 hover:text-white hover:border-white/15 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {copied ? "Copied!" : "Share"}
            </button>
          </div>

          {/* Success feedback */}
          {justRegistered && (
            <div
              className="mb-4 text-center py-2.5 rounded-xl text-sm font-semibold"
              style={{
                color: "#34d399",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                animation: "fadeInUp 0.3s ease forwards",
              }}
            >
              You&apos;re registered! 🎉
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {isRegistered ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30 flex-1 justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Registered
                </span>
                <button
                  onClick={() => unregisterFromEvent(event.id)}
                  className="btn-danger text-sm py-2.5 px-5"
                >
                  Unregister
                </button>
              </>
            ) : (
              <button
                onClick={handleRegister}
                className="btn-primary text-sm py-2.5 w-full"
              >
                Register for this Event
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
