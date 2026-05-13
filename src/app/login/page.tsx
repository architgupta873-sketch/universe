"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { handleSignIn, handleSignUp } = useAppContext();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === "signup" && !fullName.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === "login") {
        await handleSignIn(email, password);
        setTimeout(() => {
          router.push("/events");
        }, 300);
      } else {
        // Everyone signs up as "student" — admin is assigned by email in the DB trigger
        await handleSignUp(email, password, fullName.trim(), "student");
        setSuccessMsg("Account created successfully! You can now sign in.");
        setMode("login");
        setPassword("");
        setShowPassword(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-bold text-white">
            {mode === "login" ? "Welcome Back" : "Join UniVerse"}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {mode === "login" ? "Sign in to access your campus platform" : "Create your account to get started"}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 animate-fadeInUp" style={{ animationDelay: "0.25s", animationFillMode: "backwards" }}>
          {/* Login / Signup Tabs */}
          <div className="flex rounded-xl bg-white/[0.03] border border-white/5 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode("login"); setErrorMsg(null); setSuccessMsg(null); setShowPassword(false); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === "login"
                  ? "bg-[#8b5cf6]/20 text-[#a78bfa]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setErrorMsg(null); setSuccessMsg(null); setShowPassword(false); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === "signup"
                  ? "bg-[#8b5cf6]/20 text-[#a78bfa]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 animate-fadeInUp">
              {errorMsg}
            </div>
          )}

          {/* Success message */}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium text-[#34d399] bg-[#10b981]/10 border border-[#10b981]/20 animate-fadeInUp">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name (signup only) */}
            {mode === "signup" && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="input-field"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

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

            {/* Password with eye toggle */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    /* EyeOff icon */
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    </svg>
                  ) : (
                    /* Eye icon */
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Role info for signup */}
            {mode === "signup" && (
              <div className="rounded-xl p-3 bg-[#8b5cf6]/8 border border-[#8b5cf6]/15">
                <p className="text-xs text-gray-400">
                  🎓 You&apos;ll be signed up as a <span className="text-[#a78bfa] font-medium">Student</span>. Browse and register for campus events, earn reward points, and track your participation.
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !email || !password || (mode === "signup" && !fullName.trim())}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                mode === "login" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          {/* Mode switch hint */}
          <p className="text-center text-xs text-gray-500 mt-6">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-[#a78bfa] hover:text-white transition-colors font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-[#a78bfa] hover:text-white transition-colors font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-600 mt-6 animate-fadeIn" style={{ animationDelay: "0.5s", animationFillMode: "backwards" }}>
          Manipal University Jaipur — UniVerse Campus Platform
        </p>
      </div>
    </div>
  );
}
