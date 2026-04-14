"use client";

import { useAppContext, Event } from "@/context/AppContext";
import EventCard from "@/components/EventCard";
import EventDetailModal from "@/components/EventDetailModal";
import FilterPanel, { FilterState, EMPTY_FILTERS } from "@/components/FilterPanel";
import Toast from "@/components/Toast";
import { useState, useEffect, useRef, useMemo } from "react";

export default function EventsPage() {
  const { events, registeredEventIds } = useAppContext();
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info">("success");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const prevRegistered = useRef(registeredEventIds.length);
  const lastRegisteredId = useRef<string | null>(null);

  // Track which event was just registered
  useEffect(() => {
    if (registeredEventIds.length > prevRegistered.current) {
      const newId = registeredEventIds[registeredEventIds.length - 1];
      const evt = events.find((e) => e.id === newId);
      lastRegisteredId.current = newId;
      setToastType("success");
      setToast(evt ? `Registered for "${evt.title}" 🎉` : "You're registered! 🎉");
    } else if (registeredEventIds.length < prevRegistered.current) {
      setToastType("info");
      setToast("You have been unregistered from the event.");
    }
    prevRegistered.current = registeredEventIds.length;
  }, [registeredEventIds, events]);

  // ── Date helpers ──
  const matchesDateFilter = (dateStr: string, dateFilters: string[]): boolean => {
    if (dateFilters.length === 0) return true;

    const eventDate = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (const f of dateFilters) {
      switch (f) {
        case "Today":
          if (eventDate.toDateString() === today.toDateString()) return true;
          break;
        case "This Week": {
          const weekEnd = new Date(today);
          weekEnd.setDate(today.getDate() + (7 - today.getDay()));
          if (eventDate >= today && eventDate <= weekEnd) return true;
          break;
        }
        case "This Month":
          if (
            eventDate.getMonth() === today.getMonth() &&
            eventDate.getFullYear() === today.getFullYear()
          )
            return true;
          break;
        case "Upcoming":
          if (eventDate >= today) return true;
          break;
      }
    }
    return false;
  };

  // ── Search + Filter ──
  const filteredEvents = useMemo(() => {
    let result = events;

    // Apply text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (evt) =>
          evt.title.toLowerCase().includes(q) ||
          evt.clubName.toLowerCase().includes(q) ||
          evt.description.toLowerCase().includes(q) ||
          evt.genre.toLowerCase().includes(q)
      );
    }

    // Apply filters
    const hasFilters =
      filters.clubs.length > 0 ||
      filters.genres.length > 0 ||
      filters.dateRange.length > 0 ||
      filters.eventType.length > 0;

    if (hasFilters) {
      result = result.filter((evt) => {
        if (filters.clubs.length > 0 && !filters.clubs.includes(evt.clubName)) return false;
        if (filters.genres.length > 0 && !filters.genres.includes(evt.genre)) return false;
        if (filters.eventType.length > 0 && !filters.eventType.includes(evt.eventType)) return false;
        if (!matchesDateFilter(evt.date, filters.dateRange)) return false;
        return true;
      });
    }

    return result;
  }, [events, filters, searchQuery]);

  // ── Split into upcoming + past ──
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = filteredEvents.filter(
    (evt) => new Date(evt.date) >= today
  );
  const pastEvents = filteredEvents.filter(
    (evt) => new Date(evt.date) < today
  );

  // ── Active filter count ──
  const totalActiveFilters =
    filters.clubs.length + filters.genres.length + filters.dateRange.length + filters.eventType.length;

  // ── Collect all active filter labels for chips ──
  const activeChips: { label: string; category: keyof FilterState; value: string }[] = [
    ...filters.clubs.map((v) => ({ label: v, category: "clubs" as const, value: v })),
    ...filters.genres.map((v) => ({ label: v, category: "genres" as const, value: v })),
    ...filters.dateRange.map((v) => ({ label: v, category: "dateRange" as const, value: v })),
    ...filters.eventType.map((v) => ({ label: `${v} Events`, category: "eventType" as const, value: v })),
  ];

  const removeChip = (category: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: (prev[category] as string[]).filter((v) => v !== value),
    }));
  };

  // ── Days until helper ──
  const getDaysUntil = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen px-4 py-20 page-transition">
      {toast && (
        <Toast
          message={toast}
          type={toastType}
          onClose={() => setToast(null)}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {filterPanelOpen && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onClose={() => setFilterPanelOpen(false)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fadeInUp" style={{ animationFillMode: "backwards" }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Campus Events
          </h1>
          <p className="text-gray-500 max-w-xl">
            Discover exciting events happening across clubs at Manipal University Jaipur.
          </p>
        </div>

        {/* Search bar */}
        <div
          className="mb-6 animate-fadeInUp"
          style={{ animationDelay: "0.05s", animationFillMode: "backwards" }}
        >
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="input-field pl-11 pr-4"
              placeholder="Search events, clubs, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Stats bar + Filter button */}
        <div
          className="glass-card p-4 mb-6 flex flex-wrap items-center justify-between gap-4 animate-fadeInUp"
          style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
        >
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/20 flex items-center justify-center text-[#a78bfa]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="text-sm text-gray-400">
                <span className="font-semibold text-white">{filteredEvents.length}</span>
                {(totalActiveFilters > 0 || searchQuery) && ` of ${events.length}`} Events
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#10b981]/20 flex items-center justify-center text-[#34d399]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-sm text-gray-400">
                <span className="font-semibold text-white">{registeredEventIds.length}</span> Registered
              </span>
            </div>
          </div>

          {/* Filter button */}
          <button
            onClick={() => setFilterPanelOpen(true)}
            className="relative inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border transition-all duration-200 bg-white/[0.03] text-gray-300 border-white/10 hover:border-[#8b5cf6]/40 hover:text-[#a78bfa] hover:bg-[#8b5cf6]/10"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
            {totalActiveFilters > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#8b5cf6] text-white text-[10px] font-bold">
                {totalActiveFilters}
              </span>
            )}
          </button>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 animate-fadeIn">
            {activeChips.map((chip) => (
              <span
                key={`${chip.category}-${chip.value}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium pl-3 pr-1.5 py-1.5 rounded-full bg-[#8b5cf6]/15 text-[#a78bfa] border border-[#8b5cf6]/25 transition-all duration-200 hover:bg-[#8b5cf6]/25"
              >
                {chip.label}
                <button
                  onClick={() => removeChip(chip.category, chip.value)}
                  className="w-5 h-5 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors"
                  aria-label={`Remove ${chip.label} filter`}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </span>
            ))}
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-xs font-medium text-gray-500 hover:text-red-400 transition-all duration-200 px-2.5 py-1 rounded-full hover:bg-red-400/10"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center mx-auto mb-4 text-[#a78bfa]">
              {searchQuery ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              ) : totalActiveFilters > 0 ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : totalActiveFilters > 0
                ? "No Matching Events"
                : "No Events Yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {searchQuery
                ? "Try a different search term or check your spelling."
                : totalActiveFilters > 0
                ? "Try adjusting your filters to see more events."
                : "Check back later for upcoming campus events."}
            </p>
            {(totalActiveFilters > 0 || searchQuery) && (
              <button
                onClick={() => {
                  setFilters(EMPTY_FILTERS);
                  setSearchQuery("");
                }}
                className="btn-secondary text-sm py-2.5 px-6"
              >
                {searchQuery && totalActiveFilters > 0
                  ? "Clear Search & Filters"
                  : searchQuery
                  ? "Clear Search"
                  : "Clear All Filters"}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Upcoming Events
                  </h2>
                  <span className="text-xs font-medium text-gray-600">({upcomingEvents.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
                  {upcomingEvents.map((event) => {
                    const days = getDaysUntil(event.date);
                    return (
                      <EventCard
                        key={event.id}
                        event={event}
                        onCardClick={(evt) => setSelectedEvent(evt)}
                        soonLabel={
                          days === 0
                            ? "Today"
                            : days === 1
                            ? "Tomorrow"
                            : days <= 3
                            ? `In ${days} days`
                            : undefined
                        }
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-2 h-2 rounded-full bg-gray-600" />
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Past Events
                  </h2>
                  <span className="text-xs font-medium text-gray-600">({pastEvents.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children opacity-60">
                  {pastEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onCardClick={(evt) => setSelectedEvent(evt)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
