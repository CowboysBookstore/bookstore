import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { api } from "../storefront/client";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.forgotPassword({ email });
      navigate("/reset-password", {
        state: { email, code: result.reset_code || "" },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send reset code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the McNeese email connected to your account."
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
            className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-lg bg-mcneeseBlue text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset code"}
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
