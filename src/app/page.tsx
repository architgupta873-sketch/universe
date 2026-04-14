"use client";

import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { useMemo } from "react";

export default function HomePage() {
  const { clubs, events } = useAppContext();

  // Generate star positions once
  const stars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${(i * 17 + 13) % 100}%`,
      top: `${(i * 23 + 7) % 100}%`,
      delay: `${(i * 0.7) % 5}s`,
      size: `${1 + (i % 3)}px`,
    }));
  }, []);

  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Clubs & Communities",
      desc: `${clubs.length} active clubs ready for you to explore and join.`,
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      title: "Campus Events",
      desc: `${events.length} events happening across campus. Don't miss out!`,
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      title: "One Platform",
      desc: "Everything you need — discover, register, and engage — in one place.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-clip">
        {/* Stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              width: star.size,
              height: star.size,
            }}
          />
        ))}

        {/* Glowing orb */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full animate-float opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="animate-fadeInUp" style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#8b5cf6]/15 text-[#a78bfa] border border-[#8b5cf6]/25 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-pulse" />
              Manipal University Jaipur
            </span>
          </div>

          <h1
            className="text-6xl sm:text-7xl md:text-8xl font-extrabold mb-6 animate-fadeInUp"
            style={{
              animationDelay: "0.2s",
              animationFillMode: "backwards",
              background: "linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            UniVerse
          </h1>

          <p
            className="text-xl sm:text-2xl text-gray-400 mb-10 font-light animate-fadeInUp"
            style={{ animationDelay: "0.35s", animationFillMode: "backwards" }}
          >
            Your campus, one platform
          </p>

          <div
            className="flex items-center justify-center gap-4 animate-fadeInUp"
            style={{ animationDelay: "0.5s", animationFillMode: "backwards" }}
          >
            <Link href="/events" className="btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2">
              Explore Events
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-3.5">
              Get Started
            </Link>
          </div>

          {/* Stats */}
          <div
            className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto animate-fadeInUp"
            style={{ animationDelay: "0.65s", animationFillMode: "backwards" }}
          >
            <div>
              <div className="text-2xl font-bold text-white">{clubs.length}</div>
              <div className="text-xs text-gray-500 mt-1">Active Clubs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{events.length}</div>
              <div className="text-xs text-gray-500 mt-1">Upcoming Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-xs text-gray-500 mt-1">Members</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-lg mx-auto">
            UniVerse brings your entire campus experience together in one beautiful, connected platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {features.map((feature, i) => (
              <div key={i} className="glass-card p-8 text-center opacity-0 animate-fadeInUp">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#a78bfa]/10 flex items-center justify-center mx-auto mb-5 text-[#a78bfa]">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clubs Preview */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">Our Clubs</h2>
          <p className="text-center text-gray-500 mb-16 max-w-lg mx-auto">
            From tech to arts, find your community and make your mark.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
            {clubs.map((club, i) => (
              <div
                key={i}
                className="glass-card p-5 text-center opacity-0 animate-fadeInUp group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa] flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg group-hover:scale-110 transition-transform">
                  {club.charAt(0)}
                </div>
                <p className="text-sm font-medium text-gray-300 truncate">{club}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">Upcoming Events</h2>
          <p className="text-center text-gray-500 mb-16 max-w-lg mx-auto">
            Don&apos;t miss what&apos;s happening on campus. Register before spots fill up.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {events.slice(0, 4).map((event, i) => {
              const formatDate = (d: string) => {
                const date = new Date(d);
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              };
              return (
                <Link
                  href="/events"
                  key={i}
                  className="glass-card p-5 opacity-0 animate-fadeInUp group cursor-pointer hover:border-[#8b5cf6]/30 transition-all"
                >
                  <p className="text-xs font-semibold text-[#a78bfa] mb-2">{formatDate(event.date)}</p>
                  <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-[#a78bfa] transition-colors">{event.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{event.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-gray-400">{event.clubName}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-gray-400">{event.genre}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link href="/events" className="btn-secondary text-sm inline-flex items-center gap-2">
              View All Events
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-400">UniVerse</span>
          </div>
          <p className="text-xs text-gray-600">
            © 2026 UniVerse — Manipal University Jaipur. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
