// Fetches my FACEIT and Steam stats and saves them to src/content/gaming.json.
// Runs before every build. Neither site allows a browser on another domain
// to read its data, so the site shows this snapshot instead of a live call.
// If a request fails, the last saved value is kept and the build goes on.
//
// FACEIT: the endpoints its own website uses (no API key). Stats come back
// under short codes; the ones used here were checked against each other:
//   lifetime  m1 matches · m2 wins · k6 win rate % · k5 K/D · k8 headshot %
//             k17 ADR · s2 longest win streak · s0 last five results, oldest first (1 = win)
//   per match i1 map · i18 score · i10 win (1) · i6 kills · i8 deaths
//             i7 assists · c2 K/D · c4 headshot % · c10 ADR · elo · elo_delta
// Steam: the public profile (XML and page). Real name and location are
// public there too, but deliberately not saved.
import { readFile, writeFile } from "node:fs/promises";

const FACEIT_NICKNAME = "Hopi9";
const STEAM_ID = "bil9uun";
const MATCHES = 30; // for the ELO chart; the latest few are listed too
const OUT = new URL("../src/content/gaming.json", import.meta.url);

const headers = {
  "User-Agent": "bilguun-portfolio-build",
  "Accept-Language": "en-US",
};

const previous = await readFile(OUT, "utf8")
  .then(JSON.parse)
  .catch(() => ({ faceit: null, steam: null }));

const warn = (what) => (error) => {
  console.warn(`gaming: ${what} not updated (${error.message})`);
  return null;
};

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

// A few polite retries: FACEIT answers the same request with 200 or 403
// from one moment to the next.
async function json(url, tries = 3) {
  for (let i = 1; ; i++) {
    const res = await fetch(url, { headers });
    if (res.ok) return res.json();
    if (i >= tries) throw new Error(`${res.status} ${url}`);
    await sleep(2000 * i);
  }
}

