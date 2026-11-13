import { BriefcaseMedical, Code, Laptop, type LucideIcon } from "lucide-react";
import { t, type Text } from "@/lib/i18n";

// All visible copy is bilingual: t(english, mongolian).

export const profile = {
  name: "B.Bilguun",
  location: t("Ulaanbaatar, Mongolia", "Улаанбаатар, Монгол"),
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
  { id: "home", label: t("home", "нүүр") },
  { id: "expertise", label: t("expertise", "ур чадвар") },
  { id: "work", label: t("work", "төслүүд") },
  { id: "experience", label: t("experience", "туршлага") },
  { id: "play", label: t("play", "тоглоом") },
  { id: "afk", label: t("off the clock", "чөлөөт цаг") },
  { id: "contact", label: t("contact", "холбоо барих") },
];

export const sectionTitles = {
  expertise: t("Areas of expertise", "Мэргэшсэн чиглэл"),
  work: t("Projects", "Төслүүд"),
  experience: t(
    "From medicine to software engineering",
    "Анагаах ухаанаас програм хангамж руу",
  ),
  play: t("Take a break", "Жаахан амар"),
  afk: t("When I'm not coding", "Код бичээгүй үедээ"),
  contact: t("Have a project in mind?", "Хамтран ажиллах санаа байна уу?"),
};

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

export type Expertise = { icon: LucideIcon; title: Text; body: Text };

export const expertise: Expertise[] = [
  {
    icon: Laptop,
    title: t("Software engineering", "Програм хангамжийн инженерчлэл"),
    body: t(
      "Full-stack development in TypeScript, with React and Next.js on the client and Node.js on the server, working with both SQL and NoSQL (MongoDB) databases. Experienced in both functional and object-oriented programming.",
      "TypeScript дээр full stack хөгжүүлэлт хийдэг: клиент талд React, Next.js, сервер талд Node.js, өгөгдлийн санд SQL болон NoSQL (MongoDB). Функциональ болон объект хандалтат програмчлалын аль алинд туршлагатай.",
    ),
  },
  {
    icon: Code,
    title: t("Frontend development", "Фронтенд хөгжүүлэлт"),
    body: t(
      "More than two years of professional experience building React and Next.js applications, including admin panels, dashboards and news platforms for organisations such as GS25, APU, NTV and Shunkhlai Group.",
      "React, Next.js дээр хоёр жилээс дээш хугацаанд мэргэжлийн түвшинд ажиллаж, GS25, APU, NTV, Шунхлай Групп зэрэг байгууллагын админ панел, дашбоард, мэдээний платформыг хөгжүүлсэн.",
    ),
  },
  {
    icon: BriefcaseMedical,
    title: t("Medical background", "Анагаахын боловсрол"),
    body: t(
      "Six years of medical education at the Mongolian National University of Medical Sciences. That training shapes how I work: careful listening, precision under pressure and a focus on the people who use the product.",
      "Анагаахын Шинжлэх Ухааны Үндэсний Их Сургуульд 6 жил анагаах ухаанаар суралцсан. Энэ сургалт ажлын арга барилд минь шингэсэн: анхааралтай сонсох, ачаалал ихтэй үед ч нягт нямбай ажиллах, хэрэглэгчийг төвд тавих.",
    ),
  },
];

export type Project = {
  slug: string;
  title: string;
  year: string;
  role: Text;
  description: Text; // one paragraph for the list and preview card
  overview: Text; // case study intro
  built: Text[]; // case study: what I built
  tags: string[];
  url: string;
  colors: [string, string];
  /** How I came to the project: built it from scratch, or took it over. */
  involvement: "built" | "took-over";
};

export const involvementLabels = {
  built: t("Built from scratch", "Эхнээс нь бүтээсэн"),
  "took-over": t("Took over", "Хүлээн авч хөгжүүлсэн"),
};

