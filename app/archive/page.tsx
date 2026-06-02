"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import RanklePageBackground from "@/components/RanklePageBackground";

type ArchiveEntry = {
  key: string;
  date: string;
  category: string;
  emoji: string;
  label: string;
  status: "Won" | "Lost" | "In Progress";
  guessesUsed: number;
  rankleIQ?: number;
  hintUsed?: boolean;
};

const categoryInfo: Record<
  string,
  {
    emoji: string;
    label: string;
  }
> = {
  "rankle-movies": {
    emoji: "🎬",
    label: "Movies",
  },
  "rankle-video-games": {
    emoji: "🎮",
    label: "Video Games",
  },
  "rankle-music": {
    emoji: "🎵",
    label: "Music",
  },
  "rankle-mystery": {
    emoji: "❓",
    label: "Mystery",
  },
  "rankle-sports": {
    emoji: "🏆",
    label: "Sports",
  },
  "rankle-sports-nfl": {
    emoji: "🏈",
    label: "NFL",
  },
  "rankle-sports-nba": {
    emoji: "🏀",
    label: "NBA",
  },
  "rankle-sports-nhl": {
    emoji: "🏒",
    label: "NHL",
  },
  "rankle-sports-mlb": {
    emoji: "⚾",
    label: "MLB",
  },
  "rankle-daily-challenge": {
    emoji: "🌟",
    label: "Hard Daily",
  },
};

