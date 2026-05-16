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

function getLeagueColor(league) {
  if (league === "NFL") {
    return {
      start: "#dbeafe",
      end: "#93c5fd",
      text: "#1e3a8a",
      accent: "#2563eb",
    };
  }

  if (league === "NBA") {
    return {
      start: "#ffedd5",
      end: "#fdba74",
      text: "#7c2d12",
      accent: "#ea580c",
    };
  }

  if (league === "NHL") {
    return {
      start: "#e0f2fe",
      end: "#7dd3fc",
      text: "#0c4a6e",
      accent: "#0284c7",
    };
  }

  if (league === "MLB") {
    return {
      start: "#dcfce7",
      end: "#86efac",
      text: "#14532d",
      accent: "#16a34a",
    };
  }

  return {
    start: "#f8fafc",
    end: "#cbd5e1",
    text: "#0f172a",
    accent: "#64748b",
  };
}

function getInitials(teamName) {
  return teamName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function makeTeamImage(team) {
  const emoji = getLeagueEmoji(team.league);
  const colors = getLeagueColor(team.league);
  const initials = getInitials(team.title);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colors.start}"/>
          <stop offset="100%" stop-color="${colors.end}"/>
        </linearGradient>
      </defs>

      <rect width="300" height="420" rx="36" fill="url(#bg)"/>
      <rect x="18" y="18" width="264" height="384" rx="28" fill="rgba(255,255,255,0.35)" stroke="${colors.accent}" stroke-width="4"/>

      <circle cx="150" cy="105" r="54" fill="rgba(255,255,255,0.7)" stroke="${colors.accent}" stroke-width="4"/>
      <text x="150" y="126" text-anchor="middle" font-size="58">${emoji}</text>

      <text x="150" y="235" text-anchor="middle" font-size="62" font-family="Arial, Helvetica, sans-serif" font-weight="900" fill="${colors.text}">
        ${initials}
      </text>

      <rect x="72" y="275" width="156" height="48" rx="24" fill="rgba(255,255,255,0.65)" stroke="${colors.accent}" stroke-width="3"/>
      <text x="150" y="307" text-anchor="middle" font-size="27" font-family="Arial, Helvetica, sans-serif" font-weight="900" fill="${colors.text}">
        ${team.league}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
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

  return Response.json({
    date: today,
    gameType: "sports",
    title: "Rankle Sports Teams",
    challenge:
      "Sort these NFL, NBA, NHL, and MLB teams from oldest to newest by franchise founding year.",
    items: selectedTeams.map((team) => ({
      id: team.id,
      title: `${getLeagueEmoji(team.league)} ${team.title}`,
      image: makeTeamImage(team),
    })),
    answer: correctOrder.map((team) => ({
      id: team.id,
      title: `${getLeagueEmoji(team.league)} ${team.title}`,
      releaseDate: team.releaseDate,
    })),
  });
}