// TODO: set `url` for projects that have a public link.
export const projects: Project[] = [
  {
    slug: "ntv",
    title: "NTV News",
    year: "2026",
    role: t("Website & Admin dashboard", "Вэбсайт ба админ дашбоард"),
    description: t(
      "NTV's bilingual news site, which I built end to end: news, TV and FM, weather, currency rates, quizzes and ten benefit calculators. I also supported the team on the newsroom admin.",
      "NTV-ийн хоёр хэлтэй мэдээний сайтыг эхнээс нь дуустал хийсэн: мэдээ, ТВ ба FM, цаг агаар, ханш, quiz, 10 тооцоолуур. Редакцийн админ дээр туслах хөгжүүлэгчээр ажилласан.",
    ),
    overview: t(
      "NTV's new platform is a Turborepo monorepo with a public news site, a newsroom admin and a shared UI package. I built the website end to end and worked on the admin as a supporting developer.",
      "NTV-ийн шинэ платформ нь Turborepo monorepo: олон нийтийн мэдээний сайт, редакцийн админ, хуваалцсан UI package. Вэбсайтыг эхнээс нь дуустал би хийсэн, админ дээр туслах хөгжүүлэгчээр ажилласан.",
    ),
    built: [
      t(
        "The whole public site in Mongolian and English: categories, articles, tags, search and a daily recap",
        "Монгол, англи хэлтэй сайтыг бүхэлд нь: ангилал, мэдээ, tag, хайлт, өдрийн тойм",
      ),
      t(
        "TV and FM pages with programme schedules and a video player",
        "Нэвтрүүлгийн хуваарь, видео тоглуулагчтай ТВ, FM хуудсууд",
      ),
      t(
        "Weather on SkyData's colour map, currency rates and horoscopes",
        "SkyData-ийн өнгөт газрын зурагтай цаг агаар, ханш, зурхай",
      ),
      t(
        "Ten social insurance calculators: pensions, maternity, unemployment and more",
        "Тэтгэвэр, жирэмсний, ажилгүйдлийн гэх мэт нийгмийн даатгалын 10 тооцоолуур",
      ),
      t(
        "Quizzes, a newsletter with confirm and unsubscribe, and draft previews for editors",
        "Quiz, баталгаажуулах ба цуцлах боломжтой newsletter, редакторуудад ноорог урьдчилан харах",
      ),
      t(
        "Sitemaps and on-demand page revalidation",
        "Sitemap, хуудсыг шаардлагатай үед нь шинэчлэх (on-demand revalidation)",
      ),
      t(
        "Admin, as a supporting developer: the news wizard with a Tiptap editor, an image editor, schedules, horoscope and comment moderation",
        "Админ, туслах хөгжүүлэгчээр: Tiptap editor-той мэдээний wizard, зургийн editor, хуваарь, зурхай, сэтгэгдлийн хяналт",
      ),
    ],
    tags: ["Next.js", "Tailwind", "Jotai", "Video.js", "Turborepo"],
    url: "https://ntv.mn",
    colors: ["#FF4D4D", "#FF7A45"],
    involvement: "built",
  },
  {
    slug: "shunkhlai-loyalty",
    title: "Shunkhlai Loyalty",
    year: "2026",
    role: t("Admin panel · maintainer", "Админ панел · хариуцсан хөгжүүлэгч"),
    description: t(
      "Took over the admin panel of Shunkhlai's loyalty programme from the previous developer, introduced the new Meal Voucher feature and resolved issues in the existing codebase.",
      "Шунхлайн лоялти хөтөлбөрийн админ панелыг өмнөх хөгжүүлэгчээс хүлээн авч хариуцан ажилласан. Хоолны ваучер (Meal Voucher) хэмээх шинэ функц нэвтрүүлж, одоо байгаа кодод засвар, сайжруулалт хийсэн.",
    ),
    overview: t(
      "The loyalty programme's admin panel is part of a Turborepo monorepo used by Shunkhlai's internal team. I assumed responsibility for the panel from the previous developer, maintained and improved the existing code, and designed and delivered the Meal Voucher feature from the ground up.",
      "Лоялти хөтөлбөрийн админ панел нь Шунхлайн дотоод багийн ашигладаг Turborepo monorepo-ийн нэг хэсэг. Уг панелыг өмнөх хөгжүүлэгчээс хүлээн авч хариуцан, одоо байгаа кодыг засварлан сайжруулж, Хоолны ваучер функцийг эхнээс нь хөгжүүлж нэвтрүүлсэн.",
    ),
    built: [
      t(
        "Took over the codebase from the previous developer and ensured continuity of development",
        "Кодын санг өмнөх хөгжүүлэгчээс хүлээн авч, хөгжүүлэлтийн тасралтгүй байдлыг хангасан",
      ),
      t(
        "Delivered the Meal Voucher feature: voucher pools with start and end times configurable to the minute and an optional pool owner",
        "Хоолны ваучер функцийг нэвтрүүлсэн: эхлэх, дуусах хугацааг минут хүртэл тохируулах, эзэмшигч заах боломжтой ваучерын pool",
      ),
      t(
        "Category and product exclusions with select-all support",
        "Ангилал болон бүтээгдэхүүнийг хасах, бүгдийг сонгох боломж",
      ),
      t(
        "Bulk voucher assignment with error reporting and a downloadable template",
        "Алдааны тайлан, татаж авах загвар бүхий ваучерыг бөөнөөр оноох хэсэг",
      ),
      t(
        "Remaining voucher count and customer phone columns to support customer service",
        "Харилцагчийн үйлчилгээнд зориулсан үлдэгдэл ваучерын тоо, утасны дугаарын багана",
      ),
      t(
        "Fixes to the existing code, including dependency security upgrades and console error resolution",
        "Одоо байгаа кодын засвар: dependency-ийн аюулгүй байдлын шинэчлэл, console алдааны засвар",
      ),
    ],
    tags: ["Next.js", "MUI", "TanStack Query", "Turborepo"],
    url: "#",
    colors: ["#A57BFF", "#FF5CA8"],
    involvement: "took-over",
  },
  {
    slug: "gs25-vendor-portal",
    title: "GS25 Vendor Portal",
    year: "2025",
    role: t(
      "Frontend developer · MD & vendor portals",
      "Фронтенд хөгжүүлэгч · MD ба нийлүүлэгчийн портал",
    ),
    description: t(
      "Collaboration portal between GS25's merchandising (MD) team and its vendors. I built the frontend of both web applications from scratch and remain responsible for it: product, price and promotion requests, orders, returns, meetings and surveys.",
      "GS25-ийн мерчандайзинг (MD) баг болон нийлүүлэгчдийн хамтын ажиллагааны портал. Хоёр вэб аппликейшны фронтендийг эхнээс нь бүтээж, хариуцан ажилладаг: бүтээгдэхүүн, үнэ, урамшууллын хүсэлт, захиалга, буцаалт, уулзалт, судалгаа.",
    ),
    overview: t(
      "The portal is a Turborepo monorepo with two Vite applications: one for GS25's merchandising (MD) team and one for its vendors. Requests flow between them: vendors submit products, prices and promotions, and the MD team reviews, transfers and approves them. I built the frontend of both applications from scratch and am responsible for it.",
      "Портал нь хоёр Vite аппликейшнтай Turborepo monorepo: нэг нь GS25-ийн мерчандайзинг (MD) багт, нөгөө нь нийлүүлэгчдэд зориулагдсан. Хүсэлтүүд хоёрын хооронд урсдаг: нийлүүлэгч бүтээгдэхүүн, үнэ, урамшууллаа илгээж, MD баг хянан шилжүүлж, баталгаажуулдаг. Хоёр аппликейшны фронтендийг эхнээс нь бүтээсэн бөгөөд хариуцан ажилладаг.",
    ),
    built: [
      t(
        "Full frontend development of both the MD and vendor applications",
        "MD болон нийлүүлэгчийн аппликейшны фронтендийг бүрэн хөгжүүлсэн",
      ),
      t(
        "Request workflows for products, prices, statuses, promotions and meetings, including transfer between MD staff",
        "Бүтээгдэхүүн, үнэ, төлөв, урамшуулал, уулзалтын хүсэлтийн урсгал, MD ажилтнуудын хооронд шилжүүлэх боломж",
      ),
      t(
        "Order, return and product stock management with filtering and order printing",
        "Шүүлтүүр, захиалга хэвлэх боломж бүхий захиалга, буцаалт, бүтээгдэхүүний үлдэгдлийн удирдлага",
      ),
      t(
        "Vendor onboarding through an application flow, and vendor and user management for the MD team",
        "Өргөдлийн урсгалаар нийлүүлэгч бүртгэх, MD багт нийлүүлэгч ба хэрэглэгчийн удирдлага",
      ),
      t(
        "Content and communication: FAQs, guides, posts, surveys, feedback and notifications",
        "Контент ба харилцаа: FAQ, заавар, нийтлэл, судалгаа, санал хүсэлт, мэдэгдэл",
      ),
      t(
        "Configurable request deadlines (days left) and a dashboard for each side",
        "Хүсэлтийн хугацааны (үлдсэн хоног) тохиргоо, тал бүрийн дашбоард",
      ),
    ],
    tags: ["React", "TanStack Router", "TanStack Query", "Turborepo"],
    url: "https://vendor.dico.mn/auth/login",
    colors: ["#4D8DFF", "#2EC4D6"],
    involvement: "built",
  },
  {
    slug: "gs25-parttime",
    title: "GS25 Parttime",
    year: "2025",
    role: t(
      "HQ & store-manager dashboards · maintainer",
      "Төв оффис ба дэлгүүрийн менежерийн дашбоард · хариуцсан хөгжүүлэгч",
    ),
    description: t(
      "Part-time staffing system for GS25 stores. I took over development midway, carried it through to release, and am responsible for both the HQ and store-manager (SM) dashboards.",
      "GS25 дэлгүүрүүдийн цагийн ажилтны систем. Хөгжүүлэлтийг дундаас нь хүлээн авч, үргэлжлүүлэн дуусгасан бөгөөд төв оффис (HQ) болон дэлгүүрийн менежерийн (SM) дашбоардыг хариуцан ажилладаг.",
    ),
    overview: t(
      "GS25 employs part-time staff across its stores. The HQ dashboard (React and Vite) manages branches, employees and payroll, while the store-manager dashboard (Next.js) supports day-to-day shift operations. I took over the project from the previous team midway through development, completed the remaining development, and continue to maintain both dashboards.",
      "GS25 олон дэлгүүртээ цагийн ажилтан ажиллуулдаг. Төв оффисын дашбоард (React, Vite) салбар, ажилтан, цалингийн бүртгэлийг удирдаж, дэлгүүрийн менежерийн дашбоард (Next.js) өдөр тутмын ээлжийн үйл ажиллагааг дэмждэг. Төслийг хөгжүүлэлтийн дундаас нь өмнөх багаас хүлээн авч, үлдсэн хөгжүүлэлтийг гүйцээж, хоёр дашбоардыг үргэлжлүүлэн хариуцаж байна.",
    ),
    built: [
      t(
        "Took over development midway and carried both dashboards through to release",
        "Хөгжүүлэлтийг дундаас нь хүлээн авч, хоёр дашбоардыг ашиглалтад оруулсан",
      ),
      t(
        "Employee records with civil ID, bank account and social insurance details",
        "Регистр, дансны дугаар, нийгмийн даатгалын мэдээлэл бүхий ажилтны бүртгэл",
      ),
      t(
        "Salary management by branch and by organisation, with filtering and sorting",
        "Салбар болон байгууллагаар цалингийн удирдлага, шүүлтүүр, эрэмбэлэлт",
      ),
      t(
        "Excel and CSV import and export for branches and branch funds",
        "Салбар, салбарын сангийн Excel, CSV импорт ба экспорт",
      ),
      t(
        "Store-manager features: branch-fund details, phone number updates and an in-app user guide",
        "Дэлгүүрийн менежерийн функц: салбарын сангийн дэлгэрэнгүй, утасны дугаар шинэчлэх, хэрэглэгчийн заавар",
      ),
      t(
        "Ongoing maintenance, including an upgrade from Next.js 14.0 to 14.2",
        "Тогтмол засвар үйлчилгээ, үүнд Next.js 14.0-оос 14.2 руу шинэчлэлт",
      ),
    ],
    tags: ["React", "TanStack Router", "Mantine", "Next.js"],
    url: "#",
    colors: ["#FFB020", "#FF7A45"],
    involvement: "took-over",
  },
  {
    slug: "apu-ontap",
    title: "APU OnTap",
    year: "2024",
    role: t(
      "Admin panel & customer web · lead developer",
      "Админ панел ба харилцагчийн вэб · хариуцсан хөгжүүлэгч",
    ),
    description: t(
      "B2B ordering platform connecting APU with the stores that sell its products. I developed both the admin panel and the customer web app, built all of their features, and remain responsible for both.",
      "APU-г бүтээгдэхүүнийг нь борлуулдаг дэлгүүрүүдтэй холбох B2B захиалгын платформ. Админ панел болон харилцагчийн вэб аппыг бүх функцтэй нь хөгжүүлсэн бөгөөд хоёуланг нь хариуцан ажилладаг.",
    ),
    overview: t(
      "OnTap connects APU with its retail partners. Stores use the customer web app to place orders, make payments and request equipment, while APU's team manages operations through the admin panel. I developed both applications and all of their features, and I am responsible for their ongoing development and maintenance.",
      "OnTap нь APU-г борлуулалтын түнш дэлгүүрүүдтэй нь холбодог. Дэлгүүрүүд харилцагчийн вэб аппаар захиалга өгч, төлбөр төлж, тоног төхөөрөмж хүсдэг бол APU-ийн баг үйл ажиллагаагаа админ панелаар удирддаг. Хоёр аппликейшныг бүх функцтэй нь хөгжүүлсэн бөгөөд цаашдын хөгжүүлэлт, засвар үйлчилгээг хариуцдаг.",
    ),
    built: [
      t(
        "Development of both the admin panel and the customer web app, including every feature",
        "Админ панел болон харилцагчийн вэб аппыг бүх функцтэй нь бүрэн хөгжүүлсэн",
      ),
      t(
        "Admin: order, product, brand and category management with configurable table columns, import and export",
        "Админ: багана тохируулах, импорт экспорттой захиалга, бүтээгдэхүүн, брэнд, ангиллын удирдлага",
      ),
      t(
        "Admin: customer management with detail and update pages, new customer and store requests, and customer and product dashboards",
        "Админ: дэлгэрэнгүй, засварын хуудастай харилцагчийн удирдлага, шинэ харилцагч ба дэлгүүрийн хүсэлт, харилцагч ба бүтээгдэхүүний дашбоард",
      ),
      t(
        "Admin: sales targets by channel, sales representatives and their routes, and quotas",
        "Админ: сувгаар борлуулалтын төлөвлөгөө, борлуулагч ба тэдний маршрут, квот",
      ),
      t(
        "Admin: asset and asset-request management, data synchronisation, activity logs, and role-based permissions",
        "Админ: хөрөнгө ба хөрөнгийн хүсэлтийн удирдлага, өгөгдлийн синхрончлол, үйлдлийн бүртгэл, эрхийн бүлгүүд",
      ),
      t(
        "Customer web: home with featured products, ordering, a cart with bank details, payment and finance",
        "Харилцагчийн вэб: онцлох бүтээгдэхүүнтэй нүүр, захиалга, банкны мэдээлэлтэй сагс, төлбөр, санхүү",
      ),
      t(
        "Customer web: fridge and POSM requests with image uploads, complaints, notifications and a help centre",
        "Харилцагчийн вэб: зураг хавсаргах боломжтой хөргөгч, POSM хүсэлт, гомдол, мэдэгдэл, тусламжийн төв",
      ),
      t(
        "Customer web: bilingual interface, terms acceptance and profile verification before ordering",
        "Харилцагчийн вэб: хоёр хэлтэй интерфэйс, захиалахаас өмнө нөхцөл зөвшөөрөх, профайл баталгаажуулах",
      ),
    ],
    tags: ["Next.js", "TanStack Query", "Tailwind", "next-intl"],
    url: "#",
    colors: ["#22C55E", "#0E7C86"],
    involvement: "built",
  },
  {
    slug: "sg-mn",
    title: "SG.MN",
    year: "2024",
    role: t(
      "Website & admin panel · maintainer",
      "Вэбсайт ба админ панел · хариуцсан хөгжүүлэгч",
    ),
    description: t(
      "Corporate website and admin panel of Shunkhlai Group. I took over both after the initial development was completed and am responsible for their maintenance, resolving bugs and delivering additional features.",
      "Шунхлай Группийн корпорацийн вэбсайт ба админ панел. Анхны хөгжүүлэлт дууссаны дараа хоёуланг нь хүлээн авч хариуцан ажилласан бөгөөд алдаа засварлах, нэмэлт функц хөгжүүлэх ажлыг гүйцэтгэдэг.",
    ),
    overview: t(
      "SG.MN is the corporate website of Shunkhlai Group, presenting its news, business sectors, management team and open positions, together with an admin panel for managing this content. After the initial development was completed, I took over responsibility for both applications, resolving reported issues and extending them with additional features.",
      "SG.MN нь Шунхлай Группийн мэдээ, бизнесийн чиглэл, удирдлагын баг, нээлттэй ажлын байрыг танилцуулдаг корпорацийн вэбсайт бөгөөд контентыг нь админ панелаар удирддаг. Анхны хөгжүүлэлт дууссаны дараа хоёр аппликейшныг хүлээн авч хариуцан, илэрсэн алдааг засварлаж, нэмэлт функцуудаар өргөжүүлсэн.",
    ),
    built: [
      t(
        "Took over the website and admin panel after the initial development and assumed responsibility for their maintenance",
        "Анхны хөгжүүлэлт дууссаны дараа вэбсайт болон админ панелыг хүлээн авч, засвар үйлчилгээг хариуцсан",
      ),
      t(
        "Resolved bugs across the website and admin panel",
        "Вэбсайт болон админ панелын алдаануудыг засварласан",
      ),
      t(
        "Added a language switcher and English translations to the website",
        "Вэбсайтад хэл солигч болон англи орчуулга нэмсэн",
      ),
      t(
        "Extended open positions with search, pagination, detail pages and share buttons",
        "Нээлттэй ажлын байрыг хайлт, хуудаслалт, дэлгэрэнгүй хуудас, хуваалцах товчоор өргөжүүлсэн",
      ),
      t(
        "Added CV form validation with clear messages and Open Graph tags for sharing",
        "CV илгээх формын шалгалт, мэдэгдэл болон хуваалцахад зориулсан Open Graph tag нэмсэн",
      ),
      t(
        "Admin: user removal and PDF form download",
        "Админ: хэрэглэгч устгах, формыг PDF-ээр татах боломж",
      ),
    ],
    tags: ["Next.js", "Framer Motion", "i18next", "Ant Design"],
    url: "https://sg.mn",
    colors: ["#2EC4D6", "#22C55E"],
    involvement: "took-over",
  },
  {
    slug: "takhi",
    title: "Khomyn Talyn Takhi",
    year: "2024",
    role: t("Website · frontend developer", "Вэбсайт · фронтенд хөгжүүлэгч"),
    description: t(
      "Website of Khomyn Talyn Takhi, the NGO protecting the wild Takhi horses of Khomyn Tal. I carried out the full frontend development: four languages, light and dark themes, foal adoption, donations, tourism booking, a shop and more than twenty content pages.",
      "Хомын талын зэрлэг тахийг хамгаалдаг Хомын Талын Тахь ТББ-ын вэбсайт. Фронтенд хөгжүүлэлтийг бүрэн гүйцэтгэсэн: 4 хэл, гэрэл ба бараан горим, унага өргөж авах, хандив, аялал захиалга, дэлгүүр болон 20 гаруй контент хуудас.",
    ),
    overview: t(
      "Khomyn Talyn Takhi is the NGO behind the reintroduction and protection of the wild Takhi horse at Khomyn Tal. The website presents its conservation work, research and tourism to an international audience and invites visitors to support the programme. I was responsible for the entire frontend development of the website.",
      "Хомын Талын Тахь ТББ нь Хомын талд зэрлэг тахийг нутагшуулах, хамгаалах ажлыг хариуцдаг. Вэбсайт нь байгууллагын хамгаалалтын ажил, судалгаа, аялал жуулчлалыг олон улсын зочдод танилцуулж, хөтөлбөрийг дэмжихийг урьдаг. Вэбсайтын фронтенд хөгжүүлэлтийг бүхэлд нь хариуцсан.",
    ),
    built: [
      t(
        "Full frontend development of the website, from the home page to more than twenty content pages",
        "Вэбсайтын фронтендийг нүүр хуудаснаас эхлээд 20 гаруй контент хуудастай нь бүрэн хөгжүүлсэн",
      ),
      t(
        "Four languages (Mongolian, English, German and French) with locale-based routing, plus light and dark themes",
        "Хэлээр ялгасан routing бүхий 4 хэл (монгол, англи, герман, франц), гэрэл ба бараан горим",
      ),
      t(
        "Foal adoption and donation flows for supporters",
        "Дэмжигчдэд зориулсан унага өргөж авах, хандив өгөх урсгал",
      ),
      t(
        "Tourism pages with the Takhi eco camp and tour booking, and a shop with product pages",
        "Тахь эко кэмп, аялал захиалга бүхий аялал жуулчлалын хуудсууд, бүтээгдэхүүний хуудастай дэлгүүр",
      ),
      t(
        "Conservation content: reintroduction with an interactive map, research, national park management, the team and partners",
        "Хамгаалалтын контент: интерактив газрын зурагтай нутагшуулалт, судалгаа, үндэсний паркийн менежмент, баг, түншүүд",
      ),
      t(
        "News, blog, a photo gallery with a lightbox, FAQ, reviews and a contact form",
        "Мэдээ, блог, lightbox бүхий фото галерей, FAQ, сэтгэгдэл, холбоо барих форм",
      ),
    ],
    tags: ["Next.js", "Tailwind", "next-intl", "Framer Motion"],
    url: "https://takhi.mn/en",
    colors: ["#D9A441", "#7A9E4B"],
    involvement: "built",
  },
];

