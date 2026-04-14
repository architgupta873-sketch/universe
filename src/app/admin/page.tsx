"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Toast from "@/components/Toast";

function AdminPageContent() {
  const { clubs, addClub, events, deleteEvent } = useAppContext();
  const [newClub, setNewClub] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info">("success");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAddClub = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newClub.trim();
    if (!trimmed) return;

    // Check for duplicates
    if (clubs.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setToastType("info");
      setToast(`"${trimmed}" already exists!`);
      return;
    }

    addClub(trimmed);
    setNewClub("");
    setToastType("success");
    setToast(`"${trimmed}" has been added successfully! 🎉`);
  };

  const handleDeleteEvent = (eventId: string, title: string) => {
    deleteEvent(eventId);
    setConfirmDeleteId(null);
    setToastType("info");
    setToast(`"${title}" has been deleted.`);
  };

  // Count events per club
  const getEventCount = (clubName: string) =>
    events.filter((e) => e.clubName === clubName).length;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          className="mb-12 animate-fadeInUp"
          style={{ animationFillMode: "backwards" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa] flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Admin Panel
            </h1>
          </div>
          <p className="text-gray-500 max-w-xl">
            Manage clubs and events across Manipal University Jaipur.
          </p>
        </div>

        {/* Stats Row */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10 animate-fadeInUp"
          style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
        >
          <div className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center text-[#a78bfa]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{clubs.length}</div>
                <div className="text-xs text-gray-500">Total Clubs</div>
              </div>
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#34d399]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{events.length}</div>
                <div className="text-xs text-gray-500">Total Events</div>
              </div>
            </div>
          </div>
          <div className="glass-card p-5 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fd79a8]/20 flex items-center justify-center text-[#fd79a8]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">MUJ</div>
                <div className="text-xs text-gray-500">Campus</div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Club Form */}
        <div
          className="glass-card p-6 sm:p-8 mb-10 animate-fadeInUp"
          style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
        >
          <h2 className="text-lg font-semibold text-white mb-1">
            Add New Club
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Register a new club to the UniVerse platform.
          </p>

          <form onSubmit={handleAddClub} className="flex gap-3">
            <input
              id="new-club-input"
              type="text"
              className="input-field flex-1"
              placeholder="Enter club name..."
              value={newClub}
              onChange={(e) => setNewClub(e.target.value)}
            />
            <button
              type="submit"
              disabled={!newClub.trim()}
              className="btn-primary px-6 py-3 flex items-center gap-2 shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Club
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Clubs Grid */}
          <div
            className="animate-fadeInUp"
            style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
          >
            <h2 className="text-lg font-semibold text-white mb-5">
              All Clubs ({clubs.length})
            </h2>

            <div className="space-y-3">
              {clubs.map((club, i) => {
                const eventCount = getEventCount(club);
                const colors = [
                  "from-[#8b5cf6] to-[#a78bfa]",
                  "from-[#10b981] to-[#34d399]",
                  "from-[#f472b6] to-[#f9a8d4]",
                  "from-[#3b82f6] to-[#60a5fa]",
                  "from-[#f59e0b] to-[#fbbf24]",
                  "from-[#06b6d4] to-[#22d3ee]",
                ];
                const gradient = colors[i % colors.length];

                return (
                  <div
                    key={club}
                    className="glass-card p-4 flex items-center gap-4"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                    >
                      {club.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {club}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {eventCount} {eventCount === 1 ? "event" : "events"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event Management */}
          <div
            className="animate-fadeInUp"
            style={{ animationDelay: "0.4s", animationFillMode: "backwards" }}
          >
            <h2 className="text-lg font-semibold text-white mb-5">
              All Events ({events.length})
            </h2>

            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#8b5cf6]/15 text-[#a78bfa]">
                        {event.clubName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(event.date)}
                      </span>
                      <span className="text-[10px] text-gray-600">{event.genre}</span>
                    </div>
                  </div>

                  {confirmDeleteId === event.id ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDeleteEvent(event.id, event.title)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-400/15 text-red-400 border border-red-400/25 hover:bg-red-400/25 transition-all"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(event.id)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-400/15 flex items-center justify-center text-gray-500 hover:text-red-400 transition-all shrink-0"
                      title="Delete event"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRole="admin">
      <AdminPageContent />
    </ProtectedRoute>
  );
}
