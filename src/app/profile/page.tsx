"use client";

import { useAppContext, Event } from "@/context/AppContext";
import EventDetailModal from "@/components/EventDetailModal";
import Toast from "@/components/Toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function ProfilePage() {
  const {
    role,
    userName,
    userEmail,
    events,
    registeredEventIds,
    unregisterFromEvent,
  } = useAppContext();
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const prevRegistered = useRef(registeredEventIds.length);

  // Redirect non-students
  useEffect(() => {
    if (!role) {
      router.replace("/login");
    }
  }, [role, router]);

  // Show toast on unregister
  useEffect(() => {
    if (registeredEventIds.length < prevRegistered.current) {
      setToast("Successfully unregistered from the event.");
    }
    prevRegistered.current = registeredEventIds.length;
  }, [registeredEventIds]);

  if (!role) return null;

  const registeredEvents = events.filter((e) =>
    registeredEventIds.includes(e.id)
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getCountdown = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: "Passed", color: "text-gray-500" };
    if (diff === 0) return { label: "Today", color: "text-[#34d399]" };
    if (diff === 1) return { label: "Tomorrow", color: "text-[#34d399]" };
    if (diff <= 7) return { label: `In ${diff} days`, color: "text-[#a78bfa]" };
    return { label: `In ${diff} days`, color: "text-gray-500" };
  };

  return (
    <div className="min-h-screen px-4 py-20 page-transition">
      {toast && (
        <Toast message={toast} type="info" onClose={() => setToast(null)} />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div
          className="mb-10 animate-fadeInUp"
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              My Profile
            </h1>
          </div>
          <p className="text-gray-500">
            Your account overview and registered events.
          </p>
        </div>

        {/* Profile Card */}
        <div
          className="glass-card p-6 sm:p-8 mb-8 animate-fadeInUp"
          style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa] flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white truncate">
                {userName || "UniVerse User"}
              </h2>
              <p className="text-sm text-gray-400 truncate">
                {userEmail || "user@muj.manipal.edu"}
              </p>
              <span className="inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full bg-[#8b5cf6]/20 text-[#a78bfa] capitalize">
                {role === "club_member" ? "Club Member" : role}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
            <div className="text-center p-3 rounded-xl bg-white/[0.03]">
              <div className="text-2xl font-bold text-white">
                {registeredEvents.length}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Registered Events
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.03]">
              <div className="text-2xl font-bold text-white">
                {events.length}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Available Events
              </div>
            </div>
          </div>
        </div>

        {/* Registered Events */}
        <div
          className="animate-fadeInUp"
          style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
        >
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-[#34d399]"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            My Registered Events
          </h2>

          {registeredEvents.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center mx-auto mb-4 text-[#a78bfa]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                No Registrations Yet
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                Browse events and register to see them here.
              </p>
              <Link href="/events" className="btn-primary text-sm py-2.5 px-6">
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {registeredEvents.map((event) => (
                <div
                  key={event.id}
                  className="glass-card glass-card-clickable p-5 flex items-center gap-4"
                  onClick={() => setSelectedEvent(event)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setSelectedEvent(event);
                  }}
                >
                  <div className="w-11 h-11 rounded-xl bg-[#10b981]/15 flex items-center justify-center text-[#34d399] shrink-0">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-[#8b5cf6]/15 text-[#a78bfa] font-medium">
                        {event.clubName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(event.date)}
                      </span>
                      <span className={`text-[10px] font-semibold ${getCountdown(event.date).color}`}>
                        • {getCountdown(event.date).label}
                      </span>
                      {event.venue && (
                        <span className="text-xs text-gray-600 hidden sm:inline">
                          • {event.venue}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      unregisterFromEvent(event.id);
                    }}
                    className="text-xs font-medium px-3 py-1.5 rounded-xl text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/30 transition-all shrink-0"
                    title="Unregister from this event"
                  >
                    Unregister
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
