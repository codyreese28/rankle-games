"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RanklePageBackground from "@/components/RanklePageBackground";

export default function SettingsPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedSound = localStorage.getItem("rankle-sound-enabled");
    const savedAnimations = localStorage.getItem("rankle-animations-enabled");
    const savedNickname = localStorage.getItem("rankle-nickname");

    setSoundEnabled(savedSound !== "false");
    setAnimationsEnabled(savedAnimations !== "false");
    setNickname(savedNickname || "");
  }, []);

  function toggleSound() {
    const nextValue = !soundEnabled;

    setSoundEnabled(nextValue);
    localStorage.setItem("rankle-sound-enabled", String(nextValue));
    setMessage(`Sound turned ${nextValue ? "on" : "off"}.`);
  }

  function toggleAnimations() {
    const nextValue = !animationsEnabled;

    setAnimationsEnabled(nextValue);
    localStorage.setItem("rankle-animations-enabled", String(nextValue));
    setMessage(`Animations turned ${nextValue ? "on" : "off"}.`);
  }

  function saveNickname() {
    const cleanedNickname = nickname.trim();

    if (!cleanedNickname) {
      localStorage.removeItem("rankle-nickname");
      setNickname("");
      setMessage("Nickname cleared.");
      return;
    }

    localStorage.setItem("rankle-nickname", cleanedNickname);
    setNickname(cleanedNickname);
    setMessage(`Nickname saved as ${cleanedNickname}.`);
  }

  function resetDailyGameProgress() {
    const confirmed = window.confirm(
      "Reset saved daily game progress and used hints on this device? This will not reset achievements."
    );

    if (!confirmed) return;

    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (
        key &&
        key.startsWith("rankle-") &&
        key !== "rankle-achievements" &&
        key !== "rankle-sound-enabled" &&
        key !== "rankle-animations-enabled" &&
        key !== "rankle-nickname"
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    setMessage("Saved daily game progress and used hints have been reset.");
  }

  function resetAchievements() {
    const confirmed = window.confirm(
      "Reset all achievements? This cannot be undone."
    );

    if (!confirmed) return;

    localStorage.removeItem("rankle-achievements");
    setMessage("Achievements have been reset.");
  }

  function resetAllRankleProgress() {
    const confirmed = window.confirm(
      "Reset all Rankle progress on this device? This will clear saved games, achievements, sound settings, animation settings, and nickname."
    );

    if (!confirmed) return;

    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith("rankle")) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    setSoundEnabled(true);
    setAnimationsEnabled(true);
    setNickname("");
    setMessage("All Rankle progress and settings have been reset.");
  }

  return (
    <RanklePageBackground>
      <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
        <header className="mb-6 rounded-3xl border border-slate-300/70 bg-[#f7f4ec]/90 px-6 py-8 text-center shadow-lg shadow-slate-300/40 backdrop-blur-sm">
          <div className="text-xs font-black uppercase tracking-[0.35em] text-emerald-700">
            Rankle Games
          </div>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            Settings
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Manage your Rankle experience on this device. Settings and progress
            are saved in your browser.
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
              href="/archive"
              className="rounded-2xl border border-slate-300 bg-[#ece8df] px-5 py-3 font-black text-slate-700 transition hover:bg-[#dfeee5] hover:text-emerald-800"
            >
              Archive
            </Link>

            <Link
              href="/about"
              className="rounded-2xl border border-slate-300 bg-[#ece8df] px-5 py-3 font-black text-slate-700 transition hover:bg-[#dfeee5] hover:text-emerald-800"
            >
              How to Play
            </Link>
          </div>
        </header>

        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-300 bg-[#e4f3e9] p-4 text-center font-black text-emerald-800 shadow-md">
            {message}
          </div>
        )}

        <section className="mb-6 rounded-3xl border border-slate-300/70 bg-[#f7f4ec]/90 p-5 shadow-lg shadow-slate-300/40 backdrop-blur-sm">
          <div className="mb-5">
            <div className="text-xs font-black uppercase tracking-[0.28em] text-purple-700">
              Player Profile
            </div>

            <h2 className="mt-2 text-3xl font-black text-slate-950">
              Nickname
            </h2>

            <p className="mt-2 text-slate-600">
              Add a nickname for your results and future share messages. This is
              saved only on this device.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-300 bg-[#ece8df] p-5">
            <label
              htmlFor="rankle-nickname"
              className="text-sm font-black uppercase tracking-[0.18em] text-slate-500"
            >
              Player Nickname
            </label>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="rankle-nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={18}
                placeholder="Example: Cody"
                className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 font-bold text-slate-900 outline-none transition focus:border-emerald-500"
              />

              <button
                onClick={saveNickname}
                className="rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white shadow-lg transition hover:bg-emerald-400 active:scale-[0.99]"
              >
                Save
              </button>
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-500">
              Leave it blank and click Save to clear your nickname.
            </p>
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-slate-300/70 bg-[#f7f4ec]/90 p-5 shadow-lg shadow-slate-300/40 backdrop-blur-sm">
          <div className="mb-5">
            <div className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">
              Gameplay
            </div>

            <h2 className="mt-2 text-3xl font-black text-slate-950">
              Preferences
            </h2>

            <p className="mt-2 text-slate-600">
              These settings control sound and animation effects during the
              game.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-300 bg-[#ece8df] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-950">Sound</h3>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  Controls the lose sound effect.
                </p>
              </div>

              <button
                onClick={toggleSound}
                className={`rounded-2xl px-5 py-3 font-black text-white shadow-lg transition active:scale-[0.99] ${
                  soundEnabled
                    ? "bg-emerald-500 hover:bg-emerald-400"
                    : "bg-slate-500 hover:bg-slate-400"
                }`}
              >
                Sound: {soundEnabled ? "On" : "Off"}
              </button>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-300 bg-[#ece8df] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-950">
                  Animations
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  Controls win confetti and celebration effects.
                </p>
              </div>

              <button
                onClick={toggleAnimations}
                className={`rounded-2xl px-5 py-3 font-black text-white shadow-lg transition active:scale-[0.99] ${
                  animationsEnabled
                    ? "bg-emerald-500 hover:bg-emerald-400"
                    : "bg-slate-500 hover:bg-slate-400"
                }`}
              >
                Animations: {animationsEnabled ? "On" : "Off"}
              </button>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-slate-300/70 bg-[#f7f4ec]/90 p-5 shadow-lg shadow-slate-300/40 backdrop-blur-sm">
          <div className="mb-5">
            <div className="text-xs font-black uppercase tracking-[0.28em] text-blue-700">
              Support
            </div>

            <h2 className="mt-2 text-3xl font-black text-slate-950">
              Report a Problem
            </h2>

            <p className="mt-2 text-slate-600">
              Report wrong dates, duplicate items, broken images, or anything
              else that looks off.
            </p>
          </div>

          <a
            href="https://forms.gle/GdFPKPXEg82JywGZ9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-2xl bg-blue-500 px-5 py-3 font-black text-white shadow-lg transition hover:bg-blue-400 active:scale-[0.99]"
          >
            Open Report Form
          </a>
        </section>

        <section className="rounded-3xl border border-red-200 bg-[#fff1f1]/90 p-5 shadow-lg shadow-red-100/60 backdrop-blur-sm">
          <div className="mb-5">
            <div className="text-xs font-black uppercase tracking-[0.28em] text-red-700">
              Reset
            </div>

            <h2 className="mt-2 text-3xl font-black text-slate-950">
              Reset Data
            </h2>

            <p className="mt-2 text-slate-600">
              These actions only affect this browser and device.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={resetDailyGameProgress}
              className="rounded-2xl border border-red-300 bg-white/70 px-5 py-3 font-black text-red-700 transition hover:bg-red-50 active:scale-[0.99]"
            >
              Reset Game Progress
            </button>

            <button
              onClick={resetAchievements}
              className="rounded-2xl border border-red-300 bg-white/70 px-5 py-3 font-black text-red-700 transition hover:bg-red-50 active:scale-[0.99]"
            >
              Reset Achievements
            </button>

            <button
              onClick={resetAllRankleProgress}
              className="rounded-2xl bg-red-500 px-5 py-3 font-black text-white shadow-lg transition hover:bg-red-400 active:scale-[0.99]"
            >
              Reset All Rankle Data
            </button>
          </div>
        </section>

        <footer className="py-8 text-center text-xs font-bold text-[#d8c7a3]">
          Settings are saved locally using your browser storage.
        </footer>
      </div>
    </RanklePageBackground>
  );
}