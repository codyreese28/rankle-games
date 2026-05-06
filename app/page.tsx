"use client";

import { useState } from "react";
import Link from "next/link";
import RankleGame from "@/components/RankleGame";

type CategoryKey = "movies" | "games" | "music" | "mystery";
type SelectedGameKey = CategoryKey | "dailyChallenge";

const categories = {
  movies: {
    name: "Movies",
    emoji: "🎬",
    apiPath: "/api/movies/today",
    storagePrefix: "rankle-movies",
    accentLabel: "Daily Movie Sort",
    theme: "movies" as const,
  },
  games: {
    name: "Games",
    emoji: "🎮",
    apiPath: "/api/games/today",
    storagePrefix: "rankle-video-games",
    accentLabel: "Daily Video Game Sort",
    theme: "games" as const,
  },
  music: {
    name: "Music",
    emoji: "🎵",
    apiPath: "/api/music/today",
    storagePrefix: "rankle-music",
    accentLabel: "Daily Music Sort",
    theme: "music" as const,
  },
  mystery: {
    name: "Mystery",
    emoji: "❓",
    apiPath: "/api/mystery/today",
    storagePrefix: "rankle-mystery",
    accentLabel: "Daily Mystery Sort",
    theme: "mystery" as const,
  },
};

const dailyChallenge = {
  name: "Daily Challenge",
  emoji: "🌟",
  apiPath: "/api/daily-challenge/today",
  storagePrefix: "rankle-daily-challenge",
  accentLabel: "Daily Featured Mix",
  theme: "mystery" as const,
};

export default function HomePage() {
  const [selectedGameKey, setSelectedGameKey] =
    useState<SelectedGameKey>("movies");

  const categoryKeys = Object.keys(categories) as CategoryKey[];

  const selectedGame =
    selectedGameKey === "dailyChallenge"
      ? dailyChallenge
      : categories[selectedGameKey];

  const isDailySelected = selectedGameKey === "dailyChallenge";

  return (
    <main className="min-h-screen bg-transparent text-slate-900">
      <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-6">
        <header className="mb-6 rounded-3xl border border-slate-300/70 bg-[#f7f4ec]/90 px-6 py-6 shadow-lg shadow-slate-300/40 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[0.35em] text-emerald-700">
              Daily Ranking Games
            </div>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Rankle Games
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Pick a category, sort the list, and see how close you can get in
              three guesses.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/about"
                className="rounded-2xl border border-slate-300 bg-[#ece8df] px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-[#dfeee5] hover:text-emerald-800"
              >
                How to Play
              </Link>

              <Link
                href="/achievements"
                className="rounded-2xl border border-slate-300 bg-[#ece8df] px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-[#dfeee5] hover:text-emerald-800"
              >
                Achievements
              </Link>

              <Link
                href="/settings"
                className="rounded-2xl border border-slate-300 bg-[#ece8df] px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-[#dfeee5] hover:text-emerald-800"
              >
                Settings
              </Link>
            </div>
          </div>
        </header>

        <section className="mb-6 overflow-hidden rounded-3xl border border-amber-300/70 bg-gradient-to-br from-amber-100/95 via-[#f7f4ec]/95 to-purple-100/95 p-5 shadow-lg shadow-amber-200/40 backdrop-blur-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-amber-800">
                Today&apos;s Featured Challenge
              </div>

              <h2 className="mt-3 text-3xl font-black text-slate-950 md:text-4xl">
                🌟 Daily Challenge
              </h2>

              <p className="mt-2 max-w-2xl text-sm font-bold text-slate-600 md:text-base">
                A separate mixed puzzle using movies, video games, and music.
                This is not the Mystery category — it has its own daily board.
              </p>
            </div>

            <button
              onClick={() => setSelectedGameKey("dailyChallenge")}
              className={`rounded-2xl px-6 py-4 text-sm font-black shadow-lg transition active:scale-[0.99] ${
                isDailySelected
                  ? "bg-slate-900 text-white"
                  : "bg-amber-500 text-white hover:bg-amber-400"
              }`}
            >
              {isDailySelected ? "Daily Challenge Selected" : "Play Daily Challenge"}
            </button>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <aside className="rounded-3xl border border-slate-300/70 bg-[#f7f4ec]/90 p-4 shadow-lg shadow-slate-300/40 backdrop-blur-sm">
            <h2 className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-slate-500">
              Categories
            </h2>

            <nav className="space-y-3">
              {categoryKeys.map((key) => {
                const category = categories[key];
                const isActive = selectedGameKey === key;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedGameKey(key)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left text-lg font-bold transition ${
                      isActive
                        ? "border-emerald-500 bg-[#dfeee5] text-emerald-800"
                        : "border-slate-300 bg-[#ece8df] text-slate-700 hover:border-emerald-500 hover:bg-[#dfeee5] hover:text-emerald-800"
                    }`}
                  >
                    <span className="text-2xl">{category.emoji}</span>
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="rounded-3xl border border-slate-300/70 bg-[#f7f4ec]/90 p-5 shadow-lg shadow-slate-300/40 backdrop-blur-sm">
            <RankleGame
              key={selectedGameKey}
              apiPath={selectedGame.apiPath}
              storagePrefix={selectedGame.storagePrefix}
              accentLabel={selectedGame.accentLabel}
              theme={selectedGame.theme}
              embedded
            />
          </section>
        </div>

        <footer className="py-8 text-center text-xs text-slate-500">
          New daily puzzles. More Rankle categories coming soon.
        </footer>
      </div>
    </main>
  );
}