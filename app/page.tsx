"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import RankleGame from "@/components/RankleGame";

type CategoryKey = "movies" | "games" | "music" | "mystery" | "sports";
type SelectedGameKey = CategoryKey | "dailyChallenge";
type SportsLeagueFilter = "ALL" | "NFL" | "NBA" | "NHL" | "MLB";

const categories = {
  movies: {
    name: "Movies",
    label: "MOVIES",
    emoji: "🎬",
    cardEmoji: "🎞️",
    animationClass: "rankle-card-animate-float",
    introTitle: "Movies",
    introText: "Sort five movies from oldest to newest by release date.",
    introDetail: "Movie puzzles use movie release dates.",
    description: "Rank movies by release date",
    apiPath: "/api/movies/today",
    storagePrefix: "rankle-movies",
    accentLabel: "Daily Movie Sort",
    theme: "movies" as const,
    cardClass: "from-red-800 to-red-500",
  },
  games: {
    name: "Video Games",
    label: "VIDEO GAMES",
    emoji: "🎮",
    cardEmoji: "🎮",
    animationClass: "rankle-card-animate-wiggle",
    introTitle: "Video Games",
    introText: "Sort five video games from oldest to newest by release date.",
    introDetail: "Video game puzzles use original release dates.",
    description: "Rank video games by release date",
    apiPath: "/api/games/today",
    storagePrefix: "rankle-video-games",
    accentLabel: "Daily Video Game Sort",
    theme: "games" as const,
    cardClass: "from-sky-800 to-cyan-500",
  },
  music: {
    name: "Music",
    label: "MUSIC",
    emoji: "🎵",
    cardEmoji: "💿",
    animationClass: "rankle-card-animate-spin",
    introTitle: "Music",
    introText: "Sort five albums from oldest to newest by release date.",
    introDetail: "Music puzzles use album release years.",
    description: "Rank albums by release date",
    apiPath: "/api/music/today",
    storagePrefix: "rankle-music",
    accentLabel: "Daily Music Sort",
    theme: "music" as const,
    cardClass: "from-emerald-800 to-green-500",
  },
  sports: {
    name: "Sports Teams",
    label: "SPORTS TEAMS",
    emoji: "🏆",
    cardEmoji: "🏈🏀⚾",
    animationClass: "rankle-card-animate-pulse",
    introTitle: "Sports Teams",
    introText:
      "Sort NFL, NBA, NHL, and MLB teams from oldest to newest by franchise founding year.",
    introDetail:
      "Sports puzzles use franchise founding year or first season, not current city date.",
    description: "Rank sports teams by established date",
    apiPath: "/api/sports/today",
    storagePrefix: "rankle-sports",
    accentLabel: "Daily Sports Team Sort",
    theme: "sports" as const,
    cardClass: "from-amber-700 to-yellow-500",
  },
  mystery: {
    name: "Mystery Rankle",
    label: "MYSTERY RANKLE",
    emoji: "❓",
    cardEmoji: "🕵️",
    animationClass: "rankle-card-animate-mystery",
    introTitle: "Mystery Rankle",
    introText:
      "Sort a mixed set of movies, video games, albums, and sports teams from oldest to newest.",
    introDetail:
      "Category hints are shown, but correct positions are not revealed.",
    description: "Rank a mix of movies, games, music & sports teams",
    apiPath: "/api/mystery/today",
    storagePrefix: "rankle-mystery",
    accentLabel: "Daily Mystery Sort",
    theme: "mystery" as const,
    cardClass: "from-purple-900 to-violet-500",
  },
};

const dailyChallenge = {
  name: "Hard Daily Challenge",
  label: "HARD DAILY CHALLENGE",
  emoji: "📅",
  cardEmoji: "🗓️",
  animationClass: "rankle-card-animate-calendar",
  introTitle: "Hard Daily Challenge",
  introText:
    "Sort a hard mixed puzzle from oldest to newest with no category hints shown.",
  introDetail:
    "This is separate from Mystery and uses movies, games, music, and sports teams.",
  description: "A new mixed challenge every day",
  apiPath: "/api/daily-challenge/today",
  storagePrefix: "rankle-daily-challenge",
  accentLabel: "Hard Daily Mix",
  theme: "mystery" as const,
  cardClass: "from-orange-800 to-orange-400",
};

