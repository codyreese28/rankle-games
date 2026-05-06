import Link from "next/link";

const rules = [
  {
    title: "Pick a category",
    text: "Choose Movies, Video Games, Music, Mystery, or any future Rankle category.",
  },
  {
    title: "Drag into order",
    text: "Move the five items into the order you think is correct from oldest to newest.",
  },
  {
    title: "Submit your guess",
    text: "You get three guesses to solve the daily puzzle.",
  },
  {
    title: "Only your score is revealed",
    text: "After each guess, Rankle only tells you how many are correct. It does not reveal which spots are correct.",
  },
];

const dataSources = [
  {
    emoji: "🎬",
    name: "Movies",
    source: "TMDB",
    text: "Movie titles, posters, and release dates are pulled from TMDB.",
  },
  {
    emoji: "🎮",
    name: "Video Games",
    source: "IGDB",
    text: "Video game titles, cover art, and release dates are pulled from IGDB.",
  },
  {
    emoji: "🎵",
    name: "Music",
    source: "Discogs",
    text: "Album titles, cover art, and release years are pulled from Discogs.",
  },
  {
    emoji: "❓",
    name: "Mystery",
    source: "Mixed",
    text: "Mystery Rankle combines Movies, Video Games, and Music into one mixed challenge.",
  },
];

const badges = [
  {
    emoji: "🎬",
    name: "Movie Buff",
    requirement: "Win 5 Movie puzzles.",
  },
  {
    emoji: "🎮",
    name: "Controller King",
    requirement: "Win 5 Video Game puzzles.",
  },
  {
    emoji: "🎵",
    name: "Album Expert",
    requirement: "Win 5 Music puzzles.",
  },
  {
    emoji: "❓",
    name: "Mystery Solver",
    requirement: "Win a Mystery Rankle puzzle.",
  },
  {
    emoji: "🔥",
    name: "Streak Master",
    requirement: "Reach a 7-day winning streak.",
  },
  {
    emoji: "🏆",
    name: "Perfect Rankler",
    requirement: "Solve a puzzle in 1 guess.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-transparent text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        <header className="mb-6 rounded-3xl border border-slate-300/70 bg-[#f7f4ec]/90 px-6 py-8 text-center shadow-lg shadow-slate-300/40 backdrop-blur-sm">
          <div className="text-xs font-black uppercase tracking-[0.35em] text-emerald-700">
            Rankle Games
          </div>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            How to Play
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Rankle is a daily sorting game. Pick a category, rank the five
            items from oldest to newest, and try to solve it in three guesses.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white shadow-lg transition hover:bg-emerald-400 active:scale-[0.99]"
            >
              Back to Games
            </Link>

            <Link
              href="/achievements"
              className="rounded-2xl border border-slate-300 bg-[#ece8df] px-5 py-3 font-black text-slate-700 transition hover:bg-[#dfeee5] hover:text-emerald-800"
            >
              View Achievements
            </Link>
          </div>
        </header>

        <section className="mb-6 rounded-3xl border border-slate-300/70 bg-[#f7f4ec]/90 p-5 shadow-lg shadow-slate-300/40 backdrop-blur-sm">
          <div className="mb-5">
            <div className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">
              Rules
            </div>
            <h2 className="mt-2 text-3xl font-black text-slate-950">
              The Basics
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {rules.map((rule, index) => (
              <div
                key={rule.title}
                className="rounded-2xl border border-slate-300 bg-[#ece8df] p-5"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#d5eadc] text-sm font-black text-emerald-800 ring-1 ring-emerald-300">
                  {index + 1}
                </div>

                <h3 className="text-xl font-black text-slate-950">
                  {rule.title}
                </h3>

                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  {rule.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-slate-300/70 bg-[#f7f4ec]/90 p-5 shadow-lg shadow-slate-300/40 backdrop-blur-sm">
          <div className="mb-5">
            <div className="text-xs font-black uppercase tracking-[0.28em] text-blue-700">
              Data Sources
            </div>
            <h2 className="mt-2 text-3xl font-black text-slate-950">
              Where the puzzles come from
            </h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Rankle uses public data sources to build daily puzzles. Release
              dates and years may vary by region or source, so Rankle uses the
              date returned by the selected data source for that puzzle.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {dataSources.map((source) => (
              <div
                key={source.name}
                className="rounded-2xl border border-slate-300 bg-[#ece8df] p-5"
              >
                <div className="text-4xl">{source.emoji}</div>

                <h3 className="mt-3 text-xl font-black text-slate-950">
                  {source.name}
                </h3>

                <div className="mt-2 inline-flex rounded-full border border-slate-300 bg-[#f7f4ec] px-3 py-1 text-xs font-black text-slate-700">
                  {source.source}
                </div>

                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                  {source.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-slate-300/70 bg-[#f7f4ec]/90 p-5 text-center shadow-lg shadow-slate-300/40 backdrop-blur-sm">
          <div className="mb-5">
            <div className="text-xs font-black uppercase tracking-[0.28em] text-purple-700">
              Badges
            </div>
            <h2 className="mt-2 text-3xl font-black text-slate-950">
              Achievements
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-slate-600">
              Badges reward wins, streaks, and perfect solves. Unlock them as
              you play daily Rankle puzzles.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => (
              <div
                key={badge.name}
                className="rounded-2xl border border-slate-300 bg-[#ece8df] p-5 text-center"
              >
                <div className="text-5xl">{badge.emoji}</div>

                <h3 className="mt-3 text-xl font-black text-slate-950">
                  {badge.name}
                </h3>

                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  {badge.requirement}
                </p>

                <div className="mt-4 inline-flex rounded-full border border-emerald-300 bg-[#e4f3e9] px-3 py-1 text-xs font-black text-emerald-800">
                  Available Now
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/achievements"
            className="mt-6 inline-flex rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white shadow-lg transition hover:bg-emerald-400 active:scale-[0.99]"
          >
            View All Achievements
          </Link>
        </section>

        <footer className="py-8 text-center text-xs text-slate-500">
          Rankle Games is a fan-made daily ranking game.
        </footer>
      </div>
    </main>
  );
}