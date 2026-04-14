"use client";

import { useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { Event, useAppContext } from "@/context/AppContext";

interface EventCardProps {
  event: Event;
  onCardClick?: (event: Event) => void;
  soonLabel?: string;
}

// ── Category design system ──
const CATEGORY_THEME: Record<string, {
  color: string;
  bg: string;
  border: string;
  glow: string;
  gradient: string;
  icon: JSX.Element;
}> = {
  Technical: {
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.10)",
    border: "rgba(56, 189, 248, 0.20)",
    glow: "rgba(56, 189, 248, 0.15)",
    gradient: "linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, transparent 60%)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  Cultural: {
    color: "#a78bfa",
    bg: "rgba(167, 139, 250, 0.10)",
    border: "rgba(167, 139, 250, 0.20)",
    glow: "rgba(167, 139, 250, 0.15)",
    gradient: "linear-gradient(135deg, rgba(167, 139, 250, 0.08) 0%, transparent 60%)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  Competitions: {
    color: "#fbbf24",
    bg: "rgba(251, 191, 36, 0.10)",
    border: "rgba(251, 191, 36, 0.20)",
    glow: "rgba(251, 191, 36, 0.15)",
    gradient: "linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, transparent 60%)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  Workshops: {
    color: "#34d399",
    bg: "rgba(52, 211, 153, 0.10)",
    border: "rgba(52, 211, 153, 0.20)",
    glow: "rgba(52, 211, 153, 0.15)",
    gradient: "linear-gradient(135deg, rgba(52, 211, 153, 0.08) 0%, transparent 60%)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  Fun: {
    color: "#f472b6",
    bg: "rgba(244, 114, 182, 0.10)",
    border: "rgba(244, 114, 182, 0.20)",
    glow: "rgba(244, 114, 182, 0.15)",
    gradient: "linear-gradient(135deg, rgba(244, 114, 182, 0.08) 0%, transparent 60%)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  Sports: {
    color: "#fb923c",
    bg: "rgba(251, 146, 60, 0.10)",
    border: "rgba(251, 146, 60, 0.20)",
    glow: "rgba(251, 146, 60, 0.15)",
    gradient: "linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, transparent 60%)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  Gaming: {
    color: "#22d3ee",
    bg: "rgba(34, 211, 238, 0.10)",
    border: "rgba(34, 211, 238, 0.20)",
    glow: "rgba(34, 211, 238, 0.15)",
    gradient: "linear-gradient(135deg, rgba(34, 211, 238, 0.08) 0%, transparent 60%)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" /><line x1="15" y1="13" x2="15.01" y2="13" /><line x1="18" y1="11" x2="18.01" y2="11" />
        <rect x="2" y="6" width="20" height="12" rx="2" />
      </svg>
    ),
  },
};

const DEFAULT_THEME = CATEGORY_THEME.Technical;

export default function EventCard({ event, onCardClick, soonLabel }: EventCardProps) {
  const { registeredEventIds, registerForEvent, unregisterFromEvent } = useAppContext();
  const isRegistered = registeredEventIds.includes(event.id);
  const [justRegistered, setJustRegistered] = useState(false);

  const theme = CATEGORY_THEME[event.genre] || DEFAULT_THEME;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#a78bfa", "#8b5cf6", "#c4b5fd", "#34d399", "#fbbf24"],
      disableForReducedMotion: true,
    });
  }, []);

  const handleCardClick = () => {
    if (onCardClick) onCardClick(event);
  };

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRegistered) return;
    registerForEvent(event.id);
    setJustRegistered(true);
    fireConfetti();
    setTimeout(() => setJustRegistered(false), 2000);
  };

  const handleUnregisterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    unregisterFromEvent(event.id);
    setJustRegistered(false);
  };

  return (
    <div
      className="evt-card opacity-0 animate-fadeInUp"
      style={{
        ["--cat-color" as string]: theme.color,
        ["--cat-glow" as string]: theme.glow,
        ["--cat-border" as string]: theme.border,
      }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") handleCardClick(); }}
    >
      {/* Top row: icon + category badge */}
      <div className="evt-card__header">
        <div
          className="evt-card__icon"
          style={{ color: theme.color, background: theme.bg, borderColor: theme.border }}
        >
          {theme.icon}
        </div>
        <span
          className="evt-card__badge"
          style={{ color: theme.color, background: theme.bg, borderColor: theme.border }}
        >
          {event.genre}
        </span>
        {soonLabel && (
          <span className="evt-card__soon">
            <span className="evt-card__soon-dot" />
            {soonLabel}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="evt-card__title">{event.title}</h3>

      {/* Date row */}
      <div className="evt-card__date">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>{formatDate(event.date)}</span>
      </div>

      {/* Description */}
      <p className="evt-card__desc">{event.description}</p>

      {/* Footer: club name + register */}
      <div className="evt-card__footer">
        <span className="evt-card__club">{event.clubName}</span>

        {isRegistered ? (
          <div className="evt-card__reg-group">
            <span
              className="evt-card__reg-badge"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Registered
            </span>
            <button
              onClick={handleUnregisterClick}
              className="evt-card__undo"
            >
              Undo
            </button>
          </div>
        ) : (
          <button
            onClick={handleRegisterClick}
            className="evt-card__register"
          >
            Register
          </button>
        )}
      </div>

      {/* Success flash */}
      {justRegistered && (
        <div className="evt-card__flash">
          You&apos;re registered! 🎉
        </div>
      )}
    </div>
  );
}
