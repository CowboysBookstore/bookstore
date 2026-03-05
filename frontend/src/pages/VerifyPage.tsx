import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { api } from "../api";

export default function VerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedEmail = (location.state as { email?: string })?.email || "";

  const [email, setEmail] = useState(passedEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.verify({ email, code });
      navigate("/login", { state: { verified: true } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the code we sent to your McNeese email"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@mcneese.edu"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Verification code
          </label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit code"
            inputMode="numeric"
            maxLength={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm tracking-widest text-center font-mono transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-mcneeseBlue py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Verify"}
        </button>

        <p className="text-center text-sm text-slate-500">
          <Link to="/login" className="font-medium text-mcneeseBlue hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
