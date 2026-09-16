import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import { api, setAuthTokens } from "../storefront/client";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const tokens = await api.login({ email, password });
      setAuthTokens(tokens.access, tokens.refresh);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in with your McNeese email to see your orders and finish checkout faster.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {(location.state as { registered?: boolean; verified?: boolean; reset?: boolean } | null)?.registered && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Your account is ready. Sign in to continue.
          </div>
        )}
        {(location.state as { registered?: boolean; verified?: boolean; reset?: boolean } | null)?.verified && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Your email is verified. You can sign in now.
          </div>
        )}
        {(location.state as { registered?: boolean; verified?: boolean; reset?: boolean } | null)?.reset && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Your password has been updated.
          </div>
        )}
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
            className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-mcneeseBlue hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-lg bg-mcneeseBlue text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-mcneeseBlue hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