const featureHighlights = [
  {
    emoji: "🧠",
    title: "Test Your Knowledge",
    text: "Across movies, games, music & more",
  },
  {
    emoji: "🏆",
    title: "Unlock Achievements",
    text: "Earn badges and track progress",
  },
  {
    emoji: "🔥",
    title: "Build Your Streak",
    text: "Play daily and keep it going",
  },
  {
    emoji: "⭐",
    title: "Become a Rankle Master",
    text: "Level up your mastery",
  },
];

const sportsLeagueFilters: {
  label: string;
  value: SportsLeagueFilter;
  emoji: string;
}[] = [
  {
    label: "All Sports",
    value: "ALL",
    emoji: "🏆",
  },
  {
    label: "NFL",
    value: "NFL",
    emoji: "🏈",
  },
  {
    label: "NBA",
    value: "NBA",
    emoji: "🏀",
  },
  {
    label: "NHL",
    value: "NHL",
    emoji: "🏒",
  },
  {
    label: "MLB",
    value: "MLB",
    emoji: "⚾",
  },
];

function getSportsApiPath(league: SportsLeagueFilter) {
  if (league === "ALL") return "/api/sports/today";

  return `/api/sports/today?league=${league}`;
}

function getSportsStoragePrefix(league: SportsLeagueFilter) {
  if (league === "ALL") return "rankle-sports";

  return `rankle-sports-${league.toLowerCase()}`;
}

function getSportsAccentLabel(league: SportsLeagueFilter) {
  if (league === "ALL") return "Daily Sports Team Sort";

  return `Daily ${league} Team Sort`;
}

function getSportsName(league: SportsLeagueFilter) {
  if (league === "ALL") return "Sports Teams";

  return `${league} Teams`;
}

function getSportsIntroText(league: SportsLeagueFilter) {
  if (league === "ALL") {
    return "Sort NFL, NBA, NHL, and MLB teams from oldest to newest by franchise founding year.";
  }

  return `Sort five ${league} teams from oldest to newest by franchise founding year.`;
}

