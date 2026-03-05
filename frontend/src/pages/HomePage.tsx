import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const isLoggedIn = !!sessionStorage.getItem("access");

  const handleSignOut = () => {
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Nav */}
      <header className="border-b border-slate-100 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="text-lg font-semibold text-mcneeseBlue">
              Cowboy Bookstore
            </span>
          </div>
          {isLoggedIn ? (
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sign out
            </button>
          ) : (
            <a
              href="/login"
              className="rounded-lg bg-mcneeseBlue px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blue-800"
            >
              Sign in
            </a>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col">
        <section className="bg-gradient-to-br from-mcneeseBlue to-blue-800 px-6 py-20 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold sm:text-5xl">
              Your campus bookstore, online
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
              Find textbooks, course materials, and McNeese gear — all in one
              place. Built for Cowboys, by Cowboys.
            </p>
            {!isLoggedIn && (
              <div className="mt-8 flex justify-center gap-3">
                <a
                  href="/register"
                  className="rounded-lg bg-mcneeseGold px-6 py-3 text-sm font-semibold text-slate-900 shadow transition hover:brightness-110"
                >
                  Create account
                </a>
                <a
                  href="/login"
                  className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-white/20"
                >
                  Sign in
                </a>
              </div>
            )}
            {isLoggedIn && (
              <p className="mt-8 rounded-lg bg-white/10 px-4 py-3 text-sm text-blue-100">
                You're signed in. More features coming soon — browse, cart, and checkout are on the way!
              </p>
            )}
          </div>
        </section>

        {/* Feature cards */}
        <section className="mx-auto grid max-w-5xl gap-6 px-6 py-16 sm:grid-cols-3">
          {[
            {
              icon: "📖",
              title: "Textbooks",
              desc: "Search and buy required textbooks for every course.",
            },
            {
              icon: "🤠",
              title: "McNeese Gear",
              desc: "Rep the Cowboys with apparel, accessories, and more.",
            },
            {
              icon: "🚚",
              title: "Campus Pickup",
              desc: "Order online and pick up at the bookstore — no shipping wait.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-200 p-6 text-center shadow-sm"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-100 px-6 py-4 text-center text-xs text-slate-400">
        © 2026 McNeese State University · Cowboy Bookstore
      </footer>
    </div>
  );
}
