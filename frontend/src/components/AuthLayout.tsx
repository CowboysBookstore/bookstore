import React from "react";
import { Link } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header bar */}
      <header className="border-b border-slate-100 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">📚</span>
          <span className="text-lg font-semibold text-mcneeseBlue">
            Cowboy Bookstore
          </span>
        </Link>
      </header>

      {/* Centered card */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-4 text-center text-xs text-slate-400">
        © 2026 McNeese State University · Cowboy Bookstore
      </footer>
    </div>
  );
}
