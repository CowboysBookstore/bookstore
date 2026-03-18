import React from "react";
import { Link } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

function BookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-mcneeseBlue"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

export default function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-100 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <BookIcon />
          <span className="text-lg font-semibold text-mcneeseBlue">
            Cowboy Bookstore
          </span>
        </Link>
      </header>

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

      <footer className="border-t border-slate-100 px-6 py-4 text-center text-xs text-slate-400">
        Copyright 2026 McNeese State University - Cowboy Bookstore
      </footer>
    </div>
  );
}
