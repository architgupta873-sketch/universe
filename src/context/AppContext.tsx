"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "club_member" | "student" | null;

export type EventGenre = "Technical" | "Cultural" | "Fun" | "Sports" | "Workshops" | "Competitions" | "Gaming";
export type EventPricing = "Free" | "Paid";

export const ALL_GENRES: EventGenre[] = ["Technical", "Cultural", "Fun", "Sports", "Workshops", "Competitions", "Gaming"];
export const ALL_PRICING: EventPricing[] = ["Free", "Paid"];

export interface Event {
  id: string;
  title: string;
  description: string;
  clubName: string;
  date: string;
  venue: string;
  genre: EventGenre;
  eventType: EventPricing;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  userEmail: string;
  setUserInfo: (name: string, email: string) => void;
  clubs: string[];
  addClub: (club: string) => void;
  events: Event[];
  addEvent: (event: Omit<Event, "id">) => void;
  deleteEvent: (eventId: string) => void;
  registeredEventIds: string[];
  registerForEvent: (eventId: string) => void;
  unregisterFromEvent: (eventId: string) => void;
  logout: () => void;
}

const INITIAL_CLUBS = [
  "ACM",
  "IEEE",
  "Cinephilia",
  "Randomize()",
  "Shabd",
  "Coreographia",
  "Glitch",
];

const INITIAL_EVENTS: Event[] = [
  {
    id: "evt-1",
    title: "Hackathon 2026",
    description:
      "48-hour coding marathon with exciting prizes. Build innovative solutions and collaborate with fellow developers.",
    clubName: "ACM",
    date: "2026-04-20",
    venue: "Main Auditorium, Block A",
    genre: "Competitions",
    eventType: "Free",
  },
  {
    id: "evt-2",
    title: "TechTalk: AI & Future",
    description:
      "An insightful talk on the future of artificial intelligence, covering LLMs, robotics, and ethical AI.",
    clubName: "IEEE",
    date: "2026-04-25",
    venue: "Seminar Hall 3, Block C",
    genre: "Technical",
    eventType: "Free",
  },
  {
    id: "evt-3",
    title: "Film Screening Night",
    description:
      "Join us for a curated selection of award-winning short films followed by a panel discussion on cinematography.",
    clubName: "Cinephilia",
    date: "2026-04-18",
    venue: "Mini Theatre, Student Centre",
    genre: "Cultural",
    eventType: "Paid",
  },
  {
    id: "evt-4",
    title: "Code Golf Championship",
    description:
      "Solve challenges in the fewest characters possible. Test your ability to write concise, elegant code.",
    clubName: "Randomize()",
    date: "2026-05-02",
    venue: "Computer Lab 5, Block D",
    genre: "Competitions",
    eventType: "Free",
  },
  {
    id: "evt-5",
    title: "Open Mic Poetry",
    description:
      "Express yourself through poetry and spoken word. All languages welcome. Share your stories with the campus.",
    clubName: "Shabd",
    date: "2026-04-22",
    venue: "Open Air Theatre",
    genre: "Cultural",
    eventType: "Free",
  },
  {
    id: "evt-6",
    title: "Dance Showcase: Rhythms",
    description:
      "Annual dance showcase featuring performances from classical to hip-hop. Come witness stunning choreography.",
    clubName: "Coreographia",
    date: "2026-05-05",
    venue: "Main Auditorium, Block A",
    genre: "Cultural",
    eventType: "Paid",
  },
  {
    id: "evt-7",
    title: "Valorant Campus Cup",
    description:
      "5v5 Valorant tournament with live commentary. Assemble your squad and compete for the campus champion title.",
    clubName: "Glitch",
    date: "2026-04-27",
    venue: "Gaming Arena, Block E",
    genre: "Gaming",
    eventType: "Free",
  },
  {
    id: "evt-8",
    title: "Web Dev Bootcamp",
    description:
      "Intensive 2-day workshop covering React, Next.js, and modern deployment. Perfect for beginners and intermediates.",
    clubName: "ACM",
    date: "2026-05-10",
    venue: "Computer Lab 2, Block D",
    genre: "Workshops",
    eventType: "Paid",
  },
  {
    id: "evt-9",
    title: "Cipher: CTF Challenge",
    description:
      "Capture The Flag cybersecurity competition. Crack puzzles, exploit vulnerabilities, and prove your skills.",
    clubName: "IEEE",
    date: "2026-05-08",
    venue: "Seminar Hall 1, Block C",
    genre: "Competitions",
    eventType: "Free",
  },
  {
    id: "evt-10",
    title: "Music Jam Night",
    description:
      "Unplug and unwind with live indie and acoustic performances by student artists. Bring your instruments!",
    clubName: "Shabd",
    date: "2026-05-12",
    venue: "Open Air Theatre",
    genre: "Cultural",
    eventType: "Free",
  },
  {
    id: "evt-11",
    title: "Git & GitHub Workshop",
    description:
      "Master version control from scratch. Learn branching, merging, pull requests, and collaborative workflows.",
    clubName: "Randomize()",
    date: "2026-04-30",
    venue: "Computer Lab 3, Block D",
    genre: "Workshops",
    eventType: "Free",
  },
  {
    id: "evt-12",
    title: "FIFA Showdown",
    description:
      "1v1 FIFA tournament on PS5. Bracket-style elimination with live stream. Walk-ins welcome until slots fill up.",
    clubName: "Glitch",
    date: "2026-05-15",
    venue: "Gaming Arena, Block E",
    genre: "Gaming",
    eventType: "Paid",
  },
  {
    id: "evt-13",
    title: "Documentary Premiere",
    description:
      "Screening of student-produced documentaries exploring social issues. Q&A with filmmakers after the show.",
    clubName: "Cinephilia",
    date: "2026-05-03",
    venue: "Mini Theatre, Student Centre",
    genre: "Cultural",
    eventType: "Free",
  },
  {
    id: "evt-14",
    title: "Intro to ML Workshop",
    description:
      "Hands-on workshop covering machine learning fundamentals with Python, scikit-learn, and real datasets.",
    clubName: "IEEE",
    date: "2026-05-18",
    venue: "Computer Lab 1, Block D",
    genre: "Technical",
    eventType: "Paid",
  },
];

const sortByDate = (list: Event[]) =>
  [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [clubs, setClubs] = useState<string[]>(INITIAL_CLUBS);
  const [events, setEvents] = useState<Event[]>(() => sortByDate(INITIAL_EVENTS));
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);

  const setUserInfo = (name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
  };

  const addClub = (club: string) => {
    setClubs((prev) => [...prev, club]);
  };

  const addEvent = (event: Omit<Event, "id">) => {
    const newEvent: Event = {
      ...event,
      id: `evt-${Date.now()}`,
    };
    setEvents((prev) => sortByDate([...prev, newEvent]));
  };

  const deleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setRegisteredEventIds((prev) => prev.filter((id) => id !== eventId));
  };

  const registerForEvent = (eventId: string) => {
    setRegisteredEventIds((prev) => [...prev, eventId]);
  };

  const unregisterFromEvent = (eventId: string) => {
    setRegisteredEventIds((prev) => prev.filter((id) => id !== eventId));
  };

  const logout = () => {
    setRole(null);
    setUserName("");
    setUserEmail("");
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        userName,
        userEmail,
        setUserInfo,
        clubs,
        addClub,
        events,
        addEvent,
        deleteEvent,
        registeredEventIds,
        registerForEvent,
        unregisterFromEvent,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
