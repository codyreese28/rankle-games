"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AchievementStats = {
  winsByTheme: {
    movies: number;
    games: number;
    music: number;
    mystery: number;
    dailyChallenge: number;
  };
  currentStreak: number;
  bestStreak: number;
  perfectGames: number;
  lastWinDate?: string;
};

type Achievement = {
  emoji: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: string;
  category: string;
};

function getDefaultAchievementStats(): AchievementStats {
  return {
    winsByTheme: {
      movies: 0,
      games: 0,
      music: 0,
      mystery: 0,
      dailyChallenge: 0,
    },
    currentStreak: 0,
    bestStreak: 0,
    perfectGames: 0,
  };
}

function getAchievements(stats: AchievementStats): Achievement[] {
  const totalWins =
    stats.winsByTheme.movies +
    stats.winsByTheme.games +
    stats.winsByTheme.music +
    stats.winsByTheme.mystery +
    stats.winsByTheme.dailyChallenge;

  return [
    {
      emoji: "🎬",
      name: "Movie Rookie",
      description: "Win your first Movie puzzle.",
      unlocked: stats.winsByTheme.movies >= 1,
      progress: `${Math.min(stats.winsByTheme.movies, 1)}/1`,
      category: "Movies",
    },
    {
      emoji: "🎬",
      name: "Movie Buff",
      description: "Win 5 Movie puzzles.",
      unlocked: stats.winsByTheme.movies >= 5,
      progress: `${Math.min(stats.winsByTheme.movies, 5)}/5`,
      category: "Movies",
    },
    {
      emoji: "🎬",
      name: "Cinema Master",
      description: "Win 10 Movie puzzles.",
      unlocked: stats.winsByTheme.movies >= 10,
      progress: `${Math.min(stats.winsByTheme.movies, 10)}/10`,
      category: "Movies",
    },

    {
      emoji: "🎮",
      name: "Player One",
      description: "Win your first Video Game puzzle.",
      unlocked: stats.winsByTheme.games >= 1,
      progress: `${Math.min(stats.winsByTheme.games, 1)}/1`,
      category: "Video Games",
    },
    {
      emoji: "🎮",
      name: "Controller King",
      description: "Win 5 Video Game puzzles.",
      unlocked: stats.winsByTheme.games >= 5,
      progress: `${Math.min(stats.winsByTheme.games, 5)}/5`,
      category: "Video Games",
    },
    {
      emoji: "🕹️",
      name: "Arcade Legend",
      description: "Win 10 Video Game puzzles.",
      unlocked: stats.winsByTheme.games >= 10,
      progress: `${Math.min(stats.winsByTheme.games, 10)}/10`,
      category: "Video Games",
    },

    {
      emoji: "🎵",
      name: "First Track",
      description: "Win your first Music puzzle.",
      unlocked: stats.winsByTheme.music >= 1,
      progress: `${Math.min(stats.winsByTheme.music, 1)}/1`,
      category: "Music",
    },
    {
      emoji: "🎵",
      name: "Album Expert",
      description: "Win 5 Music puzzles.",
      unlocked: stats.winsByTheme.music >= 5,
      progress: `${Math.min(stats.winsByTheme.music, 5)}/5`,
      category: "Music",
    },
    {
      emoji: "💿",
      name: "Discography Boss",
      description: "Win 10 Music puzzles.",
      unlocked: stats.winsByTheme.music >= 10,
      progress: `${Math.min(stats.winsByTheme.music, 10)}/10`,
      category: "Music",
    },

    {
      emoji: "❓",
      name: "Mystery Solver",
      description: "Win a Mystery Rankle puzzle.",
      unlocked: stats.winsByTheme.mystery >= 1,
      progress: `${Math.min(stats.winsByTheme.mystery, 1)}/1`,
      category: "Mystery",
    },
    {
      emoji: "🧩",
      name: "Mystery Hunter",
      description: "Win 5 Mystery puzzles.",
      unlocked: stats.winsByTheme.mystery >= 5,
      progress: `${Math.min(stats.winsByTheme.mystery, 5)}/5`,
      category: "Mystery",
    },
    {
      emoji: "🕵️",
      name: "Mystery Master",
      description: "Win 10 Mystery puzzles.",
      unlocked: stats.winsByTheme.mystery >= 10,
      progress: `${Math.min(stats.winsByTheme.mystery, 10)}/10`,
      category: "Mystery",
    },

    {
      emoji: "🌟",
      name: "Daily Challenger",
      description: "Win your first Hard Daily Challenge.",
      unlocked: stats.winsByTheme.dailyChallenge >= 1,
      progress: `${Math.min(stats.winsByTheme.dailyChallenge, 1)}/1`,
      category: "Hard Daily Challenge",
    },
    {
      emoji: "🧠",
      name: "No Hints Needed",
      description: "Win 5 Hard Daily Challenges.",
      unlocked: stats.winsByTheme.dailyChallenge >= 5,
      progress: `${Math.min(stats.winsByTheme.dailyChallenge, 5)}/5`,
      category: "Hard Daily Challenge",
    },
    {
      emoji: "💀",
      name: "Hard Mode Hero",
      description: "Win 10 Hard Daily Challenges.",
      unlocked: stats.winsByTheme.dailyChallenge >= 10,
      progress: `${Math.min(stats.winsByTheme.dailyChallenge, 10)}/10`,
      category: "Hard Daily Challenge",
    },

    {
      emoji: "🔥",
      name: "Hot Streak",
      description: "Reach a 3-day winning streak.",
      unlocked: stats.bestStreak >= 3,
      progress: `${Math.min(stats.bestStreak, 3)}/3`,
      category: "Streaks",
    },
    {
      emoji: "🔥",
      name: "Streak Master",
      description: "Reach a 7-day winning streak.",
      unlocked: stats.bestStreak >= 7,
      progress: `${Math.min(stats.bestStreak, 7)}/7`,
      category: "Streaks",
    },
    {
      emoji: "🌋",
      name: "Unstoppable",
      description: "Reach a 14-day winning streak.",
      unlocked: stats.bestStreak >= 14,
      progress: `${Math.min(stats.bestStreak, 14)}/14`,
      category: "Streaks",
    },

    {
      emoji: "🏆",
      name: "Perfect Rankler",
      description: "Solve any puzzle in 1 guess.",
      unlocked: stats.perfectGames >= 1,
      progress: `${Math.min(stats.perfectGames, 1)}/1`,
      category: "Perfect Games",
    },
    {
      emoji: "🥇",
      name: "First Guess Flex",
      description: "Solve 3 puzzles in 1 guess.",
      unlocked: stats.perfectGames >= 3,
      progress: `${Math.min(stats.perfectGames, 3)}/3`,
      category: "Perfect Games",
    },
    {
      emoji: "👑",
      name: "Rankle Royalty",
      description: "Solve 10 puzzles in 1 guess.",
      unlocked: stats.perfectGames >= 10,
      progress: `${Math.min(stats.perfectGames, 10)}/10`,
      category: "Perfect Games",
    },

    {
      emoji: "⭐",
      name: "Rankle Winner",
      description: "Win 10 total puzzles.",
      unlocked: totalWins >= 10,
      progress: `${Math.min(totalWins, 10)}/10`,
      category: "Overall",
    },
    {
      emoji: "🌟",
      name: "Rankle Veteran",
      description: "Win 25 total puzzles.",
      unlocked: totalWins >= 25,
      progress: `${Math.min(totalWins, 25)}/25`,
      category: "Overall",
    },
    {
      emoji: "💎",
      name: "Rankle Elite",
      description: "Win 50 total puzzles.",
      unlocked: totalWins >= 50,
      progress: `${Math.min(totalWins, 50)}/50`,
      category: "Overall",
    },
  ];
}