async function text(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

const num = (v) =>
  v === undefined || v === null || v === "" ? null : Number(v);

async function faceit() {
  const { payload: user } = await json(
    `https://api.faceit.com/users/v1/nicknames/${FACEIT_NICKNAME}`,
  );
  const cs2 = user.games?.cs2;
  if (!cs2) throw new Error("FACEIT: no CS2 stats");
  const id = user.id;

  // Each part can fail on its own (FACEIT's Cloudflare turns some requests
  // away); then that part keeps its last saved value.
  const before = previous.faceit ?? {};
  const [stats, history, rank] = await Promise.all([
    json(
      `https://www.faceit.com/api/stats/v1/stats/users/${id}/games/cs2`,
    ).catch(warn("FACEIT lifetime stats")),
    json(
      `https://api.faceit.com/stats/v1/stats/time/users/${id}/games/cs2?size=${MATCHES}`,
    ).catch(warn("FACEIT match history")),
    json(
      `https://api.faceit.com/ranking/v1/globalranking/cs2/${cs2.region}/${id}`,
    ).catch(warn("FACEIT ranking")),
  ]);
  const l = stats?.lifetime;

  return {
    nickname: user.nickname,
    level: cs2.skill_level,
    elo: cs2.faceit_elo,
    region: cs2.region,
    regionRank: rank ? num(rank.payload) : (before.regionRank ?? null),
    memberSince: Number(user.created_at.slice(0, 4)),
    url: `https://www.faceit.com/en/players/${user.nickname}`,
    lifetime: !l
      ? (before.lifetime ?? null)
      : {
          matches: num(l.m1),
          wins: num(l.m2),
          winRate: num(l.k6),
          kd: num(l.k5),
          headshots: num(l.k8),
          adr: num(l.k17),
          longestStreak: num(l.s2),
          recent: (l.s0 ?? []).map((r) => (r === "1" ? "W" : "L")),
        },
    // Newest first.
    matches: !history
      ? (before.matches ?? [])
      : history
          .filter((m) => m.elo)
          .map((m) => {
            const win = m.i10 === "1";
            const [a, b] = (m.i18 ?? "0 / 0").split("/").map((s) => Number(s));
            return {
              date: new Date(m.date).toISOString().slice(0, 10),
              map: m.i1?.replace(/^de_/, "") ?? "",
              win,
              // The score isn't ordered by team: the winner has more rounds.
              score: win
                ? [Math.max(a, b), Math.min(a, b)]
                : [Math.min(a, b), Math.max(a, b)],
              kills: num(m.i6),
              deaths: num(m.i8),
              assists: num(m.i7),
              kd: num(m.c2),
              headshots: num(m.c4),
              adr: num(m.c10),
              elo: num(m.elo),
              delta: num(m.elo_delta),
            };
          }),
  };
}

async function steam() {
  const [xml, page] = await Promise.all([
    text(`https://steamcommunity.com/id/${STEAM_ID}?xml=1`),
    text(`https://steamcommunity.com/id/${STEAM_ID}/?l=english`),
  ]);
  const tag = (name, from = xml) =>
    from
      .match(
        new RegExp(
          `<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`,
        ),
      )?.[1]
      ?.trim() ?? null;
  const count = (label) => {
    const m = page.match(
      new RegExp(
        `<span class="count_link_label">${label}</span>[\\s\\S]{0,120}?<span class="profile_count_link_total">\\s*([\\d,]+)`,
      ),
    );
    return m ? Number(m[1].replace(/,/g, "")) : null;
  };
  const hours = (s) => (s ? Number(s.replace(/,/g, "")) : null);

  const mostPlayed = [
    ...xml.matchAll(/<mostPlayedGame>([\s\S]*?)<\/mostPlayedGame>/g),
  ];
  const cs2 = mostPlayed.find(
    (m) => tag("gameName", m[1]) === "Counter-Strike 2",
  );

  // "Recent activity" on the profile page: name, app, total hours, last played.
  const year = new Date().getFullYear();
  const recent = page
    .split('class="recent_game_content"')
    .slice(1)
    .map((block) => [
      ...(block.match(/steamcommunity\.com\/app\/(\d+)">([^<]+)</) ?? []).slice(
        1,
      ),
      ...(
        block.match(
          /([\d,.]+) hrs on record(?:<br>\s*last played on ([^<\t\n]+))?/,
        ) ?? []
      ).slice(1),
    ])
    .filter(([app, , total]) => app && total)
    .map(([app, name, total, last]) => [null, app, name, total, last])
    .slice(0, 3)
    .map(([, app, name, total, last]) => {
      // "12 Nov" has no year: it's this year, unless that's still ahead.
      let lastPlayed = null;
      if (last) {
        const d = new Date(`${last.trim()} ${year} 12:00 UTC`);
        if (d > new Date()) d.setFullYear(year - 1);
        if (!Number.isNaN(d.getTime()))
          lastPlayed = d.toISOString().slice(0, 10);
      }
      return {
        name: name.trim(),
        hours: hours(total),
        lastPlayed,
        image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${app}/capsule_184x69.jpg`,
        url: `https://store.steampowered.com/app/${app}`,
      };
    });

  const since = tag("memberSince");
  return {
    persona: tag("steamID"),
    avatar: tag("avatarMedium"),
    url: `https://steamcommunity.com/id/${STEAM_ID}`,
    level: num(page.match(/class="friendPlayerLevelNum">(\d+)</)?.[1]),
    memberSince: since ? Number(since.match(/\d{4}/)?.[0]) : null,
    vacBanned: tag("vacBanned") === "1",
    cs2Hours: cs2 ? hours(tag("hoursOnRecord", cs2[1])) : null,
    recentHours: hours(page.match(/([\d.,]+) hours past 2 weeks/)?.[1]),
    badges: count("Badges"),
    games: count("Games"),
    friends: count("Friends"),
    recent,
  };
}

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
  `gaming: FACEIT level ${data.faceit?.level} (${data.faceit?.elo} ELO, ${data.faceit?.matches?.length} matches), Steam level ${data.steam?.level}, ${data.steam?.recent?.length} recent games`,
);
