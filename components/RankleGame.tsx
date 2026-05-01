"use client";

import { useEffect, useState } from "react";
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
};

type SortableCardProps = {
  item: RankleItem;
  index: number;
  gameOver: boolean;
};

function SortableCard({ item, index, gameOver }: SortableCardProps) {
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
    opacity: isDragging ? 0.72 : 1,
    scale: isDragging ? "1.02" : "1",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group rounded-2xl border border-white/10 bg-white/[0.055] p-3 shadow-lg backdrop-blur-sm transition hover:bg-white/[0.075] ${
        gameOver ? "cursor-default" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-sm font-black text-emerald-300 ring-1 ring-emerald-400/20">
            {index + 1}
          </div>

          <img
            src={item.image}
            alt={item.title}
            className="h-[72px] w-12 shrink-0 rounded-xl object-cover shadow-md ring-1 ring-white/10"
          />

          <div className="min-w-0">
            <div className="truncate text-base font-bold text-white">
              {item.title}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              {gameOver ? "Locked" : "Drag to reorder"}
            </div>
          </div>
        </div>

        {!gameOver && (
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-zinc-500 transition group-hover:text-zinc-300">
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
}: RankleGameProps) {
  const [puzzle, setPuzzle] = useState<RanklePuzzle | null>(null);
  const [items, setItems] = useState<RankleItem[]>([]);
  const [guesses, setGuesses] = useState<string[][]>([]);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
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

  function checkGuess() {
    if (!puzzle || gameOver) return;

    const answerIds = puzzle.answer.map((item) => item.id);
    const guessIds = items.map((item) => item.id);

    const feedback = guessIds.map((id, index) => {
      const correctIndex = answerIds.indexOf(id);

      if (correctIndex === index) return "🟩";
      if (Math.abs(correctIndex - index) === 1) return "🟨";
      return "⬛";
    });

    const newGuesses = [...guesses, feedback];
    setGuesses(newGuesses);

    const solved = feedback.every((square) => square === "🟩");

    if (solved) {
      setWon(true);
      setGameOver(true);
      setMessage(`Solved in ${newGuesses.length}/3. Nice work.`);
      return;
    }

    if (newGuesses.length >= 3) {
      setWon(false);
      setGameOver(true);
      setMessage("Game over. Here is the correct order.");

      const orderedItems = puzzle.answer
        .map((answerItem) =>
          puzzle.items.find((item) => item.id === answerItem.id)
        )
        .filter((item): item is RankleItem => item !== undefined);

      setItems(orderedItems);
      return;
    }

    setMessage("Not quite. Drag to reorder and try again.");
  }

  function resetToday() {
    if (!puzzle) return;

    localStorage.removeItem(`${storagePrefix}-${puzzle.date}`);
    setItems(puzzle.items);
    setGuesses([]);
    setMessage("");
    setGameOver(false);
    setWon(false);
  }

  function shareResult() {
    if (!puzzle) return;

    const resultText = [
      `${puzzle.title} ${puzzle.date}`,
      won ? `Solved in ${guesses.length}/3` : "Failed",
      "",
      ...guesses.map((row) => row.join("")),
      "",
      "Play at ranklegames.com",
    ].join("\n");

    navigator.clipboard.writeText(resultText);
    setMessage("Result copied to clipboard.");
  }

  if (!loaded || (!puzzle && !loadError)) {
    return (
      <main className="min-h-screen bg-[#0b0f14] text-white">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center p-6 text-center">
          <div>
            <div className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-emerald-300">
              Rankle Games
            </div>
            <h1 className="text-4xl font-black">Loading...</h1>
            <p className="mt-3 text-zinc-400">Getting today&apos;s game ready.</p>
          </div>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-[#0b0f14] text-white">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center p-6 text-center">
          <div>
            <div className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-emerald-300">
              Rankle Games
            </div>

            <h1 className="text-4xl font-black">Could Not Load</h1>

            <p className="mt-4 text-zinc-400">{loadError}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-black"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!puzzle) return null;

  return (
    <main className="min-h-screen overflow-hidden bg-[#0b0f14] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-180px] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="absolute bottom-[-200px] right-[-120px] h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-xl px-5 py-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.32em] text-emerald-300">
              Rankle Games
            </div>
            <h1 className="mt-1 text-4xl font-black tracking-tight">
              {puzzle.title}
            </h1>
          </div>

          <button
            onClick={resetToday}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            Reset
          </button>
        </header>

        <section className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-md">
          <div className="text-center">
            <div className="mx-auto mb-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
              {accentLabel}
            </div>

            <p className="text-xl font-black leading-tight">
              {puzzle.challenge}
            </p>

            <p className="mt-2 text-sm text-zinc-500">{puzzle.date}</p>

            <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-2xl bg-black/25 p-3">
                <div className="text-lg">🟩</div>
                <div className="mt-1 text-zinc-400">Correct</div>
              </div>
              <div className="rounded-2xl bg-black/25 p-3">
                <div className="text-lg">🟨</div>
                <div className="mt-1 text-zinc-400">Close</div>
              </div>
              <div className="rounded-2xl bg-black/25 p-3">
                <div className="text-lg">⬛</div>
                <div className="mt-1 text-zinc-400">Wrong area</div>
              </div>
            </div>

            <p className="mt-4 text-sm text-zinc-400">
              Drag into order. You get{" "}
              <span className="font-bold text-white">3 guesses</span>.
            </p>
          </div>
        </section>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="mb-5 space-y-3">
              {items.map((item, index) => (
                <SortableCard
                  key={item.id}
                  item={item}
                  index={index}
                  gameOver={gameOver}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {!gameOver && (
          <button
            onClick={checkGuess}
            className="w-full rounded-2xl bg-emerald-400 p-4 text-lg font-black text-black shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-300 active:scale-[0.99]"
          >
            Submit Guess
          </button>
        )}

        {message && (
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center text-sm font-bold text-zinc-200">
            {message}
          </p>
        )}

        {guesses.length > 0 && (
          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/25 p-4 text-center">
            <h2 className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-zinc-500">
              Your Guesses
            </h2>

            <div className="space-y-2">
              {guesses.map((guess, index) => (
                <div key={index} className="text-2xl tracking-widest">
                  {guess.join("")}
                </div>
              ))}
            </div>
          </div>
        )}

        {gameOver && (
          <div className="mt-5 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-xl backdrop-blur-md">
            <h2 className="mb-4 text-2xl font-black">Correct Order</h2>

            <ol className="mb-5 space-y-2">
              {puzzle.answer.map((item, index) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-black/25 p-3"
                >
                  <span className="min-w-0 pr-3">
                    <span className="mr-2 text-zinc-500">{index + 1}.</span>
                    <span className="font-bold">{item.title}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-black text-emerald-300">
                    {item.releaseDate.slice(0, 4)}
                  </span>
                </li>
              ))}
            </ol>

            <button
              onClick={shareResult}
              className="w-full rounded-2xl bg-blue-500 p-4 font-black text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-400 active:scale-[0.99]"
            >
              Share Result
            </button>
          </div>
        )}

        <footer className="py-8 text-center text-xs text-zinc-600">
          Data powered by public APIs. Rankle Games is a fan-made daily ranking
          game.
        </footer>
      </div>
    </main>
  );
}