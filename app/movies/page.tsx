import RankleGame from "@/components/RankleGame";

export default function MoviesPage() {
  return (
    <RankleGame
      apiPath="/api/movies/today"
      storagePrefix="rankle-movies"
      accentLabel="Daily Movie Sort"
    />
  );
}