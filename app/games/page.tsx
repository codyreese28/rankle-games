import RankleGame from "@/components/RankleGame";

export default function GamesPage() {
  return (
    <RankleGame
      apiPath="/api/games/today"
      storagePrefix="rankle-video-games"
      accentLabel="Daily Video Game Sort"
      theme="games"
    />
  );
}