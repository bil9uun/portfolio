import { createStore, readSetting, useStore, writeSetting } from "@/lib/store";

export type Lang = "en" | "mn";
export type Text = Record<Lang, string>;

export const t = (en: string, mn: string): Text => ({ en, mn });

const initial = (): Lang => {
  const saved = readSetting("lang");
  if (saved === "en" || saved === "mn") return saved;
  return navigator.language.toLowerCase().startsWith("mn") ? "mn" : "en";
};

export const langStore = createStore<Lang>(initial());
document.documentElement.lang = langStore.get();

export function setLang(lang: Lang) {
  langStore.set(lang);
  writeSetting("lang", lang);
  document.documentElement.lang = lang;
}

export const useLang = () => useStore(langStore);

// Returns a translator for the current language.
export function useT() {
  const lang = useLang();
  return (text: Text) => text[lang];
}

// Interface copy. Content lives in src/data/portfolio.ts.
export const ui = {
  openToWork: t("Open to new projects", "Шинэ төсөлд нээлттэй"),
  roleLead: t("Software engineer,", "Програм хангамжийн инженер,"),
  roleRest: t("Full stack", "Full stack"),
  roleAccent: t("developer", "хөгжүүлэгч"),
  localTime: t("local time", "цаг"),
  scrollHint: t("Scroll|to explore", "Доош|гүйлгэнэ үү"),
  menu: t("Menu", "Цэс"),
  close: t("Close", "Хаах"),
  copyEmail: t("Copy email", "Имэйл хуулах"),
  emailCopied: t("Email copied", "Имэйл хуулагдлаа"),
  contactIntro: t(
    "I'm open to frontend and full stack roles and freelance work. Write to me and I'll reply within a day.",
    "Фронтенд, full stack ажил болон freelance төсөлд нээлттэй. Бичээрэй, нэг өдрийн дотор хариулна.",
  ),
  backToTop: t("Back to top", "Дээш буцах"),
  replay: t("Replay build", "Дахин бүтээх"),
  soundOn: t("Sound on", "Дуу асаалттай"),
  soundOff: t("Sound off", "Дуу унтраалттай"),
  shortcuts: t(
    "⌘K commands · / chat · I inspect",
    "⌘K команд · / чат · I inspect",
  ),
  gpa: t("GPA", "Голч"),
  // Case study
  backToWork: t("Back to work", "Төслүүд рүү буцах"),
  overview: t("Overview", "Тойм"),
  whatIBuilt: t("What I built", "Миний хийсэн"),
  role: t("Role", "Үүрэг"),
  year: t("Year", "Он"),
  stack: t("Stack", "Технологи"),
  visitSite: t("Visit site", "Сайт үзэх"),
  nextProject: t("Next project", "Дараагийн төсөл"),
  notFound: t("This project doesn't exist.", "Ийм төсөл олдсонгүй."),
  viewCase: t("View case study", "Дэлгэрэнгүй үзэх"),
  // Command palette
  searchCommands: t(
    "Type a command or search…",
    "Команд эсвэл хайх үгээ бичнэ үү…",
  ),
  noResults: t("No results.", "Илэрц олдсонгүй."),
  goTo: t("Go to", "Шилжих"),
  projects: t("Projects", "Төслүүд"),
  actions: t("Actions", "Үйлдэл"),
  links: t("Links", "Холбоосууд"),
  switchLang: t("Монгол хэл рүү шилжих", "Switch to English"),
  inspect: t("Inspect mode", "Inspect горим"),
  inspectHint: t(
    "Inspect mode · hover anything · Esc to exit",
    "Inspect горим · дурын зүйл дээр очно уу · Esc дарж гарна",
  ),
  toggleSound: t("Turn sound on or off", "Дуу асаах / унтраах"),
  chat: t("Chat with the cursors", "Cursor-уудтай чатлах"),
  chatPlaceholder: t("Say something…", "Юм бичээрэй…"),
  call: t("Call", "Залгах"),
  play: t("Play", "Тоглох"),
  allGames: t("All games", "Бүх тоглоом"),
};
