"use client";

import { useEffect } from "react";
import { useAppContext, ALL_GENRES, ALL_PRICING, EventGenre, EventPricing } from "@/context/AppContext";

export interface FilterState {
  clubs: string[];
  genres: EventGenre[];
  dateRange: string[];
  eventType: EventPricing[];
}

export const EMPTY_FILTERS: FilterState = {
  clubs: [],
  genres: [],
  dateRange: [],
  eventType: [],
};

const DATE_OPTIONS = ["Today", "This Week", "This Month", "Upcoming"] as const;

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClose: () => void;
}

export default function FilterPanel({ filters, onChange, onClose }: FilterPanelProps) {
  const { clubs } = useAppContext();

  // Lock body scroll while panel is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const toggleItem = <T extends string>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];

  const totalActive =
    filters.clubs.length + filters.genres.length + filters.dateRange.length + filters.eventType.length;

  const clearAll = () => onChange(EMPTY_FILTERS);

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Slide-over panel from right */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md border-l border-white/[0.06] shadow-2xl flex flex-col"
        style={{ background: "rgba(17, 24, 39, 0.95)", backdropFilter: "blur(30px)", animation: "slideInRight 0.3s ease forwards" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[#a78bfa]">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filters
            </h2>
            {totalActive > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">{totalActive} filter{totalActive > 1 ? "s" : ""} active</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {totalActive > 0 && (
              <button onClick={clearAll} className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/10">
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
              aria-label="Close filters"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable filter sections */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Club filter */}
          <FilterSection title="Club" icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }>
            <div className="flex flex-wrap gap-2">
              {clubs.map((club) => (
                <FilterChip
                  key={club}
                  label={club}
                  active={filters.clubs.includes(club)}
                  onClick={() => onChange({ ...filters, clubs: toggleItem(filters.clubs, club) })}
                />
              ))}
            </div>
          </FilterSection>

          {/* Genre filter */}
          <FilterSection title="Genre" icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          }>
            <div className="flex flex-wrap gap-2">
              {ALL_GENRES.map((genre) => (
                <FilterChip
                  key={genre}
                  label={genre}
                  active={filters.genres.includes(genre)}
                  onClick={() => onChange({ ...filters, genres: toggleItem(filters.genres, genre) })}
                />
              ))}
            </div>
          </FilterSection>

          {/* Date filter */}
          <FilterSection title="Date" icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }>
            <div className="flex flex-wrap gap-2">
              {DATE_OPTIONS.map((opt) => (
                <FilterChip
                  key={opt}
                  label={opt}
                  active={filters.dateRange.includes(opt)}
                  onClick={() => onChange({ ...filters, dateRange: toggleItem(filters.dateRange, opt) })}
                />
              ))}
            </div>
          </FilterSection>

          {/* Event Type filter */}
          <FilterSection title="Event Type" icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }>
            <div className="flex flex-wrap gap-2">
              {ALL_PRICING.map((pt) => (
                <FilterChip
                  key={pt}
                  label={`${pt} Events`}
                  active={filters.eventType.includes(pt)}
                  onClick={() => onChange({ ...filters, eventType: toggleItem(filters.eventType, pt) })}
                />
              ))}
            </div>
          </FilterSection>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5">
          <button onClick={onClose} className="btn-primary w-full py-3 text-base">
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────── */

function FilterSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
        <span className="text-[#a78bfa]">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        text-xs font-medium px-3.5 py-2 rounded-xl border transition-all duration-200
        ${active
          ? "bg-[#8b5cf6]/20 text-[#a78bfa] border-[#8b5cf6]/40 shadow-sm shadow-[#8b5cf6]/10"
          : "bg-white/[0.03] text-gray-400 border-white/5 hover:border-white/15 hover:text-gray-300"
        }
      `}
    >
      {active && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="inline mr-1.5 -mt-0.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {label}
    </button>
  );
}
