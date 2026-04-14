"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext, UserRole } from "@/context/AppContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  const { setRole, setUserInfo } = useAppContext();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !selectedRole) return;

    setIsLoading(true);

    // Simulate a brief loading state
    await new Promise((res) => setTimeout(res, 600));

    // Store user info
    const namePart = email.split("@")[0].replace(/[._]/g, " ");
    setUserInfo(namePart, email);

    setRole(selectedRole);

    // Redirect based on role
    switch (selectedRole) {
      case "admin":
        router.push("/admin");
        break;
      case "club_member":
        router.push("/dashboard");
        break;
      case "student":
        router.push("/events");
        break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeInUp" style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#8b5cf6]/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-2">Sign in to access UniVerse</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 animate-fadeInUp" style={{ animationDelay: "0.25s", animationFillMode: "backwards" }}>
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@muj.manipal.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Role Selector */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                Login As
              </label>
              <select
                id="role"
                className="input-field"
                value={selectedRole || ""}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                required
              >
                <option value="student">Student</option>
                <option value="club_member">Club Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Role description */}
            <div className="rounded-xl p-3 bg-[#8b5cf6]/8 border border-[#8b5cf6]/15">
              <p className="text-xs text-gray-400">
                {selectedRole === "admin" && "🛡️ Admin — Manage clubs and oversee the platform."}
                {selectedRole === "club_member" && "🎯 Club Member — Create and manage club events."}
                {selectedRole === "student" && "🎓 Student — Browse and register for campus events."}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500 whitespace-nowrap">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social Login Buttons */}
          <div className="flex flex-col gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => {
                const fakeUser = { name: "Demo User", provider: "google" };
                localStorage.setItem("user", JSON.stringify(fakeUser));
                setUserInfo("Demo User", "demo@gmail.com");
                setRole("student");
                router.push("/events");
              }}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium text-gray-300 border border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] transition-all duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.07 24.07 0 0 0 0 21.56l7.98-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => {
                const fakeUser = { name: "Demo User", provider: "apple" };
                localStorage.setItem("user", JSON.stringify(fakeUser));
                setUserInfo("Demo User", "demo@icloud.com");
                setRole("student");
                router.push("/events");
              }}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium text-gray-300 border border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] transition-all duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => {
                const fakeUser = { name: "Demo User", provider: "facebook" };
                localStorage.setItem("user", JSON.stringify(fakeUser));
                setUserInfo("Demo User", "demo@facebook.com");
                setRole("student");
                router.push("/events");
              }}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium text-gray-300 border border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] transition-all duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
          </div>
        </div>

        {/* Demo Hint */}
        <p className="text-center text-xs text-gray-600 mt-6 animate-fadeIn" style={{ animationDelay: "0.5s", animationFillMode: "backwards" }}>
          This is a simulated login. Enter any email &amp; password,
          <br />
          then choose your role to explore.
        </p>
      </div>
    </div>
  );
}
