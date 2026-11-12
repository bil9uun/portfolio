import { BriefcaseMedical, Code, Laptop, type LucideIcon } from "lucide-react";

// TODO: Most of the content below is placeholder copy.
// Replace it with your real projects, experience and contact links.

export const profile = {
  name: "B.Bilguun",
  location: "Ulaanbaatar, Mongolia",
  timeZone: "Asia/Ulaanbaatar",
  email: "bilguunzx011030@gmail.com",
  phone: { label: "+976 8809 6710", href: "tel:+97688096710" },
  socials: [
    { label: "GitHub", href: "https://github.com/bil9uun/" }, // TODO
    { label: "LinkedIn", href: "https://www.linkedin.com/in/bil9uun/" }, // TODO
    { label: "Instagram", href: "https://www.instagram.com/bil9uun/" }, // TODO
    { label: "Facebook", href: "https://www.facebook.com/bil9uun/" }, // TODO
  ],
};

export const navItems = [
  "home",
  "expertise",
  "work",
  "experience",
  "education",
  "contact",
];

// Names shown on the multiplayer cursors: the main tools across my projects.
export const swarmNames = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind",
  "TanStack Query",
  "TanStack Router",
  "Zustand",
  "Jotai",
];

export type Expertise = { icon: LucideIcon; title: string; body: string };

export const expertise: Expertise[] = [
  {
    icon: Laptop,
    title: "Software engineering",
    body: "Full stack in TypeScript: React and Next.js on the front, Node.js and SQL on the back. Functional and object-oriented styles.",
  },
  {
    icon: Code,
    title: "Frontend development",
    body: "Over 2 years building React and Next.js apps: admin panels, dashboards and news sites for GS25, APU, NTV and Shunkhlai.",
  },
  {
    icon: BriefcaseMedical,
    title: "Medical background",
    body: "Six years of medical training at MNUMS. I listen first, work carefully under pressure and design for the people who use the product.",
  },
];

export type Project = {
  title: string;
  year: string;
  role: string;
  description: string;
  tags: string[];
  url: string;
  colors: [string, string];
};

// TODO: set `url` for projects that have a public link.
export const projects: Project[] = [
  {
    title: "NTV News",
    year: "2026",
    role: "News website",
    description:
      "Bilingual (Mongolian and English) news site for NTV, with reels, photo stories and a live weather map.",
    tags: ["Next.js", "Tailwind", "Jotai", "Turborepo"],
    url: "https://ntv.mn",
    colors: ["#FF4D4D", "#FF7A45"],
  },

  {
    title: "Shunkhlai Loyalty",
    year: "2026",
    role: "Admin panel",
    description:
      "Admin panel for Shunkhlai's loyalty programme. I built the meal-voucher module: voucher pools, category and product exclusions, and bulk assignment.",
    tags: ["Next.js", "MUI", "TanStack Query", "Turborepo"],
    url: "#",
    colors: ["#A57BFF", "#FF5CA8"],
  },
  {
    title: "GS25 Vendor Portal",
    year: "2025",
    role: "MD & vendor panels",
    description:
      "Where GS25 merchandisers and vendors work together: product, price and promotion requests, orders, returns, meetings and surveys.",
    tags: ["React", "TanStack Router", "TanStack Query", "Turborepo"],
    url: "https://vendor.dico.mn/auth/login",
    colors: ["#4D8DFF", "#2EC4D6"],
  },
  {
    title: "GS25 Parttime",
    year: "2025",
    role: "HQ & store-manager dashboards",
    description:
      "Part-time staffing for GS25 stores. HQ manages branches, employees, salaries and social insurance; store managers run shifts, wallets and time reports.",
    tags: ["React", "TanStack Router", "Mantine", "Next.js"],
    url: "#",
    colors: ["#FFB020", "#FF7A45"],
  },
  {
    title: "APU OnTap",
    year: "2024",
    role: "Admin panel & web app",
    description:
      "B2B ordering platform for APU. Stores order, pay and track assets on the web; the admin panel runs orders, products, customers, sales targets and permissions.",
    tags: ["Next.js", "TanStack Query", "Tailwind", "next-intl"],
    url: "#",
    colors: ["#22C55E", "#0E7C86"],
  },
  {
    title: "SG.MN",
    year: "2024",
    role: "Website & admin panel",
    description:
      "Corporate website for Shunkhlai Group with news, open positions and HR pages, plus the admin panel that manages them.",
    tags: ["Next.js", "Framer Motion", "i18next", "Ant Design"],
    url: "https://sg.mn",
    colors: ["#2EC4D6", "#22C55E"],
  },
  {
    title: "Khomyn Talyn Takhi",
    year: "2024",
    role: "NGO website",
    description:
      "Site for the NGO protecting the wild Takhi horses of Khomyn Tal. Four languages, light and dark themes, news, and a foal adoption flow where supporters name a foal and follow its journey.",
    tags: ["Next.js", "Tailwind", "i18n"],
    url: "https://takhi.mn/en",
    colors: ["#D9A441", "#7A9E4B"],
  },
];

export type TimelineItem = {
  period: string;
  role: string;
  org: string;
  summary: string;
  tags: string[];
};

export const experience: TimelineItem[] = [
  {
    period: "2024 — Now",
    role: "Frontend developer",
    org: "Zero technology LLC",
    summary:
      "Build admin panels, dashboards and websites end to end with React, Next.js and Node.js.",
    tags: ["React", "Next.js", "TypeScript", "Node.js", "SQL"],
  },
  {
    period: "Feb — May 2024",
    role: "Frontend developer",
    org: "Prohub LLC",
    summary: "Three months building frontend features in React.",
    tags: ["React", "JavaScript"],
  },
];

export type Education = {
  period: string;
  school: string;
  credential: string;
  level: string;
  gpa: number; // on a 4.0 scale
  note?: string;
};

export const education: Education[] = [
  {
    period: "2023 — 2024",
    school: "Pinecone Academy",
    credential: "Full stack development",
    level: "Professional program",
    gpa: 4.0,
    note: "Intensive program in JavaScript, React, Node.js and SQL.",
  },
  {
    period: "2017 — 2023",
    school: "Mongolian National University of Medical Sciences",
    credential: "Medical doctor",
    level: "Bachelor's degree",
    gpa: 3.2,
  },
  {
    period: "2007 — 2017",
    school: "School No. 93",
    credential: "Full secondary education",
    level: "Gifted and talented school",
    gpa: 3.9,
    note: "Represented the school in math, physics and chemistry olympiads and won around 15 medals.",
  },
];
