"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/deals/mosaic";
  const [mode, setMode] = useState<"choose" | "email">("choose");
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);
    await signIn("google", { callbackUrl });
  }

  async function handleEmailSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await signIn("email-signup", {
      email: form.get("email") as string,
      name: form.get("name") as string,
      firm: form.get("firm") as string,
      callbackUrl,
    });
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Investor Access</h1>
          <p className="text-sm text-text-secondary mt-2">
            Register to access confidential deal materials. All users are registered as Investors by default.
            Partners with authorized email addresses receive full Partner access.
          </p>
        </div>

        <div className="bg-surface border border-border-custom rounded-xl p-6">
          {mode === "choose" ? (
            <div className="space-y-4">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-border-custom rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-border-custom" />
                <span className="text-xs text-text-secondary">or</span>
                <div className="flex-1 border-t border-border-custom" />
              </div>

              {/* Email Sign Up */}
              <button
                onClick={() => setMode("email")}
                className="w-full flex items-center justify-center gap-2 bg-accent-blue text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent-blue/90 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-10 6L2 7" />
                </svg>
                Sign Up with Email
              </button>

              <p className="text-[10px] text-text-secondary text-center mt-4">
                By signing in, you acknowledge this is confidential material shared for discussion purposes only.
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <button
                type="button"
                onClick={() => setMode("choose")}
                className="text-xs text-accent-blue hover:underline mb-2"
              >
                &larr; Back to sign-in options
              </button>

              <h2 className="text-sm font-semibold text-foreground">Investor Registration</h2>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Jane Smith"
                  className="w-full bg-background border border-border-custom rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="jane@capitalpartners.com"
                  className="w-full bg-background border border-border-custom rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Firm Name
                </label>
                <input
                  name="firm"
                  type="text"
                  placeholder="Capital Partners LLC"
                  className="w-full bg-background border border-border-custom rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent-blue text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
              >
                {loading ? "Creating Account..." : "Create Investor Account"}
              </button>

              <p className="text-[10px] text-text-secondary text-center">
                Your information is kept confidential and used solely for deal communication.
              </p>
            </form>
          )}
        </div>

        {/* Public access note */}
        <div className="text-center mt-6">
          <p className="text-xs text-text-secondary">
            The <a href="/" className="text-accent-blue hover:underline">deal summary</a> and{" "}
            <a href="/submit" className="text-accent-blue hover:underline">deal submission form</a> are available without sign-in.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><p className="text-text-secondary">Loading...</p></div>}>
      <SignInForm />
    </Suspense>
  );
}
