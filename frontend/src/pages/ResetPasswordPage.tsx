import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import { api } from "../api";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedEmail = (location.state as { email?: string })?.email || "";

  const [email, setEmail] = useState(passedEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordMismatch = confirmPassword !== "" && newPassword !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (passwordMismatch) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword({ email, code, new_password: newPassword });
      navigate("/login", { state: { reset: true } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Enter the code from your email and choose a new password"
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
            Reset code
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

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            New password
          </label>
          <PasswordInput
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Confirm new password
          </label>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
            minLength={8}
            autoComplete="new-password"
          />
          {passwordMismatch && (
            <p className="mt-1 text-xs text-red-600">
              Passwords do not match.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || passwordMismatch}
          className="w-full rounded-lg bg-mcneeseBlue py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Updating…" : "Update password"}
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