export default function AchievementsPage() {
  const [stats, setStats] = useState<AchievementStats>(
    getDefaultAchievementStats()
  );

  useEffect(() => {
    const savedStats = localStorage.getItem("rankle-achievements");

    if (!savedStats) return;

    try {
      const parsedStats = JSON.parse(savedStats) as AchievementStats;
      const defaultStats = getDefaultAchievementStats();

      setStats({
        ...defaultStats,
        ...parsedStats,
        winsByTheme: {
          ...defaultStats.winsByTheme,
          ...parsedStats.winsByTheme,
        },
      });
    } catch {
      setStats(getDefaultAchievementStats());
    }
  }, []);

  const achievements = getAchievements(stats);
  const unlockedCount = achievements.filter(
    (achievement) => achievement.unlocked
  ).length;

  const totalWins =
    stats.winsByTheme.movies +
    stats.winsByTheme.games +
    stats.winsByTheme.music +
    stats.winsByTheme.mystery +
    stats.winsByTheme.dailyChallenge;

  const groupedAchievements = achievements.reduce<Record<string, Achievement[]>>(
    (groups, achievement) => {
      if (!groups[achievement.category]) {
        groups[achievement.category] = [];
      }

      groups[achievement.category].push(achievement);
      return groups;
    },
    {}
  );

  return (
    <main className="min-h-screen bg-transparent text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <header className="mb-6 rounded-3xl border border-slate-300/70 bg-[#f7f4ec]/90 px-6 py-8 text-center shadow-lg shadow-slate-300/40 backdrop-blur-sm">
          <div className="text-xs font-black uppercase tracking-[0.35em] text-emerald-700">
            Rankle Games
          </div>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            Achievements
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Unlock badges by winning puzzles, building streaks, solving Rankle
            games perfectly, and beating the Hard Daily Challenge.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-300 bg-[#ece8df] p-4">
              <div className="text-3xl font-black text-emerald-800">
                {unlockedCount}/{achievements.length}
              </div>
              <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Unlocked
              </div>
            </div>

            <div className="rounded-2xl border border-slate-300 bg-[#ece8df] p-4">
              <div className="text-3xl font-black text-emerald-800">
                {totalWins}
              </div>
              <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Total Wins
              </div>
            </div>

            <div className="rounded-2xl border border-slate-300 bg-[#ece8df] p-4">
              <div className="text-3xl font-black text-emerald-800">
                {stats.bestStreak}
              </div>
              <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Best Streak
              </div>
            </div>

            <div className="rounded-2xl border border-slate-300 bg-[#ece8df] p-4">
              <div className="text-3xl font-black text-emerald-800">
                {stats.perfectGames}
              </div>
              <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Perfect Games
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white shadow-lg transition hover:bg-emerald-400 active:scale-[0.99]"
            >
              Back to Games
            </Link>

            <Link
              href="/about"
              className="rounded-2xl border border-slate-300 bg-[#ece8df] px-5 py-3 font-black text-slate-700 transition hover:bg-[#dfeee5] hover:text-emerald-800"
            >
              How to Play
            </Link>

            <Link
              href="/settings"
              className="rounded-2xl border border-slate-300 bg-[#ece8df] px-5 py-3 font-black text-slate-700 transition hover:bg-[#dfeee5] hover:text-emerald-800"
            >
              Settings
            </Link>
          </div>
        </header>

        <div className="space-y-6">
          {Object.entries(groupedAchievements).map(
            ([category, categoryAchievements]) => (
              <section
                key={category}
                className="rounded-3xl border border-slate-300/70 bg-[#f7f4ec]/90 p-5 shadow-lg shadow-slate-300/40 backdrop-blur-sm"
              >
                <div className="mb-5">
                  <div className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">
                    Badge Group
                  </div>

                  <h2 className="mt-2 text-3xl font-black text-slate-950">
                    {category}
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryAchievements.map((achievement) => (
                    <div
                      key={achievement.name}
                      className={`rounded-2xl border p-5 text-center shadow-md ${
                        achievement.unlocked
                          ? "border-emerald-300 bg-[#e4f3e9]"
                          : "border-slate-300 bg-[#ece8df]"
                      }`}
                    >
                      <div className="text-5xl">
                        {achievement.unlocked ? achievement.emoji : "🔒"}
                      </div>

                      <h3 className="mt-3 text-xl font-black text-slate-950">
                        {achievement.name}
                      </h3>

                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                        {achievement.description}
                      </p>

                      <div
                        className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-black ${
                          achievement.unlocked
                            ? "border-emerald-300 bg-[#f7f4ec] text-emerald-800"
                            : "border-slate-300 bg-[#f7f4ec] text-slate-500"
                        }`}
                      >
                        {achievement.unlocked
                          ? "Unlocked"
                          : `Progress ${achievement.progress}`}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          )}
        </div>

        <footer className="py-8 text-center text-xs text-slate-500">
          Achievements are saved on this device using your browser storage.
        </footer>
      </div>
    </main>
  );
}