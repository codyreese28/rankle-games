import RankleGame from "@/components/RankleGame";

export default function MusicPage() {
  return (
    <RankleGame
      apiPath="/api/music/today"
      storagePrefix="rankle-music"
      accentLabel="Daily Music Sort"
      theme="music"
    />
  );
}