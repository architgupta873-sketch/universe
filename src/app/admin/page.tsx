"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Toast from "@/components/Toast";
import { approveEvent, rejectEvent } from "@/lib/services/events";
import { createClient } from "@/lib/supabase/client";

function AdminPageContent() {
  const { clubs, addClub, events, deleteEvent, refreshEvents } = useAppContext();
  const [newClub, setNewClub] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "error">("success");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"clubs" | "events" | "pending">("pending");
  const [userCount, setUserCount] = useState(0);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      const supabase = createClient();

      const { count: users } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      setUserCount(users || 0);

      const { count: regs } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true });
      setRegistrationCount(regs || 0);
    };
    fetchAnalytics();
  }, []);

  const handleAddClub = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newClub.trim();
    if (!trimmed) return;

    // Check for duplicates
    if (clubs.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setToastType("info");
      setToast(`"${trimmed}" already exists!`);
      return;
    }

    try {
      await addClub(trimmed);
      setNewClub("");
      setToastType("success");
      setToast(`"${trimmed}" has been added successfully! 🎉`);
    } catch {
      setToastType("error");
      setToast("Failed to add club. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    try {
      await deleteEvent(eventId);
      setConfirmDeleteId(null);
      setToastType("info");
      setToast(`"${title}" has been deleted.`);
    } catch {
      setToastType("error");
      setToast("Failed to delete event.");
    }
  };

  const handleApprove = async (eventId: string, title: string) => {
    if (processingId) return;
    setProcessingId(eventId);
    try {
      await approveEvent(eventId);
      await refreshEvents();
      setToastType("success");
      setToast(`"${title}" has been approved! ✅`);
    } catch {
      setToastType("error");
      setToast("Failed to approve event.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (eventId: string, title: string) => {
    if (processingId) return;
    setProcessingId(eventId);
    try {
      await rejectEvent(eventId);
      await refreshEvents();
      setToastType("info");
      setToast(`"${title}" has been rejected.`);
    } catch {
      setToastType("error");
      setToast("Failed to reject event.");
    } finally {
      setProcessingId(null);
    }
  };

  // Count events per club
  const getEventCount = (clubName: string) =>
    events.filter((e) => e.clubName === clubName).length;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Split events by status
  const pendingEvents = events.filter((e) => e.status === "pending");
  const approvedEvents = events.filter((e) => e.status === "approved" || !e.status);

  return (
    <div className="min-h-screen px-4 py-20 page-transition">
      {toast && (
        <Toast
          message={toast}
          type={toastType === "error" ? "error" : toastType}
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
            Manage clubs, approve events, and monitor registrations across Manipal University Jaipur.
          </p>
        </div>

        {/* Stats Row */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 animate-fadeInUp"
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
          <div className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fbbf24]/20 flex items-center justify-center text-[#fbbf24]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{userCount}</div>
                <div className="text-xs text-gray-500">Users</div>
              </div>
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fd79a8]/20 flex items-center justify-center text-[#fd79a8]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{registrationCount}</div>
                <div className="text-xs text-gray-500">Registrations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Events Alert */}
        {pendingEvents.length > 0 && (
          <div
            className="glass-card p-4 mb-6 flex items-center gap-3 border-[#fbbf24]/30 animate-fadeInUp"
            style={{ animationDelay: "0.15s", animationFillMode: "backwards", background: "rgba(251, 191, 36, 0.05)" }}
          >
            <div className="w-2 h-2 rounded-full bg-[#fbbf24] animate-pulse" />
            <span className="text-sm text-[#fbbf24] font-medium">
              {pendingEvents.length} event{pendingEvents.length > 1 ? "s" : ""} pending approval
            </span>
          </div>
        )}

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

        {/* Tab navigation */}
        <div className="flex rounded-xl bg-white/[0.03] border border-white/5 p-1 mb-6 max-w-md">
          {[
            { key: "pending" as const, label: "Pending", count: pendingEvents.length },
            { key: "events" as const, label: "Events", count: approvedEvents.length },
            { key: "clubs" as const, label: "Clubs", count: clubs.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === tab.key
                  ? "bg-[#8b5cf6]/20 text-[#a78bfa]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-[#8b5cf6]/30 text-[#a78bfa]"
                    : "bg-white/5 text-gray-500"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {/* Pending Events Tab */}
          {activeTab === "pending" && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-5">
                Pending Approval ({pendingEvents.length})
              </h2>
              {pendingEvents.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4 text-[#34d399]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">All caught up!</h3>
                  <p className="text-sm text-gray-500">No events pending approval.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingEvents.map((event) => (
                    <div key={event.id} className="glass-card p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white">{event.title}</h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#8b5cf6]/15 text-[#a78bfa]">
                              {event.clubName}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
                            <span className="text-[10px] text-gray-600">{event.genre}</span>
                            <span className="text-[10px] text-gray-600">• {event.venue}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApprove(event.id, event.title)}
                            disabled={processingId === event.id}
                            className="text-xs font-medium px-4 py-2 rounded-lg bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/25 hover:bg-[#10b981]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                          >
                            {processingId === event.id ? (
                              <div className="w-3 h-3 border-2 border-[#34d399] border-t-transparent rounded-full animate-spin" />
                            ) : null}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(event.id, event.title)}
                            disabled={processingId === event.id}
                            className="text-xs font-medium px-4 py-2 rounded-lg bg-red-400/15 text-red-400 border border-red-400/25 hover:bg-red-400/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Events Tab */}
          {activeTab === "events" && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-5">
                All Events ({approvedEvents.length})
              </h2>
              <div className="space-y-3">
                {approvedEvents.map((event) => (
                  <div key={event.id} className="glass-card p-4 flex items-center gap-4">
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
          )}

          {/* Clubs Tab */}
          {activeTab === "clubs" && (
            <div>
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
                    <div key={club} className="glass-card p-4 flex items-center gap-4">
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
          )}
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