export default function HomePage() {
  const [selectedGameKey, setSelectedGameKey] =
    useState<SelectedGameKey>("movies");
  const [introGameKey, setIntroGameKey] = useState<SelectedGameKey | null>(null);
  const [hasStartedPuzzle, setHasStartedPuzzle] = useState(false);
  const [sportsLeagueFilter, setSportsLeagueFilter] =
    useState<SportsLeagueFilter>("ALL");

  const gameSectionRef = useRef<HTMLDivElement | null>(null);

  const selectedGame =
    selectedGameKey === "dailyChallenge"
      ? dailyChallenge
      : selectedGameKey === "sports"
      ? {
          ...categories.sports,
          name: getSportsName(sportsLeagueFilter),
          introText: getSportsIntroText(sportsLeagueFilter),
          apiPath: getSportsApiPath(sportsLeagueFilter),
          storagePrefix: getSportsStoragePrefix(sportsLeagueFilter),
          accentLabel: getSportsAccentLabel(sportsLeagueFilter),
        }
      : categories[selectedGameKey];

  const introGame =
    introGameKey === "dailyChallenge"
      ? dailyChallenge
      : introGameKey === "sports"
      ? {
          ...categories.sports,
          name: getSportsName(sportsLeagueFilter),
          introText: getSportsIntroText(sportsLeagueFilter),
          apiPath: getSportsApiPath(sportsLeagueFilter),
          storagePrefix: getSportsStoragePrefix(sportsLeagueFilter),
          accentLabel: getSportsAccentLabel(sportsLeagueFilter),
        }
      : introGameKey
      ? categories[introGameKey]
      : null;

  const categoryCards = [
    {
      key: "movies" as SelectedGameKey,
      ...categories.movies,
    },
    {
      key: "games" as SelectedGameKey,
      ...categories.games,
    },
    {
      key: "music" as SelectedGameKey,
      ...categories.music,
    },
    {
      key: "sports" as SelectedGameKey,
      ...categories.sports,
    },
    {
      key: "mystery" as SelectedGameKey,
      ...categories.mystery,
    },
    {
      key: "dailyChallenge" as SelectedGameKey,
      ...dailyChallenge,
    },
  ];

  function openCategoryIntro(key: SelectedGameKey) {
    setIntroGameKey(key);
    setHasStartedPuzzle(false);

    setTimeout(() => {
      gameSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  function selectSportsLeague(league: SportsLeagueFilter) {
    setSportsLeagueFilter(league);
    setHasStartedPuzzle(false);
  }

  function startPuzzle() {
    if (!introGameKey) return;

    setSelectedGameKey(introGameKey);
    setHasStartedPuzzle(true);

    setTimeout(() => {
      gameSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#071b16] text-slate-950">
      <section className="relative min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f6edd5_0%,#194235_42%,#071b16_100%)]" />

        <div className="absolute inset-0 opacity-95">
          <div className="absolute left-0 top-0 h-full w-[18%] bg-gradient-to-b from-red-900 via-red-700 to-[#071b16] opacity-90" />
          <div className="absolute left-[18%] top-0 h-full w-[18%] bg-gradient-to-b from-cyan-700 via-sky-600 to-[#071b16] opacity-80" />
          <div className="absolute left-[36%] top-0 h-full w-[18%] bg-gradient-to-b from-emerald-700 via-green-500 to-[#071b16] opacity-55" />
          <div className="absolute left-[54%] top-0 h-full w-[18%] bg-gradient-to-b from-amber-600 via-yellow-500 to-[#071b16] opacity-60" />
          <div className="absolute left-[72%] top-0 h-full w-[14%] bg-gradient-to-b from-purple-900 via-violet-700 to-[#071b16] opacity-80" />
          <div className="absolute right-0 top-0 h-full w-[14%] bg-gradient-to-b from-orange-700 via-orange-500 to-[#071b16] opacity-75" />
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,27,22,0.1),rgba(7,27,22,0.25)_50%,rgba(7,27,22,0.95)_100%)]" />

        <div className="relative mx-auto max-w-[92rem] px-4 py-4 sm:px-6 lg:px-8">
          <header className="mb-8 rounded-[2rem] border border-white/30 bg-[#fff4dd]/95 px-5 py-4 shadow-2xl shadow-black/25 backdrop-blur-md">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Link
                href="/"
                className="flex items-center justify-center md:justify-start"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src="/icon.png"
                    alt="Rankle Games"
                    width={72}
                    height={72}
                    className="rounded-2xl"
                    priority
                  />

                  <div className="leading-none">
                    <div className="text-3xl font-black uppercase tracking-tight text-emerald-900 drop-shadow-sm sm:text-4xl">
                      Rankle
                    </div>
                    <div className="-mt-1 text-3xl font-black uppercase tracking-tight text-green-700 drop-shadow-sm sm:text-4xl">
                      Games
                    </div>
                  </div>
                </div>
              </Link>

              <nav className="flex flex-wrap items-center justify-center gap-3 text-xs font-black uppercase tracking-wide text-slate-900 sm:text-sm">
                <Link
                  href="/about"
                  className="rounded-2xl px-3 py-2 transition hover:bg-emerald-100"
                >
                  How to Play
                </Link>

                <Link
                  href="/achievements"
                  className="rounded-2xl px-3 py-2 transition hover:bg-emerald-100"
                >
                  🏆 Achievements
                </Link>

                <Link
                  href="/archive"
                  className="rounded-2xl px-3 py-2 transition hover:bg-emerald-100"
                >
                  📅 Archive
                </Link>

                <Link
                  href="/settings"
                  className="rounded-2xl px-3 py-2 transition hover:bg-emerald-100"
                >
                  ⚙️ Settings
                </Link>
              </nav>
            </div>
          </header>

          <section className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-[#fff4dd]/75 px-5 py-8 text-center shadow-2xl shadow-black/30 backdrop-blur-sm sm:px-8 lg:px-12">
            <div className="pointer-events-none absolute left-6 top-12 hidden text-8xl opacity-70 lg:block">
              🎬
            </div>

            <div className="pointer-events-none absolute left-[18%] top-24 hidden text-5xl opacity-70 lg:block">
              🎮
            </div>

            <div className="pointer-events-none absolute left-[34%] bottom-16 hidden text-7xl opacity-70 lg:block">
              💿
            </div>

            <div className="pointer-events-none absolute right-[30%] bottom-16 hidden text-7xl opacity-80 lg:block">
              🏆
            </div>

            <div className="pointer-events-none absolute right-[14%] top-16 hidden text-8xl opacity-40 lg:block">
              ❓
            </div>

            <div className="pointer-events-none absolute right-8 bottom-20 hidden text-8xl opacity-70 lg:block">
              🗓️
            </div>

            <div className="relative mx-auto max-w-4xl">
              <div className="text-2xl font-black text-emerald-800 sm:text-3xl">
                Welcome to
              </div>

              <h1 className="mt-2 text-5xl font-black uppercase tracking-tight text-[#071b16] drop-shadow-sm sm:text-7xl lg:text-8xl">
                Rankle Games
              </h1>

              <div className="mt-5 text-2xl font-black text-emerald-900 sm:text-3xl">
                Sort. Rank. Conquer.
              </div>

              <p className="mx-auto mt-5 max-w-2xl text-base font-bold leading-7 text-slate-900 sm:text-xl">
                Put your pop culture knowledge to the test. Can you rank them
                in the right order?
              </p>
            </div>
          </section>

          <section className="mt-6 grid gap-4 px-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {categoryCards.map((card) => {
              const isActive = introGameKey === card.key;

              return (
                <button
                  key={card.key}
                  onClick={() => openCategoryIntro(card.key)}
                  className={`group overflow-hidden rounded-[1.6rem] border text-left shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:shadow-black/40 ${
                    isActive
                      ? "border-emerald-300 ring-4 ring-emerald-300/50"
                      : "border-white/35"
                  }`}
                >
                  <div
                    className={`rankle-card-shine relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br ${card.cardClass} text-7xl`}
                  >
                    <div
                      className={`${card.animationClass} relative z-10 transition group-hover:scale-125`}
                    >
                      {card.cardEmoji}
                    </div>
                  </div>

                  <div className="min-h-[13rem] bg-[#fff4dd] p-5 text-center">
                    <h2 className="text-2xl font-black leading-tight text-[#071b16]">
                      {card.label}
                    </h2>

                    <p className="mx-auto mt-4 min-h-[3.5rem] max-w-[12rem] text-sm font-bold leading-6 text-slate-800">
                      {card.description}
                    </p>

                    <div className="mt-5 rounded-2xl bg-emerald-700 px-5 py-3 text-center text-base font-black text-white shadow-lg shadow-emerald-900/30 transition group-hover:bg-emerald-600">
                      Select
                    </div>
                  </div>
                </button>
              );
            })}
          </section>

          <section className="mt-5 rounded-3xl border border-green-400/60 bg-[#061f17]/95 px-5 py-4 shadow-2xl shadow-black/25">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {featureHighlights.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center gap-4 rounded-2xl px-3 py-2 text-[#fff4dd]"
                >
                  <div className="text-4xl">{feature.emoji}</div>

                  <div>
                    <div className="text-base font-black">{feature.title}</div>
                    <div className="text-xs font-semibold text-[#d8c7a3]">
                      {feature.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5 rounded-3xl border border-cyan-300/60 bg-[#061f17]/95 px-5 py-4 text-center shadow-2xl shadow-black/25">
            <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
              <div className="text-center md:text-left">
                <div className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
                  Sponsored
                </div>

                <div className="mt-1 text-xl font-black text-[#fff4dd]">
                  Check out CKHacks
                </div>

                <p className="mt-1 text-sm font-semibold text-[#d8c7a3]">
                  Visit ckhacks.com for your top tier Call of Duty DMZ hacks.
                </p>
              </div>

              <a
                href="https://ckhacks.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl bg-cyan-500 px-5 py-3 font-black text-white shadow-lg transition hover:bg-cyan-400 active:scale-[0.99]"
              >
                Visit Site
              </a>
            </div>
          </section>

          <section
            ref={gameSectionRef}
            className="mt-8 rounded-[2rem] border border-white/30 bg-[#fff4dd]/95 p-3 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-5"
          >
            {!introGame && !hasStartedPuzzle && (
              <div className="rounded-[1.5rem] border border-slate-300 bg-[#f7f4ec]/90 p-8 text-center">
                <div className="text-5xl">🎯</div>

                <h2 className="mt-4 text-3xl font-black text-[#071b16]">
                  Choose a Category
                </h2>

                <p className="mx-auto mt-3 max-w-2xl text-base font-bold text-slate-700">
                  Pick one of the category cards above to preview the rules,
                  then start the puzzle when you are ready.
                </p>
              </div>
            )}

            {introGame && !hasStartedPuzzle && (
              <div className="rounded-[1.5rem] border border-slate-300 bg-[#f7f4ec]/90 p-6 text-center shadow-lg">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300 bg-[#e4f3e9] text-5xl shadow-md">
                  {introGame.emoji}
                </div>

                <div className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-emerald-700">
                  Category Selected
                </div>

                <h2 className="mt-2 text-4xl font-black text-[#071b16] md:text-5xl">
                  {introGame.introTitle}
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-lg font-bold leading-8 text-slate-800">
                  {introGame.introText}
                </p>

                {introGameKey === "sports" && (
                  <div className="mx-auto mt-6 max-w-3xl rounded-3xl border border-slate-300 bg-[#ece8df] p-4">
                    <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
                      Choose League
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-5">
                      {sportsLeagueFilters.map((league) => {
                        const isSelected = sportsLeagueFilter === league.value;

                        return (
                          <button
                            key={league.value}
                            onClick={() => selectSportsLeague(league.value)}
                            className={`rounded-2xl border px-3 py-3 text-sm font-black transition active:scale-[0.99] ${
                              isSelected
                                ? "border-emerald-400 bg-emerald-500 text-white shadow-lg shadow-emerald-700/25"
                                : "border-slate-300 bg-[#f7f4ec] text-slate-700 hover:border-emerald-400 hover:bg-[#e4f3e9] hover:text-emerald-800"
                            }`}
                          >
                            <div className="text-2xl">{league.emoji}</div>
                            <div className="mt-1">{league.label}</div>
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-3 text-xs font-bold text-slate-500">
                      Each league filter has its own daily puzzle progress.
                    </p>
                  </div>
                )}

                <div className="mx-auto mt-6 grid max-w-3xl gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-300 bg-[#ece8df] p-4">
                    <div className="text-3xl">🧩</div>
                    <div className="mt-2 text-xl font-black text-[#071b16]">
                      5 Items
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-600">
                      Arrange the full board
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-300 bg-[#ece8df] p-4">
                    <div className="text-3xl">🎯</div>
                    <div className="mt-2 text-xl font-black text-[#071b16]">
                      3 Guesses
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-600">
                      Make each guess count
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-300 bg-[#ece8df] p-4">
                    <div className="text-3xl">🔒</div>
                    <div className="mt-2 text-xl font-black text-[#071b16]">
                      Score Only
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-600">
                      Correct spots stay hidden
                    </div>
                  </div>
                </div>

                <p className="mx-auto mt-5 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                  {introGame.introDetail}
                </p>

                <button
                  onClick={startPuzzle}
                  className="mt-7 rounded-2xl bg-emerald-600 px-8 py-4 text-lg font-black text-white shadow-xl shadow-emerald-900/25 transition hover:bg-emerald-500 active:scale-[0.99]"
                >
                  Start Puzzle
                </button>
              </div>
            )}

            {hasStartedPuzzle && (
              <>
                <div className="mb-5 flex flex-col gap-3 border-b border-slate-300/70 pb-5 text-center md:flex-row md:items-center md:justify-between md:text-left">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">
                      Now Playing
                    </div>

                    <h2 className="mt-1 text-3xl font-black text-[#071b16]">
                      {selectedGame.emoji} {selectedGame.name}
                    </h2>
                  </div>

                  <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800">
                    {selectedGame.accentLabel}
                  </div>
                </div>

                <RankleGame
                  key={`${selectedGameKey}-${sportsLeagueFilter}`}
                  apiPath={selectedGame.apiPath}
                  storagePrefix={selectedGame.storagePrefix}
                  accentLabel={selectedGame.accentLabel}
                  theme={selectedGame.theme}
                  embedded
                />
              </>
            )}
          </section>

          <footer className="py-8 text-center text-xs font-bold text-[#d8c7a3]">
            New daily puzzles. More Rankle categories coming soon.
          </footer>
        </div>
      </section>
    </main>
  );
}