function getDateFromKey(key: string) {
  const match = key.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

function getCategoryFromKey(key: string) {
  const date = getDateFromKey(key);

  if (!date) return "";

  return key.replace(`-${date}`, "");
}

function getStatus(savedGame: any): "Won" | "Lost" | "In Progress" {
  if (savedGame?.won === true) return "Won";
  if (savedGame?.gameOver === true) return "Lost";
  return "In Progress";
}

function getGuessesUsed(savedGame: any) {
  if (Array.isArray(savedGame?.guesses)) {
    return savedGame.guesses.length;
  }

  return 0;
}

function getArchiveEntries() {
  const entries: ArchiveEntry[] = [];

  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);

    if (!key) continue;
    if (!key.startsWith("rankle-")) continue;
    if (key.endsWith("-hint")) continue;
    if (key === "rankle-achievements") continue;
    if (key === "rankle-sound-enabled") continue;
    if (key === "rankle-animations-enabled") continue;
    if (key === "rankle-nickname") continue;

    const date = getDateFromKey(key);
    const category = getCategoryFromKey(key);
    const info = categoryInfo[category];

    if (!date || !info) continue;

    try {
      const savedGame = JSON.parse(localStorage.getItem(key) || "{}");
      const hintKey = `${key}-hint`;
      const hintValue = localStorage.getItem(hintKey);

      entries.push({
        key,
        date,
        category,
        emoji: info.emoji,
        label: info.label,
        status: getStatus(savedGame),
        guessesUsed: getGuessesUsed(savedGame),
        rankleIQ:
          typeof savedGame?.rankleIQ === "number" ? savedGame.rankleIQ : undefined,
        hintUsed: Boolean(hintValue),
      });
    } catch {
      continue;
    }
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

function groupEntriesByDate(entries: ArchiveEntry[]) {
  return entries.reduce<Record<string, ArchiveEntry[]>>((groups, entry) => {
    if (!groups[entry.date]) {
      groups[entry.date] = [];
    }

    groups[entry.date].push(entry);
    return groups;
  }, {});
}

function formatDisplayDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  return parsedDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusClass(status: ArchiveEntry["status"]) {
  if (status === "Won") {
    return "border-emerald-300 bg-[#e4f3e9] text-emerald-800";
  }

  if (status === "Lost") {
    return "border-red-300 bg-red-50 text-red-700";
  }

  return "border-amber-300 bg-amber-50 text-amber-700";
}

export default function ArchivePage() {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);

  useEffect(() => {
    setEntries(getArchiveEntries());
  }, []);

  const groupedEntries = useMemo(() => groupEntriesByDate(entries), [entries]);

  const totalPlayed = entries.length;
  const totalWon = entries.filter((entry) => entry.status === "Won").length;
  const totalLost = entries.filter((entry) => entry.status === "Lost").length;
  const totalHints = entries.filter((entry) => entry.hintUsed).length;

  return (
    <RanklePageBackground>
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <header className="mb-6 rounded-3xl border border-slate-300/70 bg-[#f7f4ec]/90 px-6 py-8 text-center shadow-lg shadow-slate-300/40 backdrop-blur-sm">
          <div className="text-xs font-black uppercase tracking-[0.35em] text-emerald-700">
            Rankle Games
          </div>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            Puzzle Archive
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            View your saved puzzle history on this device. This archive uses
            your browser storage.
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
              Achievements
            </Link>

            <Link
              href="/settings"
              className="rounded-2xl border border-slate-300 bg-[#ece8df] px-5 py-3 font-black text-slate-700 transition hover:bg-[#dfeee5] hover:text-emerald-800"
            >
              Settings
            </Link>
          </div>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-300 bg-[#f7f4ec]/90 p-4 text-center shadow-lg shadow-slate-300/30">
            <div className="text-3xl font-black text-emerald-800">
              {totalPlayed}
            </div>
            <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              Played
            </div>
          </div>

          <div className="rounded-2xl border border-slate-300 bg-[#f7f4ec]/90 p-4 text-center shadow-lg shadow-slate-300/30">
            <div className="text-3xl font-black text-emerald-800">
              {totalWon}
            </div>
            <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              Wins
            </div>
          </div>

          <div className="rounded-2xl border border-slate-300 bg-[#f7f4ec]/90 p-4 text-center shadow-lg shadow-slate-300/30">
            <div className="text-3xl font-black text-red-700">
              {totalLost}
            </div>
            <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              Losses
            </div>
          </div>

          <div className="rounded-2xl border border-slate-300 bg-[#f7f4ec]/90 p-4 text-center shadow-lg shadow-slate-300/30">
            <div className="text-3xl font-black text-amber-700">
              {totalHints}
            </div>
            <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              Hints Used
            </div>
          </div>
        </section>

        {entries.length === 0 ? (
          <section className="rounded-3xl border border-slate-300/70 bg-[#f7f4ec]/90 p-8 text-center shadow-lg shadow-slate-300/40 backdrop-blur-sm">
            <div className="text-6xl">📅</div>

            <h2 className="mt-4 text-3xl font-black text-slate-950">
              No archive history yet
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Play a few Rankle puzzles and your saved history will appear here.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white shadow-lg transition hover:bg-emerald-400 active:scale-[0.99]"
            >
              Play Today’s Games
            </Link>
          </section>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([date, dateEntries]) => (
              <section
                key={date}
                className="rounded-3xl border border-slate-300/70 bg-[#f7f4ec]/90 p-5 shadow-lg shadow-slate-300/40 backdrop-blur-sm"
              >
                <div className="mb-5">
                  <div className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">
                    Archive Date
                  </div>

                  <h2 className="mt-2 text-2xl font-black text-slate-950 md:text-3xl">
                    {formatDisplayDate(date)}
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {dateEntries.map((entry) => (
                    <div
                      key={entry.key}
                      className="rounded-2xl border border-slate-300 bg-[#ece8df] p-5 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-4xl">{entry.emoji}</div>

                          <h3 className="mt-3 text-xl font-black text-slate-950">
                            {entry.label}
                          </h3>
                        </div>

                        <div
                          className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusClass(
                            entry.status
                          )}`}
                        >
                          {entry.status}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                        <div className="rounded-2xl border border-slate-300 bg-[#f7f4ec] p-3">
                          <div className="text-lg font-black text-slate-950">
                            {entry.guessesUsed}/3
                          </div>
                          <div className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                            Guesses
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-300 bg-[#f7f4ec] p-3">
                          <div className="text-lg font-black text-slate-950">
                            {entry.hintUsed ? "Yes" : "No"}
                          </div>
                          <div className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                            Hint
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <footer className="py-8 text-center text-xs font-bold text-[#d8c7a3]">
          Archive data is stored locally on this device.
        </footer>
      </div>
    </RanklePageBackground>
  );
}