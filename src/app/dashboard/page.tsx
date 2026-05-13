"use client";

import { useState } from "react";
import { useAppContext, ALL_GENRES, ALL_PRICING, EventGenre, EventPricing } from "@/context/AppContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Toast from "@/components/Toast";
import { uploadEventPoster } from "@/lib/services/storage";

function DashboardPageContent() {
  const { clubs, events, addEvent } = useAppContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [selectedClub, setSelectedClub] = useState(clubs[0] || "");
  const [genre, setGenre] = useState<EventGenre>(ALL_GENRES[0]);
  const [eventType, setEventType] = useState<EventPricing>(ALL_PRICING[0]);
  const [rewardPoints, setRewardPoints] = useState(10);
  const [registrationLimit, setRegistrationLimit] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !venue.trim() || !date || !selectedClub) return;

    setIsSubmitting(true);

    try {
      let posterUrl: string | null = null;

      // Upload poster if provided
      if (posterFile) {
        const tempId = `temp-${Date.now()}`;
        posterUrl = await uploadEventPoster(posterFile, tempId);
      }

      await addEvent({
        title: title.trim(),
        description: description.trim(),
        clubName: selectedClub,
        date,
        venue: venue.trim(),
        genre,
        eventType,
        reward_points: rewardPoints,
        registration_limit: registrationLimit ? parseInt(registrationLimit) : null,
        poster_url: posterUrl,
      });

      // Clear form
      setTitle("");
      setDescription("");
      setVenue("");
      setDate("");
      setSelectedClub(clubs[0] || "");
      setGenre(ALL_GENRES[0]);
      setEventType(ALL_PRICING[0]);
      setRewardPoints(10);
      setRegistrationLimit("");
      setPosterFile(null);
      setToastType("success");
      setToast("Event created successfully! It will appear after admin approval. 🎉");
    } catch (err) {
      console.error("Failed to create event:", err);
      setToastType("error");
      setToast("Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get nearest upcoming events (already sorted by date from context)
  const recentEvents = events.slice(0, 5);

  return (
    <div className="min-h-screen px-4 py-20">
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Club Dashboard
            </h1>
          </div>
          <p className="text-gray-500 max-w-xl">
            Create and manage events for your club. Events require admin approval before appearing on the campus events page.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Create Event Form */}
          <div
            className="lg:col-span-3 animate-fadeInUp"
            style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
          >
            <div className="glass-card p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-white mb-1">
                Create New Event
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Fill in the details below to publish a new campus event.
              </p>

              <form onSubmit={handleCreateEvent} className="space-y-5">
                {/* Title */}
                <div>
                  <label
                    htmlFor="event-title"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Event Title
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    className="input-field"
                    placeholder="e.g., Annual Hackathon 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="event-description"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="event-description"
                    className="input-field min-h-[120px] resize-y"
                    placeholder="Describe the event, what to expect, and any requirements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Venue */}
                <div>
                  <label
                    htmlFor="event-venue"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Venue
                  </label>
                  <input
                    id="event-venue"
                    type="text"
                    className="input-field"
                    placeholder="e.g., Main Auditorium, Block A"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    required
                  />
                </div>

                {/* Date & Club Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="event-date"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Date
                    </label>
                    <input
                      id="event-date"
                      type="date"
                      className="input-field"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="event-club"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Club
                    </label>
                    <select
                      id="event-club"
                      className="input-field"
                      value={selectedClub}
                      onChange={(e) => setSelectedClub(e.target.value)}
                      required
                    >
                      {clubs.map((club) => (
                        <option key={club} value={club}>
                          {club}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Genre & Event Type Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="event-genre"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Genre
                    </label>
                    <select
                      id="event-genre"
                      className="input-field"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value as EventGenre)}
                      required
                    >
                      {ALL_GENRES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="event-pricing"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Event Type
                    </label>
                    <select
                      id="event-pricing"
                      className="input-field"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as EventPricing)}
                      required
                    >
                      {ALL_PRICING.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Reward Points & Registration Limit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="event-points"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Reward Points
                    </label>
                    <input
                      id="event-points"
                      type="number"
                      className="input-field"
                      placeholder="10"
                      min={0}
                      max={100}
                      value={rewardPoints}
                      onChange={(e) => setRewardPoints(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="event-limit"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Registration Limit
                    </label>
                    <input
                      id="event-limit"
                      type="number"
                      className="input-field"
                      placeholder="Unlimited"
                      min={1}
                      value={registrationLimit}
                      onChange={(e) => setRegistrationLimit(e.target.value)}
                    />
                  </div>
                </div>

                {/* Poster Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Poster (optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                      className="input-field file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#8b5cf6]/20 file:text-[#a78bfa] hover:file:bg-[#8b5cf6]/30 file:cursor-pointer"
                    />
                  </div>
                  {posterFile && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      📎 {posterFile.name} ({(posterFile.size / 1024).toFixed(0)} KB)
                    </p>
                  )}
                </div>

                {/* Preview card */}
                {title.trim() && (
                  <div className="rounded-xl p-4 bg-[#8b5cf6]/8 border border-[#8b5cf6]/15">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                      Preview
                    </p>
                    <p className="text-sm text-white font-medium">{title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedClub} {date ? `• ${date}` : ""}{venue.trim() ? ` • ${venue.trim()}` : ""}
                      {rewardPoints > 0 ? ` • ${rewardPoints} pts` : ""}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1">
                      Status: Pending admin approval
                    </p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !title.trim() ||
                    !description.trim() ||
                    !venue.trim() ||
                    !date ||
                    !selectedClub
                  }
                  className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Create Event
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar — Recent Events */}
          <div
            className="lg:col-span-2 animate-fadeInUp"
            style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
          >
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-1">
                Recent Events
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Latest events on the platform
              </p>

              {recentEvents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center mx-auto mb-3 text-[#a78bfa]">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No events yet</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Create your first event!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <h4 className="text-sm font-medium text-white truncate">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-[#8b5cf6]/15 text-[#a78bfa] font-medium">
                          {event.clubName}
                        </span>
                        <span className="text-xs text-gray-600">
                          {event.date}
                        </span>
                        {event.status && event.status !== 'approved' && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            event.status === 'pending'
                              ? 'bg-[#fbbf24]/15 text-[#fbbf24]'
                              : 'bg-red-400/15 text-red-400'
                          }`}>
                            {event.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="glass-card p-6 mt-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Events</span>
                  <span className="text-sm font-bold text-white">
                    {events.length}
                  </span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Active Clubs</span>
                  <span className="text-sm font-bold text-white">
                    {clubs.length}
                  </span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Clubs with Events
                  </span>
                  <span className="text-sm font-bold text-white">
                    {new Set(events.map((e) => e.clubName)).size}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRole="club_member">
      <DashboardPageContent />
    </ProtectedRoute>
  );
}
