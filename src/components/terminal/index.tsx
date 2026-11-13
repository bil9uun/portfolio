import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@tanstack/react-router";
import { SKILLS } from "@/components/games/canvas";
import { games } from "@/components/games/registry";
import {
  education,
  experience,
  navItems,
  profile,
  projects,
} from "@/data/portfolio";
import gaming from "@/data/gaming.json";
import { useGroups } from "@/data/uses";
import { localStatus } from "@/hooks/use-local-time";
import { achievements, unlock, unlocked } from "@/lib/achievements";
import { personalLink } from "@/lib/guest";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { setLang, t, ui, useT, type Text } from "@/lib/i18n";
import { useGoToSection } from "@/lib/navigation";
import { startParty } from "@/lib/party";
import { replayBuild } from "@/lib/replay";
import { click, setSound } from "@/lib/sound";
import { terminalCommand, terminalOpen, useStore } from "@/lib/store";
import { swarm } from "@/lib/swarm";

// A small shell for people who'd rather type. Opened with ` (see __root.tsx).

type Line = { id: number; kind: "in" | "out" | "err" | "ok"; body: ReactNode };

const PROMPT = "guest@bilguun:~$";

const copy = {
  banner: t(
    "B.Bilguun · portfolio shell. Type `help` to see the commands.",
    "B.Bilguun · portfolio shell. Командуудыг харах бол `help` гэж бичнэ үү.",
  ),
  notFound: (cmd: string) =>
    t(
      `command not found: ${cmd}. Type \`help\`.`,
      `команд олдсонгүй: ${cmd}. \`help\` гэж бичнэ үү.`,
    ),
  usage: (text: string) => t(`usage: ${text}`, `хэрэглээ: ${text}`),
  noProject: (slug: string) =>
    t(
      `no such project: ${slug}. Try \`ls projects\`.`,
      `ийм төсөл алга: ${slug}. \`ls projects\` гэж үзээрэй.`,
    ),
  noSection: (id: string) =>
    t(
      `no such section: ${id}. Try \`ls\`.`,
      `ийм хэсэг алга: ${id}. \`ls\` гэж үзээрэй.`,
    ),
  noGame: (id: string) =>
    t(
      `no such game: ${id}. Try \`play\`.`,
      `ийм тоглоом алга: ${id}. \`play\` гэж үзээрэй.`,
    ),
  password: t("[sudo] password for guest: ", "[sudo] guest-ийн нууц үг: "),
  granted: t(
    "Access granted. Opening an email to Bilguun…",
    "Зөвшөөрөгдлөө. Билгүүн рүү имэйл бичих цонх нээж байна…",
  ),
  sudoOther: t(
    "guest is not in the sudoers file. This incident will be reported. Try `sudo hire bilguun`.",
    "guest sudoers файлд байхгүй. Энэ үйлдлийг бүртгэлээ. `sudo hire bilguun` гэж оролдоод үз.",
  ),
  rm: t(
    "Nice try. This site is read-only.",
    "Сайн оролдлого. Энэ сайт зөвхөн уншигдана.",
  ),
  copied: t("copied to clipboard", "хуулагдлаа"),
  linkUsage: t(
    "usage: link <name>  e.g. link Golomt team",
    "хэрэглээ: link <нэр>  жишээ: link Golomt team",
  ),
  hours: t("hours in CS2", "цаг CS2"),
  party: t("🎉 party mode", "🎉 party горим"),
  sound: t("sound", "дуу"),
  lang: t("language: English", "хэл: Монгол"),
  hireSubject: "Hello from your portfolio",
};

const HELP: [string, Text][] = [
  ["whoami", t("who I am", "би хэн бэ")],
  [
    "ls [projects]",
    t("list sections or projects", "хэсэг эсвэл төслүүдийг жагсаах"),
  ],
  ["cd <section>", t("go to a section", "хэсэг рүү очих")],
  ["open <project>", t("open a case study", "төслийн дэлгэрэнгүйг нээх")],
  ["experience", t("where I've worked", "ажлын туршлага")],
  ["education", t("where I've studied", "боловсрол")],
  ["skills", t("what I work with", "ур чадвар")],
  ["contact", t("how to reach me", "холбоо барих")],
  ["cv", t("open the printable CV", "хэвлэх CV нээх")],
  ["uses", t("the hardware on my desks", "миний тоног төхөөрөмж")],
  ["date", t("my local time and status", "миний цаг, байдал")],
  ["faceit", t("my Counter-Strike stats", "Counter-Strike статистик")],
  ["steam", t("my Steam profile", "Steam профайл")],
  ["play [game]", t("list or open a game", "тоглоом жагсаах, нээх")],
  ["achievements", t("what you've found so far", "олсон амжилтууд")],
  ["link <name>", t("make a personal link", "хувийн холбоос үүсгэх")],
  ["lang <en|mn>", t("switch language", "хэл солих")],
  ["sound <on|off>", t("interface sound", "дуу асаах, унтраах")],
  ["replay", t("rebuild the page", "сайтыг дахин бүтээх")],
  ["clear", t("clear the screen", "дэлгэц цэвэрлэх")],
  ["exit", t("close the terminal", "terminal хаах")],
];