export type TimelineItem = {
  period: Text;
  /** Start and end as decimal years, for the career track; null = now. */
  span: [number, number | null];
  role: Text;
  org: string;
  summary: Text;
  tags: string[];
};

export const experience: TimelineItem[] = [
  {
    period: t("Sep 2024 — Now", "2024.09 — Одоо"),
    span: [2024.67, null],
    role: t("Frontend developer", "Фронтенд хөгжүүлэгч"),
    org: "Zero technology LLC",
    summary: t(
      "Develop and maintain admin panels, dashboards and websites end to end with React, Next.js and Node.js.",
      "React, Next.js, Node.js ашиглан админ панел, дашбоард, вэбсайтыг эхнээс нь бүрэн хөгжүүлж, засвар үйлчилгээг нь хариуцдаг.",
    ),
    tags: ["React", "Next.js", "TypeScript", "Node.js", "SQL"],
  },
  {
    period: t("Feb — May 2024", "2024.02 — 2024.05"),
    span: [2024.08, 2024.33],
    role: t("Frontend developer", "Фронтенд хөгжүүлэгч"),
    org: "Prohub LLC",
    summary: t(
      "Developed frontend features in React over a three-month engagement.",
      "Гурван сарын хугацаанд React дээр фронтендийн функцуудыг хөгжүүлсэн.",
    ),
    tags: ["React", "JavaScript"],
  },
];

