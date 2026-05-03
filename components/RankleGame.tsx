"use client";

import { useEffect, useState } from "react";
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

type ThemeName = "movies" | "games" | "music";

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
};

function SortableCard({
  item,
  index,
  gameOver,
  themeClasses,
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
    opacity: isDragging ? 0.75 : 1,
    scale: isDragging ? "1.02" : "1",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group rounded-2xl border ${themeClasses.border} ${themeClasses.card} ${themeClasses.cardHover} p-3 shadow-md shadow-slate-300/40 transition ${
        gameOver ? "cursor-default" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${themeClasses.accentSoft} text-sm font-black ${themeClasses.accentText} ring-1 ${themeClasses.accentBorder}`}
          >
            {index + 1}
          </div>

          <img
            src={item.image}
            alt={item.title}
            className="h-[76px] w-14 shrink-0 rounded-xl object-cover shadow-md ring-1 ring-slate-300"
          />

          <div className="min-w-0">
            <div className="truncate text-base font-black text-slate-950">
              {item.title}
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-500">
              {gameOver ? "Locked" : "Drag to reorder"}
            </div>
          </div>
        </div>

        {!gameOver && (
          <div
            className={`rounded-xl border ${themeClasses.border} ${themeClasses.panel} px-3 py-2 text-slate-500 transition ${themeClasses.arrowText}`}
          >
            ☰
          </div>
        )}
      </div>
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
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [showFinalModal, setShowFinalModal] = useState(false);

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
      setShowFinalModal(true);
      playWinConfetti();
      return;
    }

    if (newGuesses.length >= 3) {
      setWon(false);
      setGameOver(true);
      setMessage("Game over. Here is the correct order.");
      setShowFinalModal(true);
      playLoseSound();

      const orderedItems = puzzle.answer
        .map((answerItem) =>
          puzzle.items.find((item) => item.id === answerItem.id)
        )
        .filter((item): item is RankleItem => item !== undefined);

      setItems(orderedItems);
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
    setShowFinalModal(false);
  }

  function shareResult() {
    if (!puzzle) return;

    const resultText = [
      `${puzzle.title} ${puzzle.date}`,
      won ? `Solved in ${guesses.length}/3` : "Failed",
      "",
      ...guesses.map((row, index) => `Guess ${index + 1}: ${row[0]}`),
      "",
      "Play at ranklegames.com",
    ].join("\n");

    navigator.clipboard.writeText(resultText);
    setMessage("Result copied to clipboard.");
  }

  const loadingContent = (
    <div
      className={`rounded-3xl border ${themeClasses.border} ${themeClasses.panel} p-8 text-center shadow-lg ${themeClasses.glow}`}
    >
      <div
        className={`mb-3 text-sm font-black uppercase tracking-[0.35em] ${themeClasses.accentText}`}
      >
        Rankle Games
      </div>
      <h1 className="text-4xl font-black text-slate-950">Loading...</h1>
      <p className="mt-3 text-slate-600">Getting today&apos;s game ready.</p>
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

  const finalModal = showFinalModal && puzzle && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`w-full max-w-md rounded-3xl border ${themeClasses.border} ${themeClasses.panel} p-6 text-center shadow-2xl`}
      >
        <div
          className={`mx-auto mb-3 inline-flex rounded-full border ${themeClasses.accentBorder} ${themeClasses.accentPill} px-3 py-1 text-xs font-black ${themeClasses.accentText}`}
        >
          Final Results
        </div>

        <h2 className="text-3xl font-black text-slate-950">
          {won ? "You solved it!" : "Game over"}
        </h2>

        <p className="mt-3 text-sm font-bold text-slate-700">
          {won
            ? `Solved in ${guesses.length}/3 guesses.`
            : "You used all 3 guesses."}
        </p>

        <div className={`mt-5 rounded-2xl ${themeClasses.card} p-4`}>
          <h3 className="mb-3 text-sm font-black text-slate-700">
            Guess History
          </h3>

          <div className="space-y-2">
            {guesses.map((guess, index) => (
              <div
                key={index}
                className={`rounded-xl ${themeClasses.panel} p-2 text-sm font-black text-slate-700`}
              >
                Guess {index + 1}: {guess[0]}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setShowFinalModal(false)}
            className={`w-full rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-3 font-black text-slate-700 transition hover:text-slate-950`}
          >
            View Board
          </button>

          <button
            onClick={shareResult}
            className={`w-full rounded-2xl ${themeClasses.button} p-3 font-black ${themeClasses.buttonText}`}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );

  const gameContent = (
    <div
      className={
        embedded ? "w-full" : "relative mx-auto max-w-6xl px-5 py-6"
      }
    >
      <header
        className={`mb-5 rounded-3xl border ${themeClasses.border} ${themeClasses.panel} px-5 py-4 text-center shadow-lg ${themeClasses.glow}`}
      >
        <div
          className={`text-xs font-black uppercase tracking-[0.32em] ${themeClasses.accentText}`}
        >
          Rankle Games
        </div>
        <h1 className="mt-1 text-4xl font-black tracking-tight text-slate-950">
          {puzzle.title}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{puzzle.date}</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        <section
          className={`rounded-[2rem] border ${themeClasses.border} ${themeClasses.panel} p-5 shadow-lg ${themeClasses.glow}`}
        >
          <div className="mb-4">
            <div
              className={`inline-flex rounded-full border ${themeClasses.accentBorder} ${themeClasses.accentPill} px-3 py-1 text-xs font-bold ${themeClasses.accentText}`}
            >
              {accentLabel}
            </div>

            <h2 className="mt-3 text-2xl font-black text-slate-950">
              Arrange the list
            </h2>

            <p className="mt-1 text-sm text-slate-600">
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
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>

        <aside
          className={`rounded-[2rem] border ${themeClasses.border} ${themeClasses.panel} p-5 shadow-lg ${themeClasses.glow}`}
        >
          <div className="mb-5 text-center">
            <div
              className={`mx-auto mb-3 inline-flex rounded-full border ${themeClasses.accentBorder} ${themeClasses.accentPill} px-3 py-1 text-xs font-bold ${themeClasses.accentText}`}
            >
              How to Play
            </div>

            <p className="text-xl font-black leading-tight text-slate-950">
              {puzzle.challenge}
            </p>

            <p className="mt-3 text-sm text-slate-600">
              You get{" "}
              <span className="font-black text-slate-950">3 guesses</span>.
            </p>
          </div>

          <div className={`mb-5 rounded-2xl ${themeClasses.card} p-4 text-center`}>
            <div className="text-sm font-bold text-slate-700">
              After each guess, you will only see how many are correct.
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Correct positions are not revealed.
            </div>
          </div>

          {!gameOver && (
            <button
              onClick={checkGuess}
              className={`w-full rounded-2xl ${themeClasses.button} p-4 text-lg font-black ${themeClasses.buttonText} shadow-lg transition active:scale-[0.99]`}
            >
              Submit Guess
            </button>
          )}

          <button
            onClick={resetToday}
            className={`mt-3 w-full rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-3 text-sm font-black text-slate-700 transition hover:text-slate-950`}
          >
            Reset
          </button>

          {message && (
            <p
              className={`mt-4 rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-3 text-center text-sm font-bold text-slate-700`}
            >
              {message}
            </p>
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

  if (embedded) {
    return (
      <div className="text-slate-900">
        {gameContent}
        {finalModal}
      </div>
    );
  }

  return (
    <main
      className={`min-h-screen overflow-hidden ${themeClasses.pageBg} text-slate-900`}
    >
      {gameContent}
      {finalModal}
    </main>
  );
}