const COMMANDS = [
  ...HELP.map(([c]) => c.split(" ")[0]),
  "help",
  "sudo",
  "echo",
  "projects",
];

const Terminal = () => {
  const open = useStore(terminalOpen);
  const navigate = useNavigate();
  const goToSection = useGoToSection();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const cursor = useRef(-1); // position in history while browsing it
  const nextId = useRef(0);
  const panel = useRef<HTMLDivElement>(null);
  const output = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const tr = useT();
  const print = (body: ReactNode, kind: Line["kind"] = "out") =>
    setLines((prev) => [...prev, { id: nextId.current++, kind, body }]);
  const close = () => terminalOpen.set(false);

  // Banner on first open.
  useEffect(() => {
    if (open && nextId.current === 0) print(tr(copy.banner), "ok");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Slide down from the top; the swarm gathers round while it's open.
  useLayoutEffect(() => {
    const el = panel.current;
    if (!open || !el) return;
    swarm.focus = el;
    input.current?.focus();
    // fromTo, not from: if the effect runs twice (React StrictMode), a
    // second `from` would take the half-way position as its end and stop there.
    const slide = prefersReducedMotion()
      ? null
      : gsap.fromTo(
          el,
          { yPercent: -100 },
          { yPercent: 0, duration: 0.45, ease: "expo.out" },
        );
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      slide?.kill();
      window.removeEventListener("keydown", onKey);
      if (swarm.focus === el) swarm.focus = null;
    };
  }, [open]);

  useEffect(() => {
    output.current?.scrollTo({ top: output.current.scrollHeight });
  }, [lines]);

  // Run a command handed over by the palette (e.g. "achievements").
  // Read it from the store, not the render, so it runs only once.
  const pending = useStore(terminalCommand);
  useEffect(() => {
    const command = terminalCommand.get();
    if (!open || !command) return;
    terminalCommand.set(null);
    run(command);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pending]);

  const leave = (action: () => void) => {
    close();
    requestAnimationFrame(action);
  };

  const run = (raw: string) => {
    const line = raw.trim();
    print(
      <>
        <span className="text-signal">{PROMPT}</span> {line}
      </>,
      "in",
    );
    if (!line) return;
    history.current.unshift(line);
    const [cmd, ...args] = line.split(/\s+/);
    const arg = args.join(" ");

    switch (cmd.toLowerCase()) {
      case "help":
        print(
          <ul>
            {HELP.map(([c, d]) => (
              <li key={c} className="grid grid-cols-[11rem_1fr] gap-2">
                <span className="text-bone">{c}</span>
                <span>{tr(d)}</span>
              </li>
            ))}
          </ul>,
        );
        break;
      case "whoami":
        print(
          <>
            <span className="text-bone">{profile.name}</span> ·{" "}
            {tr(ui.roleLead)} {tr(ui.roleRest)} {tr(ui.roleAccent)} ·{" "}
            {tr(profile.location)}
          </>,
        );
        break;
      case "ls":
      case "projects":
        if (cmd === "projects" || args[0]?.replace(/\/$/, "") === "projects")
          print(
            <ul>
              {projects.map((p) => (
                <li key={p.slug} className="grid grid-cols-[11rem_1fr] gap-2">
                  <span className="text-bone">{p.slug}</span>
                  <span>
                    {p.title} · {p.year}
                  </span>
                </li>
              ))}
            </ul>,
          );
        else
          print(
            <>
              {navItems.map((n) => n.id).join("  ")}
              {"  "}
              <span className="text-bone">projects/</span>
            </>,
          );
        break;
      case "cd": {
        const id = (args[0] ?? "home").replace(/^[~/.]+$/, "home");
        if (!navItems.some((n) => n.id === id))
          print(tr(copy.noSection(id)), "err");
        else leave(() => goToSection(id));
        break;
      }
      case "open": {
        const slug = args[0]?.toLowerCase();
        if (!slug) print(tr(copy.usage("open <project>")), "err");
        else if (!projects.some((p) => p.slug === slug))
          print(tr(copy.noProject(slug)), "err");
        else
          leave(() => void navigate({ to: "/work/$slug", params: { slug } }));
        break;
      }
      case "experience":
        print(
          <ul className="space-y-1">
            {experience.map((job) => (
              <li key={job.org}>
                <span className="text-bone">{job.org}</span> · {tr(job.role)} ·{" "}
                {tr(job.period)}
              </li>
            ))}
          </ul>,
        );
        break;
      case "education":
        print(
          <ul className="space-y-1">
            {education.map((item) => (
              <li key={item.period}>
                <span className="text-bone">{tr(item.school)}</span> ·{" "}
                {tr(item.credential)} · {item.period}
              </li>
            ))}
          </ul>,
        );
        break;
      case "skills":
        print(SKILLS.map(([name]) => name).join(" · "));
        break;
      case "contact":
        print(
          <ul>
            <li>
              email{"  "}
              <a
                href={`mailto:${profile.email}`}
                className="text-bone underline"
              >
                {profile.email}
              </a>
            </li>
            <li>
              phone{"  "}
              <a href={profile.phone.href} className="text-bone underline">
                {profile.phone.label}
              </a>
            </li>
          </ul>,
        );
        break;
      case "cv":
        leave(() => void navigate({ to: "/cv" }));
        break;
      case "uses":
        print(
          <ul>
            {useGroups.map((g) => (
              <li key={g.id} className="mt-1">
                <span className="text-bone">{tr(g.title)}</span>
                {g.items.map((item) => (
                  <span key={item.name} className="block pl-4">
                    {tr(item.kind)}: {item.name}
                  </span>
                ))}
              </li>
            ))}
            <li className="mt-1">→ /uses</li>
          </ul>,
        );
        break;
      case "date": {
        const time = new Intl.DateTimeFormat("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: profile.timeZone,
        }).format(new Date());
        print(
          <>
            <span className="text-bone">{time}</span> · {tr(profile.location)} ·{" "}
            {tr(ui.status[localStatus(profile.timeZone)])}
          </>,
        );
        break;
      }
      case "faceit": {
        const f = gaming.faceit;
        if (!f) break;
        const l = f.lifetime;
        print(
          <ul>
            <li>
              <span className="text-bone">
                {f.nickname} · level {f.level} · {f.elo} ELO
              </span>
              {f.regionRank !== null && ` · ${f.region} #${f.regionRank}`}
            </li>
            {l && (
              <li>
                {l.matches} matches · {l.winRate}% wins · K/D {l.kd} · HS{" "}
                {l.headshots}% · ADR {Math.round(l.adr)}
              </li>
            )}
            {f.matches.slice(0, 5).map((m, i) => (
              <li key={i}>
                <span className={m.win ? "text-signal" : "text-[#FF7A45]"}>
                  {m.win ? "W" : "L"}
                </span>{" "}
                {m.map} {m.score[0]}:{m.score[1]} · {m.kills}/{m.deaths}/
                {m.assists} · {m.delta >= 0 ? "+" : ""}
                {m.delta} ELO
              </li>
            ))}
          </ul>,
        );
        break;
      }
      case "steam": {
        const s = gaming.steam;
        if (!s) break;
        print(
          <ul>
            <li>
              <span className="text-bone">
                {s.persona} · level {s.level}
              </span>{" "}
              · {s.cs2Hours?.toLocaleString("en-US")} {tr(copy.hours)} ·{" "}
              {s.recentHours} h / 2 wk
            </li>
            {s.recent.map((g) => (
              <li key={g.name}>
                {g.name} · {g.hours.toLocaleString("en-US")} h
              </li>
            ))}
          </ul>,
        );
        break;
      }
      case "play": {
        const id = args[0]?.toLowerCase();
        if (!id)
          print(
            <ul>
              {games.map((g) => (
                <li key={g.id} className="grid grid-cols-[11rem_1fr] gap-2">
                  <span className="text-bone">{g.id}</span>
                  <span>{tr(g.title)}</span>
                </li>
              ))}
            </ul>,
          );
        else if (!games.some((g) => g.id === id))
          print(tr(copy.noGame(id)), "err");
        else
          leave(
            () => void navigate({ to: "/play/$game", params: { game: id } }),
          );
        break;
      }
      case "achievements": {
        const have = unlocked.get();
        print(
          <>
            <p className="text-bone">
              {tr(ui.achievementsLabel)} {have.size}/{achievements.length}
            </p>
            <ul>
              {achievements.map((a) => (
                <li key={a.id} className="grid grid-cols-[1.5rem_1fr] gap-1">
                  <span className={have.has(a.id) ? "text-signal" : ""}>
                    {have.has(a.id) ? "✓" : "·"}
                  </span>
                  <span>
                    {have.has(a.id) ? (
                      <span className="text-bone">{tr(a.title)}</span>
                    ) : (
                      <>??? · {tr(a.hint)}</>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </>,
        );
        break;
      }
      case "link": {
        if (!arg) {
          print(tr(copy.linkUsage), "err");
          break;
        }
        const url = personalLink(arg);
        void navigator.clipboard?.writeText(url).catch(() => {});
        print(
          <>
            <span className="text-bone">{url}</span> · {tr(copy.copied)}
          </>,
          "ok",
        );
        break;
      }
      case "lang":
        if (args[0] !== "en" && args[0] !== "mn")
          print(tr(copy.usage("lang <en|mn>")), "err");
        else {
          setLang(args[0]);
          print(copy.lang[args[0]], "ok");
        }
        break;
      case "sound":
        if (args[0] !== "on" && args[0] !== "off")
          print(tr(copy.usage("sound <on|off>")), "err");
        else {
          setSound(args[0] === "on");
          print(`${tr(copy.sound)}: ${args[0]}`, "ok");
        }
        break;
      case "replay":
        leave(replayBuild);
        break;
      case "party":
        print(tr(copy.party), "ok");
        startParty();
        break;
      case "echo":
        print(arg);
        break;
      case "rm":
        print(tr(copy.rm), "err");
        break;
      case "sudo":
        if (/^hire\s+(b\.?\s*)?bilguun$/i.test(arg)) {
          print(<>{tr(copy.password)}********</>);
          setTimeout(() => {
            print(tr(copy.granted), "ok");
            unlock("sudo");
          }, 700);
          setTimeout(() => {
            window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(copy.hireSubject)}`;
          }, 1600);
        } else print(tr(copy.sudoOther), "err");
        break;
      case "clear":
        setLines([]);
        break;
      case "exit":
        close();
        break;
      default:
        print(tr(copy.notFound(cmd)), "err");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value);
      setValue("");
      cursor.current = -1;
      click({ pitch: 1.2, gain: 0.03 });
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const max = history.current.length - 1;
      cursor.current = Math.max(
        -1,
        Math.min(max, cursor.current + (e.key === "ArrowUp" ? 1 : -1)),
      );
      setValue(cursor.current < 0 ? "" : history.current[cursor.current]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const [cmd, ...rest] = value.split(" ");
      if (rest.length === 0) {
        const match = COMMANDS.filter((c) => c.startsWith(cmd.toLowerCase()));
        if (match.length === 1) setValue(`${match[0]} `);
        else if (match.length > 1) print(match.join("  "));
      } else {
        // Complete the argument: projects, sections or games.
        const pool =
          cmd === "open"
            ? projects.map((p) => p.slug)
            : cmd === "cd"
              ? navItems.map((n) => n.id)
              : cmd === "play"
                ? games.map((g) => g.id)
                : [];
        const part = rest.join(" ");
        const match = pool.filter((p) => p.startsWith(part));
        if (match.length === 1) setValue(`${cmd} ${match[0]}`);
        else if (match.length > 1) print(match.join("  "));
      }
    } else if (e.key === "`" && !value) {
      e.preventDefault();
      close();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  if (!open) return null;

  // Portalled: the page content is transformed, which breaks position: fixed.
  return createPortal(
    <div
      ref={panel}
      role="dialog"
      aria-label={tr(ui.terminal)}
      className="fixed inset-x-0 top-0 z-[72] flex h-[min(62vh,560px)] flex-col border-b border-signal/40 bg-ink/95 font-mono text-[13px] leading-relaxed text-fog shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur-md"
      onClick={() => input.current?.focus()}
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-2 text-[11px] uppercase tracking-[0.18em]">
        <span>
          <span className="text-signal">●</span> zsh · bilguun
        </span>
        <button
          type="button"
          onClick={close}
          className="transition-colors hover:text-bone"
        >
          esc
        </button>
      </div>
      <div
        ref={output}
        className="flex-1 overflow-y-auto overscroll-contain px-5 py-4"
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={
              line.kind === "err"
                ? "text-[#FF7A45]"
                : line.kind === "ok"
                  ? "text-signal"
                  : line.kind === "in"
                    ? "mt-2 text-bone"
                    : ""
            }
          >
            {line.body}
          </div>
        ))}
        <label className="mt-2 flex items-center gap-2 text-bone">
          <span className="shrink-0 text-signal">{PROMPT}</span>
          <input
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label={tr(ui.terminal)}
            className="min-w-0 flex-1 bg-transparent caret-signal outline-none"
          />
        </label>
      </div>
    </div>,
    document.body,
  );
};

export default Terminal;