export type Education = {
  period: string;
  span: [number, number];
  school: Text;
  credential: Text;
  level: Text;
  gpa: number; // on a 4.0 scale
  note?: Text;
};

export const education: Education[] = [
  {
    period: "2023 — 2024",
    span: [2023, 2024],
    school: t("Pinecone Academy", "Pinecone Академи"),
    credential: t("Full-stack development", "Full stack хөгжүүлэлт"),
    level: t("Professional training program", "Мэргэшүүлэх сургалтын хөтөлбөр"),
    gpa: 4.0,
    note: t(
      "Intensive program covering JavaScript, React, Node.js and SQL.",
      "JavaScript, React, Node.js, SQL-ийг хамарсан эрчимжүүлсэн сургалтын хөтөлбөр.",
    ),
  },
  {
    period: "2017 — 2023",
    span: [2017, 2023],
    school: t(
      "Mongolian National University of Medical Sciences",
      "Анагаахын Шинжлэх Ухааны Үндэсний Их Сургууль",
    ),
    credential: t("Medical Doctor", "Хүний их эмч"),
    level: t("Bachelor's degree", "Бакалавр"),
    gpa: 3.2,
  },
  {
    period: "2007 — 2017",
    span: [2007, 2017],
    school: t("School No. 93", "Гоц авьяастны 93-р сургууль"),
    credential: t("Full secondary education", "Бүрэн дунд боловсрол"),
    level: t("Gifted and talented school", "Гоц авьяастны сургууль"),
    gpa: 3.9,
    note: t(
      "Represented the school in mathematics, physics and chemistry olympiads, winning approximately 15 medals.",
      "Математик, физик, химийн олимпиадад сургуулиа төлөөлөн оролцож, 15 орчим медаль хүртсэн.",
    ),
  },
];
