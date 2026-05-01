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

function getYearAsDate(year) {
  if (!year) return null;

  const yearString = String(year);

  if (!/^\d{4}$/.test(yearString)) return null;

  return `${yearString}-01-01`;
}

const albumSearches = [
  "Michael Jackson Thriller",
  "Nirvana Nevermind",
  "Taylor Swift 1989",
  "Kendrick Lamar good kid maad city",
  "Eminem The Marshall Mathers LP",
  "Fleetwood Mac Rumours",
  "Metallica Metallica",
  "Prince Purple Rain",
  "Adele 21",
  "Daft Punk Random Access Memories",
  "Drake Take Care",
  "The Beatles Abbey Road",
  "Pink Floyd The Dark Side Of The Moon",
  "Beyonce Lemonade",
  "Kanye West Graduation",
  "AC DC Back In Black",
  "Guns N Roses Appetite For Destruction",
  "The Weeknd After Hours",
  "Olivia Rodrigo Sour",
  "Billie Eilish When We All Fall Asleep",
  "Bruno Mars Doo Wops Hooligans",
  "Lady Gaga The Fame",
  "Bob Marley Legend",
  "Queen A Night At The Opera",
  "Radiohead OK Computer",
  "Green Day Dookie",
  "Linkin Park Hybrid Theory",
  "Snoop Dogg Doggystyle",
  "Tupac All Eyez On Me",
  "Jay Z The Blueprint",
  "Outkast Speakerboxxx The Love Below",
  "Usher Confessions",
  "Ariana Grande Thank U Next",
  "Post Malone Beerbongs Bentleys",
  "Travis Scott Astroworld",
  "Morgan Wallen Dangerous",
  "Luke Combs This One's For You",
  "Shania Twain Come On Over",
  "Garth Brooks No Fences",
  "The Eagles Hotel California",
];

async function searchDiscogsAlbum(term) {
  const url =
    `https://api.discogs.com/database/search` +
    `?q=${encodeURIComponent(term)}` +
    `&type=master` +
    `&format=album` +
    `&per_page=10` +
    `&page=1`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`,
      "User-Agent": "RankleGames/1.0 +https://ranklegames.com",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const data = await response.json();

  const album = (data.results || []).find(
    (result) =>
      result.id &&
      result.title &&
      result.year &&
      result.cover_image &&
      !result.title.toLowerCase().includes("tribute") &&
      !result.title.toLowerCase().includes("karaoke") &&
      !result.title.toLowerCase().includes("live at") &&
      !result.title.toLowerCase().includes("remix")
  );

  if (!album) return null;

  const releaseDate = getYearAsDate(album.year);

  if (!releaseDate) return null;

  return {
    id: album.id,
    title: album.title,
    releaseDate,
    image:
      album.cover_image ||
      album.thumb ||
      "https://via.placeholder.com/250x250/111827/ffffff?text=Album",
  };
}

export async function GET() {
  const today = getTodayDateKey();

  const shuffledSearches = shuffleWithSeed(albumSearches, `music-searches-${today}`);

  const albums = [];

  for (const term of shuffledSearches) {
    if (albums.length >= 5) break;

    const album = await searchDiscogsAlbum(term);

    if (!album) continue;

    const duplicate = albums.some(
      (existingAlbum) => existingAlbum.id === album.id
    );

    if (!duplicate) {
      albums.push(album);
    }
  }

  if (albums.length < 5) {
    return Response.json(
      {
        error: "Not enough albums found for today's puzzle.",
        found: albums.length,
      },
      { status: 500 }
    );
  }

  const selectedAlbums = shuffleWithSeed(albums, `music-${today}`).slice(0, 5);

  const correctOrder = [...selectedAlbums].sort(
    (a, b) =>
      new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );

  return Response.json({
    date: today,
    gameType: "music",
    title: "Rankle Music",
    challenge: "Sort these albums from oldest to newest.",
    items: selectedAlbums.map((album) => ({
      id: album.id,
      title: album.title,
      image: album.image,
    })),
    answer: correctOrder.map((album) => ({
      id: album.id,
      title: album.title,
      releaseDate: album.releaseDate,
    })),
  });
}