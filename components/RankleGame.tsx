"use client";

import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ThemeName = "movies" | "games" | "music" | "mystery" | "sports";
type RankleItem = {
  id: number | string;
  title: string;
  image: string;
};

type AnswerItem = {
  id: number | string;
  title: string;
  releaseDate: string;
};

type RanklePuzzle = {
  date: string;
  title: string;
  challenge: string;
  gameType: string;
  items: RankleItem[];
  answer: AnswerItem[];
};

type SavedGame = {
  itemOrder?: Array<number | string>;
  guesses?: string[][];
  message?: string;
  gameOver?: boolean;
  won?: boolean;
};

type AchievementStats = {
  winsByTheme: {
    movies: number;
    games: number;
    music: number;
    mystery: number;
    sports: number;
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
};

type RankleStats = {
  gamesPlayed: number;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
  perfectGames: number;
  guessDistribution: {
    one: number;
    two: number;
    three: number;
  };
  lastPlayedDate?: string;
};

type RankleGameProps = {
  apiPath: string;
  storagePrefix: string;
  accentLabel?: string;
  theme?: ThemeName;
  embedded?: boolean;
};

type ThemeClasses = {
  pageBg: string;
  panel: string;
  card: string;
  cardHover: string;
  border: string;
  accentText: string;
  accentSoft: string;
  accentPill: string;
  accentBorder: string;
  button: string;
  buttonText: string;
  glow: string;
  arrowText: string;
};

type SortableCardProps = {
  item: RankleItem;
  index: number;
  gameOver: boolean;
  themeClasses: ThemeClasses;
  animationsEnabled: boolean;
};

const themes: Record<ThemeName, ThemeClasses> = {
  movies: {
    pageBg: "bg-[#eef3ed]",
    panel: "bg-[#f7f4ec]",
    card: "bg-[#ece8df]",
    cardHover: "hover:bg-[#dfeee5]",
    border: "border-slate-300",
    accentText: "text-emerald-800",
    accentSoft: "bg-[#d5eadc]",
    accentPill: "bg-[#e4f3e9]",
    accentBorder: "border-emerald-300",
    button: "bg-emerald-500 hover:bg-emerald-400",
    buttonText: "text-white",
    glow: "shadow-emerald-200/50",
    arrowText: "group-hover:text-emerald-700",
  },
  games: {
    pageBg: "bg-[#edf1f7]",
    panel: "bg-[#f3f4f8]",
    card: "bg-[#e6e9f0]",
    cardHover: "hover:bg-[#dfe7f5]",
    border: "border-slate-300",
    accentText: "text-blue-800",
    accentSoft: "bg-[#d9e8fa]",
    accentPill: "bg-[#e5effc]",
    accentBorder: "border-blue-300",
    button: "bg-blue-500 hover:bg-blue-400",
    buttonText: "text-white",
    glow: "shadow-blue-200/50",
    arrowText: "group-hover:text-blue-700",
  },
  music: {
    pageBg: "bg-[#f3eef4]",
    panel: "bg-[#f7f1f4]",
    card: "bg-[#ede4ea]",
    cardHover: "hover:bg-[#f0dfea]",
    border: "border-slate-300",
    accentText: "text-purple-800",
    accentSoft: "bg-[#ead8f3]",
    accentPill: "bg-[#f1e4f7]",
    accentBorder: "border-purple-300",
    button: "bg-purple-500 hover:bg-purple-400",
    buttonText: "text-white",
    glow: "shadow-purple-200/50",
    arrowText: "group-hover:text-purple-700",
  },
  mystery: {
    pageBg: "bg-[#f1efe8]",
    panel: "bg-[#f8f3e8]",
    card: "bg-[#eee5d5]",
    cardHover: "hover:bg-[#e9dcc4]",
    border: "border-slate-300",
    accentText: "text-amber-800",
    accentSoft: "bg-[#f2dfb5]",
    accentPill: "bg-[#f8eac8]",
    accentBorder: "border-amber-300",
    button: "bg-amber-500 hover:bg-amber-400",
    buttonText: "text-white",
    glow: "shadow-amber-200/50",
    arrowText: "group-hover:text-amber-700",
  },
  sports: {
    pageBg: "bg-transparent",
    panel: "bg-[#f7f4ec]/95",
    card: "bg-[#ece8df]/95",
    cardHover: "hover:bg-[#dfeee5]",
    border: "border-slate-300/80",
    accentText: "text-emerald-800",
    accentSoft: "bg-[#d5eadc]",
    accentPill: "bg-[#e4f3e9]",
    accentBorder: "border-emerald-300",
    button: "bg-emerald-500 hover:bg-emerald-400",
    buttonText: "text-white",
    glow: "shadow-emerald-200/40",
    arrowText: "group-hover:text-emerald-800",
  },
};

function SortableCard({
  item,
  index,
  gameOver,
  themeClasses,
  animationsEnabled,
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: gameOver,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : undefined,
    scale: isDragging ? "1.02" : "1",
    animationDelay: animationsEnabled ? `${index * 90}ms` : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group flex items-center gap-3 rounded-3xl border px-3 py-2 shadow-md transition-all duration-300 sm:gap-4 sm:px-4 sm:py-3 ${
        isDragging
          ? "scale-[1.03] border-emerald-400 bg-emerald-50 shadow-2xl shadow-emerald-300/70 ring-4 ring-emerald-300"
          : `${themeClasses.border} bg-white/70 shadow-slate-300/40 ${themeClasses.cardHover}`
      } ${
        animationsEnabled ? "animate-rankle-card-reveal opacity-0" : ""
      } ${
        gameOver ? "cursor-default" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-[#f7f4ec] text-sm font-black text-slate-700 sm:h-11 sm:w-11 sm:text-base">
        {index + 1}
      </div>

      <img
        src={item.image}
        alt={item.title}
        className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-md ring-1 ring-slate-300 sm:h-20 sm:w-20"
      />

      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-black text-slate-950 sm:text-lg">
          {item.title}
        </div>
        <div className="text-xs font-semibold text-slate-500">
          {gameOver ? "Locked" : "Drag to reorder"}
        </div>
      </div>

      {!gameOver && (
        <div className="px-1 text-lg font-black text-slate-400 sm:text-xl">
          {"\u2261"}
        </div>
      )}
    </div>
  );
}

export default function RankleGame({
  apiPath,
  storagePrefix,
  accentLabel = "Daily Sort",
  theme = "movies",
  embedded = false,
}: RankleGameProps) {
  const themeClasses = themes[theme];

  const [puzzle, setPuzzle] = useState<RanklePuzzle | null>(null);
  const [items, setItems] = useState<RankleItem[]>([]);
  const [guesses, setGuesses] = useState<string[][]>([]);
  const [message, setMessage] = useState("");
  const [nickname, setNickname] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [isRevealingAnswer, setIsRevealingAnswer] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [achievementStats, setAchievementStats] =
    useState<AchievementStats | null>(null);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showAchievementUnlockedModal, setShowAchievementUnlockedModal] =
    useState(false);
  const [stats, setStats] = useState<RankleStats | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [timeUntilNextPuzzle, setTimeUntilNextPuzzle] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setPuzzle(null);
    setItems([]);
    setGuesses([]);
    setMessage("");
    setGameOver(false);
    setWon(false);
    setIsRevealingAnswer(false);
    setLoaded(false);
    setLoadError("");
    setShowFinalModal(false);

    async function loadPuzzle() {
      try {
        const response = await fetch(apiPath);

        if (!response.ok) {
          throw new Error(`Failed to load puzzle from ${apiPath}`);
        }

        const data: RanklePuzzle = await response.json();

        if (!data.items || !Array.isArray(data.items)) {
          throw new Error(`Puzzle data from ${apiPath} is missing items.`);
        }

        if (!data.answer || !Array.isArray(data.answer)) {
          throw new Error(`Puzzle data from ${apiPath} is missing answer.`);
        }

        const storageKey = `${storagePrefix}-${data.date}`;
        const savedGame = localStorage.getItem(storageKey);

        setPuzzle(data);

        if (savedGame) {
          try {
            const parsed: SavedGame = JSON.parse(savedGame);

            const restoredItems = Array.isArray(parsed.itemOrder)
              ? parsed.itemOrder
                  .map((id) => data.items.find((item) => item.id === id))
                  .filter((item): item is RankleItem => item !== undefined)
              : [];

            setItems(restoredItems.length === 5 ? restoredItems : data.items);
            setGuesses(Array.isArray(parsed.guesses) ? parsed.guesses : []);
            setMessage(parsed.message || "");
            setGameOver(Boolean(parsed.gameOver));
            setWon(Boolean(parsed.won));
          } catch {
            localStorage.removeItem(storageKey);
            setItems(data.items);
            setGuesses([]);
            setMessage("");
            setGameOver(false);
            setWon(false);
          }
        } else {
          setItems(data.items);
        }

        setLoaded(true);
      } catch (error) {
        console.error(error);
        setLoadError("This game could not load. Please try again later.");
        setLoaded(true);
      }
    }

    loadPuzzle();
  }, [apiPath, storagePrefix]);
  useEffect(() => {
    function updateCountdown() {
      const now = new Date();

      const tomorrowUtc = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1,
          0,
          0,
          0
        )
      );

      const diff = tomorrowUtc.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeUntilNextPuzzle(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}:${String(seconds).padStart(2, "0")}`
      );
    }

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!puzzle || !loaded || items.length !== 5 || loadError) return;

    const storageKey = `${storagePrefix}-${puzzle.date}`;

    const savedGame: SavedGame = {
      itemOrder: items.map((item) => item.id),
      guesses,
      message,
      gameOver,
      won,
    };

    localStorage.setItem(storageKey, JSON.stringify(savedGame));
  }, [
    puzzle,
    items,
    guesses,
    message,
    gameOver,
    won,
    loaded,
    storagePrefix,
    loadError,
  ]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id || gameOver) return;

    setItems((currentItems) => {
      const oldIndex = currentItems.findIndex((item) => item.id === active.id);
      const newIndex = currentItems.findIndex((item) => item.id === over.id);

      return arrayMove(currentItems, oldIndex, newIndex);
    });
  }

  function playWinConfetti() {
    if (!animationsEnabled) return;

    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 100,
        origin: { y: 0.55 },
      });
    }, 250);
  }

  function playLoseSound() {
    if (!soundEnabled) return;

    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();

    function playTone(
      frequency: number,
      startTime: number,
      duration: number,
      type: OscillatorType = "sine"
    ) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(
        frequency,
        audioContext.currentTime + startTime
      );

      gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime + startTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.22,
        audioContext.currentTime + startTime + 0.03
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + startTime + duration
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + duration);
    }

    playTone(180, 0, 0.35, "sawtooth");
    playTone(125, 0.38, 0.45, "sawtooth");
  }

  const getDefaultStats = useCallback((): RankleStats => {
    return {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      currentStreak: 0,
      bestStreak: 0,
      perfectGames: 0,
      guessDistribution: {
        one: 0,
        two: 0,
        three: 0,
      },
    };
  }, []);

  const getStatsKey = useCallback(() => {
    return `${storagePrefix}-stats`;
  }, [storagePrefix]);

  function getDayDifference(previousDate: string, currentDate: string) {
    const previous = new Date(`${previousDate}T00:00:00.000Z`);
    const current = new Date(`${currentDate}T00:00:00.000Z`);

    return Math.round(
      (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  function getDefaultAchievementStats(): AchievementStats {
    return {
      winsByTheme: {
        movies: 0,
        games: 0,
        music: 0,
        mystery: 0,
        sports: 0,
        dailyChallenge: 0,
      },
      currentStreak: 0,
      bestStreak: 0,
      perfectGames: 0,
    };
  }

  function getAchievementStatsKey() {
    return "rankle-achievements";
  }

  function getAchievementCategoryKey():
    | "movies"
    | "games"
    | "music"
    | "mystery"
    | "sports"
    | "dailyChallenge" {
    if (storagePrefix === "rankle-daily-challenge") {
      return "dailyChallenge";
    }

    return theme;
  }

  function loadAchievementStats() {
    const savedStats = localStorage.getItem(getAchievementStatsKey());

    if (!savedStats) {
      const defaultStats = getDefaultAchievementStats();
      setAchievementStats(defaultStats);
      return defaultStats;
    }

    try {
      const parsedStats = JSON.parse(savedStats) as AchievementStats;
      const defaultStats = getDefaultAchievementStats();
      const normalizedStats: AchievementStats = {
        ...defaultStats,
        ...parsedStats,
        winsByTheme: {
          ...defaultStats.winsByTheme,
          ...parsedStats.winsByTheme,
        },
      };

      if (
        JSON.stringify(normalizedStats) !== JSON.stringify(parsedStats)
      ) {
        localStorage.setItem(
          getAchievementStatsKey(),
          JSON.stringify(normalizedStats)
        );
      }

      setAchievementStats(normalizedStats);
      return normalizedStats;
    } catch {
      const defaultStats = getDefaultAchievementStats();
      localStorage.setItem(
        getAchievementStatsKey(),
        JSON.stringify(defaultStats)
      );
      setAchievementStats(defaultStats);
      return defaultStats;
    }
  }

  function recordAchievementWin(guessCount: number) {
    if (!puzzle) return;

    const currentStats = loadAchievementStats();
    const beforeAchievements = getAchievements(currentStats);

    const achievementCategoryKey = getAchievementCategoryKey();

    const nextWinsByTheme = {
      ...currentStats.winsByTheme,
      [achievementCategoryKey]:
        currentStats.winsByTheme[achievementCategoryKey] + 1,
    };

    let nextCurrentStreak = currentStats.currentStreak;

    if (!currentStats.lastWinDate) {
      nextCurrentStreak = 1;
    } else if (currentStats.lastWinDate === puzzle.date) {
      nextCurrentStreak = currentStats.currentStreak;
    } else {
      const dayDifference = getDayDifference(
        currentStats.lastWinDate,
        puzzle.date
      );

      nextCurrentStreak =
        dayDifference === 1 ? currentStats.currentStreak + 1 : 1;
    }

    const updatedStats: AchievementStats = {
      winsByTheme: nextWinsByTheme,
      currentStreak: nextCurrentStreak,
      bestStreak: Math.max(currentStats.bestStreak, nextCurrentStreak),
      perfectGames: currentStats.perfectGames + (guessCount === 1 ? 1 : 0),
      lastWinDate: puzzle.date,
    };

    const afterAchievements = getAchievements(updatedStats);

    const unlockedNow = afterAchievements.filter((afterAchievement) => {
      const beforeAchievement = beforeAchievements.find(
        (achievement) => achievement.name === afterAchievement.name
      );

      return afterAchievement.unlocked && !beforeAchievement?.unlocked;
    });

    localStorage.setItem(
      getAchievementStatsKey(),
      JSON.stringify(updatedStats)
    );
    setAchievementStats(updatedStats);

    if (unlockedNow.length > 0) {
      setNewAchievements(unlockedNow);
      setShowAchievementUnlockedModal(true);
    }
  }

  function getAchievements(statsData: AchievementStats | null): Achievement[] {
    const stats = statsData || getDefaultAchievementStats();

    return [
      {
        emoji: "🎬",
        name: "Movie Buff",
        description: "Win 5 Movie puzzles.",
        unlocked: stats.winsByTheme.movies >= 5,
        progress: `${Math.min(stats.winsByTheme.movies, 5)}/5`,
      },
      {
        emoji: "🎮",
        name: "Controller King",
        description: "Win 5 Video Game puzzles.",
        unlocked: stats.winsByTheme.games >= 5,
        progress: `${Math.min(stats.winsByTheme.games, 5)}/5`,
      },
      {
        emoji: "🎵",
        name: "Album Expert",
        description: "Win 5 Music puzzles.",
        unlocked: stats.winsByTheme.music >= 5,
        progress: `${Math.min(stats.winsByTheme.music, 5)}/5`,
      },
      {
        emoji: "❓",
        name: "Mystery Solver",
        description: "Win a Mystery Rankle puzzle.",
        unlocked: stats.winsByTheme.mystery >= 1,
        progress: `${Math.min(stats.winsByTheme.mystery, 1)}/1`,
      },
      {
        emoji: "\u{1F3C6}",
        name: "Sports Rookie",
        description: "Win your first Sports Teams puzzle.",
        unlocked: stats.winsByTheme.sports >= 1,
        progress: `${Math.min(stats.winsByTheme.sports, 1)}/1`,
      },
      {
        emoji: "\u{1F3DF}\uFE0F",
        name: "Franchise Fan",
        description: "Win 5 Sports Teams puzzles.",
        unlocked: stats.winsByTheme.sports >= 5,
        progress: `${Math.min(stats.winsByTheme.sports, 5)}/5`,
      },
      {
        emoji: "\u{1F947}",
        name: "Sports Historian",
        description: "Win 10 Sports Teams puzzles.",
        unlocked: stats.winsByTheme.sports >= 10,
        progress: `${Math.min(stats.winsByTheme.sports, 10)}/10`,
      },
      {
        emoji: "\u{1F31F}",
        name: "Daily Challenger",
        description: "Win your first Hard Daily Challenge.",
        unlocked: stats.winsByTheme.dailyChallenge >= 1,
        progress: `${Math.min(stats.winsByTheme.dailyChallenge, 1)}/1`,
      },
      {
        emoji: "\u{1F9E0}",
        name: "No Hints Needed",
        description: "Win 5 Hard Daily Challenges.",
        unlocked: stats.winsByTheme.dailyChallenge >= 5,
        progress: `${Math.min(stats.winsByTheme.dailyChallenge, 5)}/5`,
      },
      {
        emoji: "\u{1F480}",
        name: "Hard Mode Hero",
        description: "Win 10 Hard Daily Challenges.",
        unlocked: stats.winsByTheme.dailyChallenge >= 10,
        progress: `${Math.min(stats.winsByTheme.dailyChallenge, 10)}/10`,
      },
      {
        emoji: "🔥",
        name: "Streak Master",
        description: "Reach a 7-day winning streak.",
        unlocked: stats.bestStreak >= 7,
        progress: `${Math.min(stats.bestStreak, 7)}/7`,
      },
      {
        emoji: "🏆",
        name: "Perfect Rankler",
        description: "Solve any puzzle in 1 guess.",
        unlocked: stats.perfectGames >= 1,
        progress: `${Math.min(stats.perfectGames, 1)}/1`,
      },
    ];
  }

  const loadStats = useCallback(() => {
    const savedStats = localStorage.getItem(getStatsKey());

    if (!savedStats) {
      const defaultStats = getDefaultStats();
      setStats(defaultStats);
      return defaultStats;
    }

    try {
      const parsedStats = JSON.parse(savedStats) as RankleStats;
      setStats(parsedStats);
      return parsedStats;
    } catch {
      const defaultStats = getDefaultStats();
      localStorage.setItem(getStatsKey(), JSON.stringify(defaultStats));
      setStats(defaultStats);
      return defaultStats;
    }
  }, [getDefaultStats, getStatsKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAchievementStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const savedSoundSetting = localStorage.getItem("rankle-sound-enabled");

    if (savedSoundSetting === "false") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSoundEnabled(false);
    }
  }, []);

  useEffect(() => {
    const savedAnimationSetting = localStorage.getItem(
      "rankle-animations-enabled"
    );

    if (savedAnimationSetting === "false") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnimationsEnabled(false);
    }
  }, []);

  useEffect(() => {
    const savedNickname = localStorage.getItem("rankle-nickname");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNickname(savedNickname || "");
  }, []);

  function recordGameResult(didWin: boolean, guessCount: number) {
    if (!puzzle) return;

    const currentStats = loadStats();

    // Prevent the same daily puzzle from counting more than once.
    if (currentStats.lastPlayedDate === puzzle.date) {
      return;
    }

    let newCurrentStreak = currentStats.currentStreak;

    if (didWin) {
      const dayDifference = currentStats.lastPlayedDate
        ? getDayDifference(currentStats.lastPlayedDate, puzzle.date)
        : null;

      newCurrentStreak =
        dayDifference === 1 ? currentStats.currentStreak + 1 : 1;
    } else {
      newCurrentStreak = 0;
    }

    const updatedStats: RankleStats = {
      gamesPlayed: currentStats.gamesPlayed + 1,
      wins: currentStats.wins + (didWin ? 1 : 0),
      losses: currentStats.losses + (didWin ? 0 : 1),
      currentStreak: newCurrentStreak,
      bestStreak: Math.max(currentStats.bestStreak, newCurrentStreak),
      perfectGames:
        currentStats.perfectGames + (didWin && guessCount === 1 ? 1 : 0),
      guessDistribution: {
        one:
          currentStats.guessDistribution.one +
          (didWin && guessCount === 1 ? 1 : 0),
        two:
          currentStats.guessDistribution.two +
          (didWin && guessCount === 2 ? 1 : 0),
        three:
          currentStats.guessDistribution.three +
          (didWin && guessCount === 3 ? 1 : 0),
      },
      lastPlayedDate: puzzle.date,
    };

    localStorage.setItem(getStatsKey(), JSON.stringify(updatedStats));
    setStats(updatedStats);
  }

  function checkGuess() {
    if (!puzzle || gameOver) return;

    const answerIds = puzzle.answer.map((item) => item.id);
    const guessIds = items.map((item) => item.id);

    const correctCount = guessIds.filter(
      (id, index) => answerIds[index] === id
    ).length;

    const feedback = [`${correctCount}/5 correct`];

    const newGuesses = [...guesses, feedback];
    setGuesses(newGuesses);

    const solved = correctCount === 5;

    if (solved) {
      setWon(true);
      setGameOver(true);
      setMessage(`Solved in ${newGuesses.length}/3. Nice work.`);
      recordGameResult(true, newGuesses.length);
      recordAchievementWin(newGuesses.length);
      setShowFinalModal(true);
      playWinConfetti();
      return;
    }

    if (newGuesses.length >= 3) {
      setWon(false);
      setGameOver(true);
      setMessage("Revealing the correct order...");
      recordGameResult(false, newGuesses.length);
      playLoseSound();
      setIsRevealingAnswer(true);

      const orderedItems = puzzle.answer
        .map((answerItem) =>
          puzzle.items.find((item) => item.id === answerItem.id)
        )
        .filter((item): item is RankleItem => item !== undefined);

      setTimeout(() => {
        setItems(orderedItems);
        setMessage("Game over. Here is the correct order.");

        setTimeout(() => {
          setIsRevealingAnswer(false);
          setShowFinalModal(true);
        }, 650);
      }, 500);

      return;
    }

    setMessage(`You got ${correctCount}/5 correct. Try again.`);
  }

  function resetToday() {
    if (!puzzle) return;

    localStorage.removeItem(`${storagePrefix}-${puzzle.date}`);
    setItems(puzzle.items);
    setGuesses([]);
    setMessage("");
    setGameOver(false);
    setWon(false);
    setIsRevealingAnswer(false);
    setShowFinalModal(false);
  }

  function getPuzzleNumber() {
    if (!puzzle) return 1;

    const launchDate = new Date("2026-05-06T00:00:00.000Z");
    const puzzleDate = new Date(`${puzzle.date}T00:00:00.000Z`);

    const differenceInDays = Math.floor(
      (puzzleDate.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.max(differenceInDays + 1, 1);
  }

  function getGameEmoji() {
    if (theme === "movies") return "\u{1F3AC}";
    if (theme === "games") return "\u{1F3AE}";
    if (theme === "music") return "\u{1F3B5}";
    if (theme === "mystery") return "\u2753";
    if (theme === "sports") return "\u{1F3C6}";

    return "\u{1F3C6}";
  }

  function getPlayerName() {
    return nickname.trim() || "You";
  }

  function getRankleIQ() {
    if (!puzzle || guesses.length === 0) return 0;

    const bestCorrectCount = Math.max(
      ...guesses.map((guess) => {
        const match = guess[0]?.match(/(\d+)\/5/);
        return match ? Number(match[1]) : 0;
      })
    );

    let score = 0;

    if (won) {
      if (guesses.length === 1) score = 1000;
      if (guesses.length === 2) score = 850;
      if (guesses.length === 3) score = 700;
    } else {
      score = bestCorrectCount * 100;
    }

    if (storagePrefix === "rankle-daily-challenge") {
      score += 100;
    }

    if (won && guesses.length === 1) {
      score += 50;
    }

    return Math.min(score, 1100);
  }

  function getEndGameRecap() {
    if (!puzzle || guesses.length === 0) return null;

    const bestGuess = guesses.reduce(
      (best, current, index) => {
        const match = current[0]?.match(/(\d+)\/5/);
        const correctCount = match ? Number(match[1]) : 0;

        if (correctCount > best.correctCount) {
          return {
            guessNumber: index + 1,
            correctCount,
          };
        }

        return best;
      },
      {
        guessNumber: 1,
        correctCount: 0,
      }
    );

    const oldestItem = puzzle.answer[0];
    const newestItem = puzzle.answer[puzzle.answer.length - 1];

    const oldestYear = oldestItem.releaseDate.slice(0, 4);
    const newestYear = newestItem.releaseDate.slice(0, 4);
    const yearRange = Number(newestYear) - Number(oldestYear);

    return {
      bestGuess,
      oldestItem,
      newestItem,
      oldestYear,
      newestYear,
      yearRange,
    };
  }

  function shareResult() {
    if (!puzzle) return;

    const puzzleNumber = getPuzzleNumber();

    const resultText = [
      `${getGameEmoji()} ${puzzle.title} #${puzzleNumber}`,
      `${getPlayerName()} ${won ? "solved it" : "did not solve it"}`,
      won ? `✅ Solved in ${guesses.length}/3` : "❌ Failed",
      `🧠 Rankle IQ: ${getRankleIQ()}`,
      "",
      ...guesses.map((row, index) => `Guess ${index + 1}: ${row[0]}`),
      "",
      `Next puzzle in ${timeUntilNextPuzzle}`,
      "",
      "Play Rankle Games:",
      "https://ranklegames.com",
    ].join("\n");

    navigator.clipboard.writeText(resultText);
    setMessage("Result copied to clipboard.");
  }

  function getLoadingMessage() {
    if (theme === "movies") {
      return {
        emoji: "🎬",
        title: "Rolling the reels...",
        text: "Building today's movie puzzle.",
      };
    }

    if (theme === "games") {
      return {
        emoji: "🎮",
        title: "Booting up...",
        text: "Loading today's video game challenge.",
      };
    }

    if (theme === "music") {
      return {
        emoji: "🎵",
        title: "Tuning the albums...",
        text: "Pulling today's music puzzle.",
      };
    }

    if (theme === "mystery") {
      return {
        emoji: "❓",
        title: "Mixing the mystery...",
        text: "Combining movies, games, and music.",
      };
    }

    if (theme === "sports") {
      return {
        emoji: "\u{1F3C6}",
        title: "Warming up...",
        text: "Loading today's sports team puzzle.",
      };
    }

    return {
      emoji: "🏆",
      title: "Loading...",
      text: "Getting today's game ready.",
    };
  }

  const loadingMessage = getLoadingMessage();

  const loadingContent = (
    <div
      className={`rounded-3xl border ${themeClasses.border} ${themeClasses.panel} p-8 text-center shadow-lg ${themeClasses.glow}`}
    >
      <div
        className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${themeClasses.accentSoft} text-4xl ring-1 ${themeClasses.accentBorder}`}
      >
        {loadingMessage.emoji}
      </div>

      <div
        className={`mb-3 text-sm font-black uppercase tracking-[0.35em] ${themeClasses.accentText}`}
      >
        Rankle Games
      </div>

      <h1 className="text-4xl font-black text-slate-950">
        {loadingMessage.title}
      </h1>

      <p className="mt-3 text-slate-600">{loadingMessage.text}</p>

      <div className="mx-auto mt-6 flex w-40 justify-center gap-2">
        <span
          className={`h-3 w-3 animate-bounce rounded-full ${themeClasses.accentSoft}`}
        />
        <span
          className={`h-3 w-3 animate-bounce rounded-full ${themeClasses.accentSoft} [animation-delay:120ms]`}
        />
        <span
          className={`h-3 w-3 animate-bounce rounded-full ${themeClasses.accentSoft} [animation-delay:240ms]`}
        />
      </div>
    </div>
  );

  const errorContent = (
    <div
      className={`rounded-3xl border ${themeClasses.border} ${themeClasses.panel} p-8 text-center shadow-lg ${themeClasses.glow}`}
    >
      <div
        className={`mb-3 text-sm font-black uppercase tracking-[0.35em] ${themeClasses.accentText}`}
      >
        Rankle Games
      </div>

      <h1 className="text-4xl font-black text-slate-950">Could Not Load</h1>

      <p className="mt-4 text-slate-600">{loadError}</p>

      <button
        onClick={() => window.location.reload()}
        className={`mt-6 rounded-2xl ${themeClasses.button} px-5 py-3 font-black ${themeClasses.buttonText} shadow-md transition active:scale-[0.99]`}
      >
        Try Again
      </button>
    </div>
  );

  if (!loaded || (!puzzle && !loadError)) {
    if (embedded) {
      return <div>{loadingContent}</div>;
    }

    return (
      <main className={`min-h-screen ${themeClasses.pageBg} text-slate-900`}>
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center p-6 text-center">
          {loadingContent}
        </div>
      </main>
    );
  }

  if (loadError) {
    if (embedded) {
      return <div>{errorContent}</div>;
    }

    return (
      <main className={`min-h-screen ${themeClasses.pageBg} text-slate-900`}>
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center p-6 text-center">
          {errorContent}
        </div>
      </main>
    );
  }

  if (!puzzle) return null;

  const puzzleNumber = getPuzzleNumber();
  const rankleIQ = getRankleIQ();
  const endGameRecap = getEndGameRecap();

  const finalScore =
  guesses.length > 0 ? guesses[guesses.length - 1]?.[0] || "0/5 correct" : "0/5 correct";

const finalModal = showFinalModal && puzzle && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
    <div
      className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border ${themeClasses.border} ${themeClasses.panel} p-6 text-center shadow-2xl`}
    >
      <div
        className={`mx-auto mb-4 inline-flex rounded-full border ${themeClasses.accentBorder} ${themeClasses.accentPill} px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${themeClasses.accentText}`}
      >
        Final Results
      </div>

      {nickname && (
        <div className="mb-3 text-sm font-black text-slate-500">
          Player: <span className={themeClasses.accentText}>{nickname}</span>
        </div>
      )}

      <h2 className="text-4xl font-black text-slate-950 md:text-5xl">
        {won
          ? `${getPlayerName()} solved it!`
          : `${getPlayerName()} reached game over`}
      </h2>

      <p className="mt-3 text-base font-bold text-slate-700">
        {puzzle.title} #{puzzleNumber}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-600">
        {won
          ? `Solved in ${guesses.length}/3 guesses.`
          : "You used all 3 guesses."}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <div className={`rounded-2xl ${themeClasses.card} p-4`}>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Result
          </div>
          <div className={`mt-2 text-2xl font-black ${themeClasses.accentText}`}>
            {won ? "Win" : "Loss"}
          </div>
        </div>

        <div className={`rounded-2xl ${themeClasses.card} p-4`}>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Guesses
          </div>
          <div className={`mt-2 text-2xl font-black ${themeClasses.accentText}`}>
            {guesses.length}/3
          </div>
        </div>

        <div className={`rounded-2xl ${themeClasses.card} p-4`}>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Final Score
          </div>
          <div className={`mt-2 text-2xl font-black ${themeClasses.accentText}`}>
            {finalScore.replace(" correct", "")}
          </div>
        </div>

        <div className={`rounded-2xl ${themeClasses.card} p-4`}>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Rankle IQ
          </div>
          <div className={`mt-2 text-2xl font-black ${themeClasses.accentText}`}>
            {rankleIQ}
          </div>
        </div>
      </div>

      {endGameRecap && (
        <div className={`mt-5 rounded-2xl ${themeClasses.card} p-4`}>
          <h3 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-slate-500">
            Game Recap
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className={`${themeClasses.panel} rounded-xl p-3 text-left`}>
              <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Best Guess
              </div>
              <div className={`mt-1 text-lg font-black ${themeClasses.accentText}`}>
                Guess {endGameRecap.bestGuess.guessNumber}:{" "}
                {endGameRecap.bestGuess.correctCount}/5
              </div>
            </div>

            <div className={`${themeClasses.panel} rounded-xl p-3 text-left`}>
              <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Year Range
              </div>
              <div className={`mt-1 text-lg font-black ${themeClasses.accentText}`}>
                {endGameRecap.yearRange} years
              </div>
            </div>

            <div className={`${themeClasses.panel} rounded-xl p-3 text-left`}>
              <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Oldest Item
              </div>
              <div className="mt-1 text-sm font-bold text-slate-700">
                {endGameRecap.oldestItem.title} - {endGameRecap.oldestYear}
              </div>
            </div>

            <div className={`${themeClasses.panel} rounded-xl p-3 text-left`}>
              <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Newest Item
              </div>
              <div className="mt-1 text-sm font-bold text-slate-700">
                {endGameRecap.newestItem.title} - {endGameRecap.newestYear}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`mt-5 rounded-2xl ${themeClasses.card} p-4`}>
        <h3 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-slate-500">
          Guess History
        </h3>

        <div className="space-y-2">
          {guesses.map((guess, index) => (
            <div
              key={index}
              className={`flex items-center justify-between rounded-xl ${themeClasses.panel} p-3 text-sm font-black text-slate-700`}
            >
              <span>Guess {index + 1}</span>
              <span className={themeClasses.accentText}>{guess[0]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`mt-5 rounded-2xl ${themeClasses.card} p-4 text-left`}>
        <h3 className="mb-3 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-500">
          Correct Order
        </h3>

        <ol className="space-y-2">
          {puzzle.answer.map((item, index) => (
            <li
              key={item.id}
              className={`flex items-center justify-between gap-3 rounded-xl ${themeClasses.panel} p-3 text-sm`}
            >
              <span className="min-w-0 font-bold text-slate-800">
                <span className="mr-2 text-slate-500">{index + 1}.</span>
                {item.title}
              </span>

              <span
                className={`shrink-0 rounded-full ${themeClasses.accentPill} px-3 py-1 text-xs font-black ${themeClasses.accentText}`}
              >
                {item.releaseDate.slice(0, 4)}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className={`mt-5 rounded-2xl ${themeClasses.card} p-4`}>
        <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
          Next Puzzle
        </div>
        <div className={`mt-1 text-2xl font-black ${themeClasses.accentText}`}>
          {timeUntilNextPuzzle}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => setShowFinalModal(false)}
          className={`rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-4 font-black text-slate-700 transition hover:text-slate-950`}
        >
          View Board
        </button>

        <button
          onClick={shareResult}
          className={`rounded-2xl ${themeClasses.button} p-4 font-black ${themeClasses.buttonText} shadow-lg transition active:scale-[0.99]`}
        >
          Share Result
        </button>
      </div>
    </div>
  </div>
);

const winRate =
  stats && stats.gamesPlayed > 0
    ? Math.round((stats.wins / stats.gamesPlayed) * 100)
    : 0;

const statsModal = showStatsModal && stats && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
    <div
      className={`w-full max-w-lg rounded-[2rem] border ${themeClasses.border} ${themeClasses.panel} p-6 text-center shadow-2xl`}
    >
      <div
        className={`mx-auto mb-4 inline-flex rounded-full border ${themeClasses.accentBorder} ${themeClasses.accentPill} px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${themeClasses.accentText}`}
      >
        Stats
      </div>

      <h2 className="text-4xl font-black text-slate-950">Your Stats</h2>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={`rounded-2xl ${themeClasses.card} p-4`}>
          <div className={`text-3xl font-black ${themeClasses.accentText}`}>
            {stats.gamesPlayed}
          </div>
          <div className="mt-1 text-xs font-bold text-slate-500">Played</div>
        </div>

        <div className={`rounded-2xl ${themeClasses.card} p-4`}>
          <div className={`text-3xl font-black ${themeClasses.accentText}`}>
            {winRate}%
          </div>
          <div className="mt-1 text-xs font-bold text-slate-500">Win Rate</div>
        </div>

        <div className={`rounded-2xl ${themeClasses.card} p-4`}>
          <div className={`text-3xl font-black ${themeClasses.accentText}`}>
            {stats.currentStreak}
          </div>
          <div className="mt-1 text-xs font-bold text-slate-500">
            Current Streak
          </div>
        </div>

        <div className={`rounded-2xl ${themeClasses.card} p-4`}>
          <div className={`text-3xl font-black ${themeClasses.accentText}`}>
            {stats.bestStreak}
          </div>
          <div className="mt-1 text-xs font-bold text-slate-500">
            Best Streak
          </div>
        </div>
      </div>

      <div className={`mt-5 rounded-2xl ${themeClasses.card} p-4`}>
        <h3 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-slate-500">
          Guess Distribution
        </h3>

        <div className="space-y-2 text-left">
          <div className={`rounded-xl ${themeClasses.panel} p-3 font-black`}>
            1 Guess: {stats.guessDistribution.one}
          </div>

          <div className={`rounded-xl ${themeClasses.panel} p-3 font-black`}>
            2 Guesses: {stats.guessDistribution.two}
          </div>

          <div className={`rounded-xl ${themeClasses.panel} p-3 font-black`}>
            3 Guesses: {stats.guessDistribution.three}
          </div>
        </div>
      </div>

      <div className={`mt-5 rounded-2xl ${themeClasses.card} p-4`}>
        <div className="text-sm font-bold text-slate-700">
          Perfect Games:{" "}
          <span className={themeClasses.accentText}>{stats.perfectGames}</span>
        </div>
      </div>

      <button
        onClick={() => setShowStatsModal(false)}
        className={`mt-6 w-full rounded-2xl ${themeClasses.button} p-4 font-black ${themeClasses.buttonText} shadow-lg transition active:scale-[0.99]`}
      >
        Close
      </button>
    </div>
  </div>
);

const achievements = getAchievements(achievementStats);

const achievementsModal = showAchievementsModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
    <div
      className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border ${themeClasses.border} ${themeClasses.panel} p-6 text-center shadow-2xl`}
    >
      <div
        className={`mx-auto mb-4 inline-flex rounded-full border ${themeClasses.accentBorder} ${themeClasses.accentPill} px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${themeClasses.accentText}`}
      >
        Achievements
      </div>

      <h2 className="text-4xl font-black text-slate-950">Your Badges</h2>

      <p className="mx-auto mt-3 max-w-xl text-sm font-semibold text-slate-600">
        Unlock badges by winning puzzles, building streaks, and solving games
        perfectly.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {achievements.map((achievement) => (
          <div
            key={achievement.name}
            className={`rounded-2xl border ${themeClasses.border} ${
              achievement.unlocked ? themeClasses.accentPill : themeClasses.card
            } p-5 text-center`}
          >
            <div className="text-5xl">
              {achievement.unlocked ? achievement.emoji : "🔒"}
            </div>

            <h3 className="mt-3 text-xl font-black text-slate-950">
              {achievement.name}
            </h3>

            <p className="mt-2 text-sm font-semibold text-slate-600">
              {achievement.description}
            </p>

            <div
              className={`mt-4 inline-flex rounded-full border ${themeClasses.accentBorder} ${themeClasses.panel} px-3 py-1 text-xs font-black ${themeClasses.accentText}`}
            >
              {achievement.unlocked
                ? "Unlocked"
                : `Progress ${achievement.progress}`}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowAchievementsModal(false)}
        className={`mt-6 w-full rounded-2xl ${themeClasses.button} p-4 font-black ${themeClasses.buttonText} shadow-lg transition active:scale-[0.99]`}
      >
        Close
      </button>
    </div>
  </div>
);

const achievementUnlockedModal =
  showAchievementUnlockedModal &&
  newAchievements.length > 0 && (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-[2rem] border ${themeClasses.border} ${themeClasses.panel} p-6 text-center shadow-2xl`}
      >
        <div
          className={`mx-auto mb-4 inline-flex rounded-full border ${themeClasses.accentBorder} ${themeClasses.accentPill} px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${themeClasses.accentText}`}
        >
          Achievement Unlocked
        </div>

        <div className="space-y-4">
          {newAchievements.map((achievement) => (
            <div
              key={achievement.name}
              className={`rounded-2xl border ${themeClasses.accentBorder} ${themeClasses.accentPill} p-5`}
            >
              <div className="text-6xl">{achievement.emoji}</div>

              <h2 className="mt-3 text-3xl font-black text-slate-950">
                {achievement.name}
              </h2>

              <p className="mt-2 text-sm font-bold text-slate-700">
                {achievement.description}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setShowAchievementUnlockedModal(false);
            setNewAchievements([]);
          }}
          className={`mt-6 w-full rounded-2xl ${themeClasses.button} p-4 font-black ${themeClasses.buttonText} shadow-lg transition active:scale-[0.99]`}
        >
          Awesome
        </button>
      </div>
    </div>
  );

  const gameContent = (
    <div
      className={
        embedded
          ? "w-full pb-24 lg:pb-0"
          : "relative mx-auto max-w-7xl px-5 py-6 pb-24 lg:pb-6"
      }
    >
      <header
        className={`mb-5 rounded-[2rem] border ${themeClasses.border} ${themeClasses.panel} p-3 text-center shadow-[0_10px_30px_rgba(15,23,42,0.08)] xl:p-4`}
      >
        <div
          className="text-xs font-black uppercase tracking-[0.35em] text-slate-700"
        >
          Rankle Games
        </div>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 xl:text-4xl">
          {puzzle.title} #{puzzleNumber}
        </h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          {puzzle.date}
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_380px] lg:items-start">
        <section
          className={`rounded-[2rem] border ${themeClasses.border} ${themeClasses.panel} p-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)] xl:p-4`}
        >
          <div className="mb-4">
            <div
              className={`inline-flex rounded-full border ${themeClasses.accentBorder} ${themeClasses.accentPill} px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${themeClasses.accentText}`}
            >
              {accentLabel}
            </div>

            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 xl:text-3xl">
              Arrange the list
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-600">
              Drag the five items from oldest to newest.
            </p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {items.map((item, index) => (
                  <SortableCard
                    key={item.id}
                    item={item}
                    index={index}
                    gameOver={gameOver}
                    themeClasses={themeClasses}
                    animationsEnabled={animationsEnabled}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>

        <aside
          className={`rounded-[2rem] border ${themeClasses.border} ${themeClasses.panel} p-3 shadow-lg ${themeClasses.glow} lg:sticky lg:top-6 xl:p-4`}
        >
          <div className="mb-5">
            <div
              className={`inline-flex rounded-full border ${themeClasses.accentBorder} ${themeClasses.accentPill} px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${themeClasses.accentText}`}
            >
              How to Play
            </div>

            <h3 className="mt-3 text-xl font-black text-slate-900 xl:text-2xl">
              {puzzle.challenge}
            </h3>

            <p className="mt-3 text-sm font-semibold text-slate-600">
              You get{" "}
              <span className="font-black text-slate-900">3 guesses</span>.
            </p>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-white/60 p-3 text-center xl:p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                Next Puzzle
              </div>

              <div className="mt-2 text-3xl font-black tracking-tight text-slate-900 xl:text-4xl">
                {timeUntilNextPuzzle}
              </div>
            </div>
          </div>

          <div className="mb-5 rounded-3xl border border-slate-200 bg-white/60 p-3 text-center xl:p-4">
            <div className="text-sm font-semibold text-slate-600">
              After each guess, you will only see how many are correct.
            </div>
            <div className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
              Correct positions are not revealed.
            </div>
          </div>

          <div
            className={`mb-5 rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-3 text-center xl:p-4`}
          >
            <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Guesses Used
            </div>

            <div className="mt-3 flex justify-center gap-2">
              {[0, 1, 2].map((guessSlot) => (
                <div
                  key={guessSlot}
                  className={`h-4 w-4 rounded-full border ${
                    guessSlot < guesses.length
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-slate-300 bg-white/70"
                  }`}
                />
              ))}
            </div>

            <div className={`mt-3 text-2xl font-black ${themeClasses.accentText}`}>
              {guesses.length}/3
            </div>

            <p className="mt-1 text-xs font-bold text-slate-500">
              {3 - guesses.length} guesses remaining
            </p>
          </div>

          {!gameOver && (
            <div className="hidden lg:block">
              <button
                onClick={checkGuess}
                className={`w-full rounded-2xl ${themeClasses.button} px-5 py-4 text-lg font-black ${themeClasses.buttonText} shadow-lg transition active:scale-[0.99]`}
              >
                Submit Guess
              </button>
            </div>
          )}

          <a
            href="https://forms.gle/GdFPKPXEg82JywGZ9"
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-3 block w-full rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-3 text-center text-sm font-black text-slate-700 transition hover:text-slate-950`}
          >
            Report Issue
          </a>

          <button
            onClick={() => setShowAchievementsModal(true)}
            className={`mt-3 w-full rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-3 text-sm font-black text-slate-700 transition hover:text-slate-950`}
          >
            Achievements
          </button>

          {message && (
            <div
              className={`mt-4 rounded-2xl border-2 ${
                isRevealingAnswer
                  ? `${themeClasses.accentBorder} ${themeClasses.accentPill}`
                  : "border-emerald-400 bg-emerald-50"
              } p-4 text-center shadow-lg`}
            >
              <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                Latest Guess
              </div>

              <div className="mt-1 text-2xl font-black text-emerald-900">
                {message}
              </div>

              {!gameOver && (
                <div className="mt-1 text-sm font-bold text-slate-600">
                  Guess {guesses.length} of 3 submitted
                </div>
              )}
            </div>
          )}

          {guesses.length > 0 && (
            <div
              className={`mt-5 rounded-[1.5rem] border ${themeClasses.border} ${themeClasses.card} p-4 text-center`}
            >
              <h2 className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-slate-500">
                Guess History
              </h2>

              <div className="space-y-2">
                {guesses.map((guess, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl ${themeClasses.panel} p-3 text-sm font-black text-slate-700`}
                  >
                    Guess {index + 1}: {guess[0]}
                  </div>
                ))}
              </div>
            </div>
          )}

          {gameOver && (
            <div
              className={`mt-5 rounded-[1.5rem] border ${themeClasses.border} ${themeClasses.card} p-4`}
            >
              <h2 className="mb-4 text-xl font-black text-slate-950">
                Correct Order
              </h2>

              <ol className="mb-5 space-y-2">
                {puzzle.answer.map((item, index) => (
                  <li
                    key={item.id}
                    className={`flex items-center justify-between rounded-2xl ${themeClasses.panel} p-3`}
                  >
                    <span className="min-w-0 pr-3">
                      <span className="mr-2 text-slate-500">{index + 1}.</span>
                      <span className="font-bold text-slate-950">
                        {item.title}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full ${themeClasses.accentPill} px-3 py-1 text-sm font-black ${themeClasses.accentText}`}
                    >
                      {item.releaseDate.slice(0, 4)}
                    </span>
                  </li>
                ))}
              </ol>

              <button
                onClick={shareResult}
                className={`w-full rounded-2xl ${themeClasses.button} p-4 font-black ${themeClasses.buttonText} shadow-lg transition active:scale-[0.99]`}
              >
                Share Result
              </button>
            </div>
          )}
        </aside>
      </div>

      {!embedded && (
        <footer className="py-8 text-center text-xs text-slate-500">
          Data powered by public APIs. Rankle Games is a fan-made daily ranking
          game.
        </footer>
      )}
    </div>
  );

  const mobileSubmitButton = !gameOver && (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-300 bg-[#f7f4ec]/95 p-3 shadow-2xl backdrop-blur-md lg:hidden">
      <button
        onClick={checkGuess}
        className={`w-full rounded-2xl ${themeClasses.button} p-4 text-lg font-black ${themeClasses.buttonText} shadow-lg transition active:scale-[0.99]`}
      >
        Submit Guess
      </button>
    </div>
  );

  if (embedded) {
    return (
      <div className="text-slate-900">
        {gameContent}
        {mobileSubmitButton}
        {finalModal}
        {achievementsModal}
        {achievementUnlockedModal}
        {statsModal}
      </div>
    );
  }

  return (
    <main
      className={`min-h-screen overflow-hidden ${themeClasses.pageBg} text-slate-900`}
    >
      {gameContent}
      {mobileSubmitButton}
      {finalModal}
      {achievementsModal}
      {achievementUnlockedModal}
      {statsModal}
    </main>
  );
}
