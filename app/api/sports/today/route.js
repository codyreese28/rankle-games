import { sportsTeams } from "@/data/sportsTeams";

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

function getLeagueEmoji(league) {
  if (league === "NFL") return "🏈";
  if (league === "NBA") return "🏀";
  if (league === "NHL") return "🏒";
  if (league === "MLB") return "⚾";
  return "🏆";
}

function getLeaguePath(league) {
  if (league === "NFL") return "nfl";
  if (league === "NBA") return "nba";
  if (league === "NHL") return "nhl";
  if (league === "MLB") return "mlb";
  return "";
}

function getTeamLogoUrl(team) {
  const leaguePath = getLeaguePath(team.league);

  if (!leaguePath || !team.espnId) return null;

  return `https://a.espncdn.com/i/teamlogos/${leaguePath}/500/${team.espnId}.png`;
}

function makeFallbackLogo(team) {
  const emoji = getLeagueEmoji(team.league);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" rx="40" fill="#f8fafc"/>
      <circle cx="100" cy="85" r="48" fill="#e2e8f0"/>
      <text x="100" y="105" text-anchor="middle" font-size="52">${emoji}</text>
      <text
        x="100"
        y="155"
        text-anchor="middle"
        font-size="18"
        font-family="Arial, Helvetica, sans-serif"
        font-weight="700"
        fill="#0f172a"
      >
        ${team.league}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function makeTeamItem(team) {
  const logoUrl = getTeamLogoUrl(team);

  return {
    id: team.id,
    title: `${getLeagueEmoji(team.league)} ${team.title}`,
    image: logoUrl || makeFallbackLogo(team),
  };
}

export async function GET() {
  const today = getTodayDateKey();

  const selectedTeams = shuffleWithSeed(sportsTeams, `sports-${today}`).slice(
    0,
    5
  );

  if (selectedTeams.length < 5) {
    return Response.json(
      {
        error: "Not enough sports teams found for today's puzzle.",
        found: selectedTeams.length,
      },
      { status: 500 }
    );
  }

  const correctOrder = [...selectedTeams].sort(
    (a, b) =>
      new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );

  const items = selectedTeams.map((team) => makeTeamItem(team));

  return Response.json({
    date: today,
    gameType: "sports",
    title: "Rankle Sports Teams",
    challenge:
      "Sort these NFL, NBA, NHL, and MLB teams from oldest to newest by franchise founding year.",
    items,
    answer: correctOrder.map((team) => ({
      id: team.id,
      title: `${getLeagueEmoji(team.league)} ${team.title}`,
      releaseDate: team.releaseDate,
    })),
  });
}