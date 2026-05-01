function getTodayDateKey() {
  return new Date().toISOString().split("T")[0];
}

function seededRandom(seed) {
  let value = 0;

  for (let i = 0; i < seed.length; i++) {
    value += seed.charCodeAt(i);
  }

  return function () {
    value = Math.sin(value) * 10000;
    return value - Math.floor(value);
  };
}

function shuffleWithSeed(array, seed) {
  const random = seededRandom(seed);
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export async function GET() {
  const today = getTodayDateKey();
  const random = seededRandom(today);

  const randomPage = Math.floor(random() * 25) + 1;

  const url =
    `https://api.themoviedb.org/3/discover/movie` +
    `?include_adult=false` +
    `&include_video=false` +
    `&language=en-US` +
    `&page=${randomPage}` +
    `&sort_by=popularity.desc` +
    `&vote_count.gte=1500` +
    `&primary_release_date.gte=1980-01-01`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
      accept: "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json();

  const filteredMovies = data.results.filter(
    movie => movie.title && movie.release_date && movie.poster_path
  );

  const selectedMovies = shuffleWithSeed(filteredMovies, today).slice(0, 5);

  const correctOrder = [...selectedMovies].sort(
    (a, b) => new Date(a.release_date) - new Date(b.release_date)
  );

 return Response.json({
  date: today,
  gameType: "movies",
  title: "Rankle Movies",
  challenge: "Sort these movies from oldest to newest.",
  items: selectedMovies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    image: `https://image.tmdb.org/t/p/w185${movie.poster_path}`,
  })),
  answer: correctOrder.map((movie) => ({
    id: movie.id,
    title: movie.title,
    releaseDate: movie.release_date,
  })),
});
}