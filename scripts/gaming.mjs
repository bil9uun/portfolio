// Fetches my FACEIT and Steam stats and saves them to src/data/gaming.json.
// Runs before every build. Neither site allows a browser on another domain
// to read its data, so the site shows this snapshot instead of a live call.
// If a request fails, the last saved value is kept and the build goes on.
import { readFile, writeFile } from "node:fs/promises";

const FACEIT_NICKNAME = "Hopi9";
const STEAM_ID = "bil9uun";
const OUT = new URL("../src/data/gaming.json", import.meta.url);

const headers = { "User-Agent": "Mozilla/5.0 (portfolio build)" };

async function faceit() {
  const res = await fetch(
    `https://api.faceit.com/users/v1/nicknames/${FACEIT_NICKNAME}`,
    { headers },
  );
  if (!res.ok) throw new Error(`FACEIT ${res.status}`);
  const { payload } = await res.json();
  const cs2 = payload.games?.cs2;
  if (!cs2) throw new Error("FACEIT: no CS2 stats");
  return {
    nickname: payload.nickname,
    level: cs2.skill_level,
    elo: cs2.faceit_elo,
    url: `https://www.faceit.com/en/players/${payload.nickname}`,
  };
}

async function steam() {
  const res = await fetch(`https://steamcommunity.com/id/${STEAM_ID}?xml=1`, {
    headers,
  });
  if (!res.ok) throw new Error(`Steam ${res.status}`);
  const xml = await res.text();
  const tag = (name, from = xml) =>
    from
      .match(
        new RegExp(
          `<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`,
        ),
      )?.[1]
      ?.trim() ?? null;

  const games = [
    ...xml.matchAll(/<mostPlayedGame>([\s\S]*?)<\/mostPlayedGame>/g),
  ];
  const cs2 = games.find((m) => tag("gameName", m[1]) === "Counter-Strike 2");
  const hours = cs2 ? tag("hoursOnRecord", cs2[1]) : null;
  const since = tag("memberSince");

  return {
    persona: tag("steamID"),
    avatar: tag("avatarMedium"),
    cs2Hours: hours ? Number(hours.replace(/,/g, "")) : null,
    memberSince: since ? Number(since.match(/\d{4}/)?.[0]) : null,
    url: `https://steamcommunity.com/id/${STEAM_ID}`,
  };
}

const previous = await readFile(OUT, "utf8")
  .then(JSON.parse)
  .catch(() => ({ faceit: null, steam: null }));

const settle = async (name, load) => {
  try {
    return await load();
  } catch (error) {
    console.warn(`gaming: ${name} not updated (${error.message})`);
    return previous[name];
  }
};

const data = {
  updated: new Date().toISOString().slice(0, 10),
  faceit: await settle("faceit", faceit),
  steam: await settle("steam", steam),
};

await writeFile(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(
  `gaming: FACEIT level ${data.faceit?.level} (${data.faceit?.elo} ELO), CS2 ${data.steam?.cs2Hours} h`,
);
