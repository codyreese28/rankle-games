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

async function getPuzzleFromEndpoint(endpoint) {
  try {
    const response = await fetch(endpoint, { cache: "no-store" });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

export async function GET() {
  const today = getTodayDateKey();

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const endpoints = [
    `${baseUrl}/api/movies/today`,
    `${baseUrl}/api/games/today`,
    `${baseUrl}/api/music/today`,
  ];

  const results = await Promise.all(
    endpoints.map((endpoint) => getPuzzleFromEndpoint(endpoint))
  );

  const validResults = results.filter(Boolean);

  const combinedItems = validResults.flatMap((puzzle) =>
    puzzle.answer.map((answerItem) => {
      const matchingItem = puzzle.items.find(
        (item) => item.id === answerItem.id
      );

      let emoji = "❓";

      if (puzzle.gameType === "movies") emoji = "🎬";
      if (puzzle.gameType === "video-games") emoji = "🎮";
      if (puzzle.gameType === "music") emoji = "🎵";

      return {
        id: `${puzzle.gameType}-${answerItem.id}`,
        title: `${emoji} ${matchingItem?.title || answerItem.title}`,
        image: matchingItem?.image || "",
        releaseDate: answerItem.releaseDate,
        sourceType: puzzle.gameType,
      };
    })
  );

  const usableItems = combinedItems.filter(
    (item) => item.id && item.title && item.image && item.releaseDate
  );

  const selectedItems = shuffleWithSeed(usableItems, `mystery-${today}`).slice(
    0,
    5
  );

  if (selectedItems.length < 5) {
    return Response.json(
      {
        error: "Not enough items found for Mystery Rankle.",
        found: selectedItems.length,
      },
      { status: 500 }
    );
  }

  const correctOrder = [...selectedItems].sort(
    (a, b) =>
      new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );

  return Response.json({
    date: today,
    gameType: "mystery",
    title: "Mystery Rankle",
    challenge:
      "Sort these mixed movies, video games, and albums from oldest to newest.",
    items: selectedItems.map((item) => ({
      id: item.id,
      title: item.title,
      image: item.image,
    })),
    answer: correctOrder.map((item) => ({
      id: item.id,
      title: item.title,
      releaseDate: item.releaseDate,
    })),
  });
}