type RanklePageBackgroundProps = {
  children: React.ReactNode;
};

export default function RanklePageBackground({
  children,
}: RanklePageBackgroundProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071b16] text-slate-900">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f6edd5_0%,#194235_42%,#071b16_100%)]" />

        <div className="absolute left-0 top-0 h-full w-[18%] bg-gradient-to-b from-red-900 via-red-700 to-[#071b16] opacity-95" />
        <div className="absolute left-[18%] top-0 h-full w-[18%] bg-gradient-to-b from-cyan-700 via-sky-600 to-[#071b16] opacity-90" />
        <div className="absolute left-[36%] top-0 h-full w-[18%] bg-gradient-to-b from-emerald-700 via-green-500 to-[#071b16] opacity-80" />
        <div className="absolute left-[54%] top-0 h-full w-[18%] bg-gradient-to-b from-amber-600 via-yellow-500 to-[#071b16] opacity-85" />
        <div className="absolute left-[72%] top-0 h-full w-[14%] bg-gradient-to-b from-purple-900 via-violet-700 to-[#071b16] opacity-90" />
        <div className="absolute right-0 top-0 h-full w-[14%] bg-gradient-to-b from-orange-700 via-orange-500 to-[#071b16] opacity-90" />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,27,22,0.02),rgba(7,27,22,0.12)_55%,rgba(7,27,22,0.55)_100%)]" />
      </div>

      <div className="relative z-10">{children}</div>
    </main>
  );
}