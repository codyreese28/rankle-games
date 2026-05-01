import Link from "next/link";

const games = [
  {
    title: "Rankle Movies",
    description: "Sort 5 movies from oldest to newest.",
    href: "/movies",
    emoji: "🎬",
    label: "Movies",
  },
  {
    title: "Rankle Video Games",
    description: "Sort 5 video games from oldest to newest.",
    href: "/games",
    emoji: "🎮",
    label: "Games",
  },
  {
    title: "Rankle Music",
    description: "Sort songs or albums from oldest to newest.",
    href: "/music",
    emoji: "🎵",
    label: "Music",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0b0f14] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-180px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="absolute bottom-[-200px] right-[-120px] h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 py-10">
        <header className="mb-10 text-center">
          <div className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-emerald-300">
            Rankle Games
          </div>

          <h1 className="text-5xl font-black tracking-tight">
            Pick Today&apos;s Challenge
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Daily ranking games featuring movies, video games, music, and more.
            Sort the list, make your guesses, and share your score.
          </p>
        </header>

        <div className="grid gap-4">
          {games.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              className="group rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-xl backdrop-blur-sm transition hover:border-emerald-400/30 hover:bg-white/[0.08]"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-3xl ring-1 ring-emerald-400/20">
                  {game.emoji}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    {game.label}
                  </div>

                  <h2 className="text-2xl font-black">{game.title}</h2>
                  <p className="mt-1 text-zinc-400">{game.description}</p>
                </div>

                <div className="text-2xl text-zinc-600 transition group-hover:translate-x-1 group-hover:text-emerald-300">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>

        <footer className="py-8 text-center text-xs text-zinc-600">
          New daily puzzles. More Rankle categories coming soon.
        </footer>
      </div>
    </main>
  );
}