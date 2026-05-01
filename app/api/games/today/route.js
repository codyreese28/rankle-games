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

async function getIgdbAccessToken() {
  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    {
      method: "POST",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    return {
      error: true,
      message: "Failed to get IGDB access token",
      details: errorText,
    };
  }

  const data = await response.json();

  return {
    error: false,
    accessToken: data.access_token,
  };
}

function formatDateFromUnix(timestamp) {
  return new Date(timestamp * 1000).toISOString().split("T")[0];
}

export async function GET() {
  const today = getTodayDateKey();
  const random = seededRandom(`games-${today}`);
  const offset = Math.floor(random() * 300);

  const tokenResult = await getIgdbAccessToken();

  if (tokenResult.error) {
    return Response.json(tokenResult, { status: 500 });
  }

  const currentUnixTime = Math.floor(Date.now() / 1000);

  const query = `
    fields name, first_release_date, cover.url, total_rating_count, rating;
    where first_release_date != null
      & cover != null
      & total_rating_count >= 150
      & first_release_date < ${currentUnixTime};
    sort total_rating_count desc;
    limit 50;
    offset ${offset};
  `;

  const response = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID || "",
      Authorization: `Bearer ${tokenResult.accessToken}`,
      Accept: "application/json",
    },
    body: query,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    return Response.json(
      {
        error: "Failed to fetch games from IGDB",
        details: errorText,
      },
      { status: 500 }
    );
  }

  const data = await response.json();

  const filteredGames = data
    .filter(
      (game) =>
        game.id &&
        game.name &&
        game.first_release_date &&
        game.cover?.url
    )
    .map((game) => ({
      id: game.id,
      title: game.name,
      releaseDate: formatDateFromUnix(game.first_release_date),
      image: game.cover.url.startsWith("//")
        ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
        : game.cover.url.replace("t_thumb", "t_cover_big"),
    }));

  const selectedGames = shuffleWithSeed(filteredGames, `games-${today}`).slice(
    0,
    5
  );

  const correctOrder = [...selectedGames].sort(
    (a, b) =>
      new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );

  return Response.json({
    date: today,
    gameType: "video-games",
    title: "Rankle Video Games",
    challenge: "Sort these video games from oldest to newest.",
    items: selectedGames.map((game) => ({
      id: game.id,
      title: game.title,
      image: game.image,
    })),
    answer: correctOrder.map((game) => ({
      id: game.id,
      title: game.title,
      releaseDate: game.releaseDate,
    })),
  });
}