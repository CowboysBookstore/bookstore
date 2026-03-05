import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import { api } from "../api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const emailBad = form.email !== "" && !/@mcneese\.edu$/i.test(form.email.trim());
  const passwordMismatch = confirmPassword !== "" && form.password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (emailBad) {
      setError("Only @mcneese.edu email addresses are allowed.");
      return;
    }
    if (passwordMismatch) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.register(form);
      navigate("/verify", { state: { email: form.email } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Use your McNeese email to get started">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              First name
            </label>
            <input
              required
              value={form.first_name}
              onChange={set("first_name")}
              placeholder="Pat"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Last name
            </label>
            <input
              required
              value={form.last_name}
              onChange={set("last_name")}
              placeholder="Rider"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm transition focus:border-mcneeseBlue focus:ring-2 focus:ring-mcneeseBlue/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            McNeese email
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={set("email")}
            placeholder="you@mcneese.edu"
            className={`w-full rounded-lg border px-3 py-2.5 text-sm transition focus:ring-2 focus:ring-mcneeseBlue/20 ${
              emailBad
                ? "border-red-400 focus:border-red-400"
                : "border-slate-300 focus:border-mcneeseBlue"
            }`}
          />
          {emailBad && (
            <p className="mt-1 text-xs text-red-600">
              Only @mcneese.edu emails are accepted.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <PasswordInput
            value={form.password}
            onChange={set("password")}
            placeholder="At least 8 characters"
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Confirm password
          </label>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
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
          disabled={loading || emailBad || passwordMismatch}
          className="w-full rounded-lg bg-mcneeseBlue py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-mcneeseBlue hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
