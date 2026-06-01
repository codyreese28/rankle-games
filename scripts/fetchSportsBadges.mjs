import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { sportsTeams } from "../data/sportsTeams.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "../data/sportsTeams.js");
const API_BASE = "https://www.thesportsdb.com/api/v1/json/123/searchteams.php";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");
}

function getSearchNames(team) {
  const specialSearches = {
    Athletics: ["Athletics", "Oakland Athletics"],
    "Utah Mammoth": ["Utah Hockey Club", "Utah Mammoth"],
    "Washington Commanders": ["Washington Commanders"],
    "Vegas Golden Knights": ["Vegas Golden Knights"],
  };

  return [...new Set([team.title, ...(specialSearches[team.title] || [])])];
}

function isRealMatch(result, team) {
  if (!result?.strTeam) return false;

  const resultTeam = normalize(result.strTeam);
  const targetTeam = normalize(team.title);

  if (resultTeam !== targetTeam) {
    return false;
  }

  const leagueFields = [
    result.strLeague,
    result.strLeague2,
    result.strLeague3,
    result.strLeague4,
    result.strSport,
  ]
    .filter(Boolean)
    .map(normalize);

  const league = normalize(team.league);

  if (league === "NFL") {
    return (
      leagueFields.some((field) => field.includes("nfl")) ||
      leagueFields.some((field) => field.includes("americanfootball"))
    );
  }

  if (league === "NBA") {
    return (
      leagueFields.some((field) => field.includes("nba")) ||
      leagueFields.some((field) => field.includes("basketball"))
    );
  }

  if (league === "NHL") {
    return (
      leagueFields.some((field) => field.includes("nhl")) ||
      leagueFields.some((field) => field.includes("icehockey"))
    );
  }

  if (league === "MLB") {
    return (
      leagueFields.some((field) => field.includes("mlb")) ||
      leagueFields.some((field) => field.includes("baseball"))
    );
  }

  return true;
}

function pickBestTeamMatch(results, team) {
  if (!Array.isArray(results) || results.length === 0) return null;

  const exactMatch = results.find((result) => isRealMatch(result, team));

  if (!exactMatch) {
    return null;
  }

  return exactMatch;
}

async function searchTeam(team, searchName) {
  const url = `${API_BASE}?t=${encodeURIComponent(searchName)}`;

  const response = await fetch(url);

  if (response.status === 429) {
    throw new Error("RATE_LIMITED");
  }

  if (!response.ok) {
    throw new Error(`TheSportsDB request failed: ${response.status}`);
  }

  const data = await response.json();
  return pickBestTeamMatch(data.teams, team);
}

async function findBadgeForTeam(team) {
  const searchNames = getSearchNames(team);

  for (const searchName of searchNames) {
    try {
      const result = await searchTeam(team, searchName);

      if (result?.strBadge) {
        return {
          badge: result.strBadge,
          matchedName: result.strTeam,
          searchedName: searchName,
        };
      }
    } catch (error) {
      if (error.message === "RATE_LIMITED") {
        throw error;
      }

      console.warn(`Error searching ${team.title}: ${error.message}`);
    }

    await sleep(1500);
  }

  return null;
}

function formatSportsTeamsFile(teams) {
  return `export const sportsTeams = ${JSON.stringify(teams, null, 2)};\n`;
}

async function main() {
  console.log(`Fetching badges for ${sportsTeams.length} sports teams...`);

  const updatedTeams = [];

  for (let index = 0; index < sportsTeams.length; index++) {
    const team = sportsTeams[index];

    if (team.badge) {
      console.log(
        `[${index + 1}/${sportsTeams.length}] ${team.title} already has badge`
      );
      updatedTeams.push(team);
      continue;
    }

    try {
      const result = await findBadgeForTeam(team);

      if (result) {
        console.log(
          `[${index + 1}/${sportsTeams.length}] ${team.title} ✅ matched "${result.matchedName}"`
        );

        updatedTeams.push({
          ...team,
          badge: result.badge,
        });
      } else {
        console.log(
          `[${index + 1}/${sportsTeams.length}] ${team.title} ⚠️ no exact badge match found`
        );

        updatedTeams.push(team);
      }
    } catch (error) {
      if (error.message === "RATE_LIMITED") {
        console.log("");
        console.log("Rate limited by TheSportsDB. Saving progress and stopping.");
        console.log("Wait a while, then run the script again.");
        updatedTeams.push(team);
        updatedTeams.push(...sportsTeams.slice(index + 1));
        break;
      }

      console.warn(`Error searching ${team.title}: ${error.message}`);
      updatedTeams.push(team);
    }

    await sleep(2500);
  }

  await fs.writeFile(DATA_FILE, formatSportsTeamsFile(updatedTeams), "utf8");

  const badgeCount = updatedTeams.filter((team) => team.badge).length;

  console.log("");
  console.log(
    `Done. Added/found badges for ${badgeCount}/${updatedTeams.length} teams.`
  );
  console.log(`Updated file: ${DATA_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});