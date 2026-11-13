// Personal links: /?hi=Golomt%20team greets that visitor by name on the hero.
// The name is kept for the visit, so it survives moving between pages.

const clean = (value: string | null) =>
  value?.replace(/\s+/g, " ").trim().slice(0, 40) || null;

const fromUrl = clean(new URLSearchParams(window.location.search).get("hi"));
if (fromUrl) {
  try {
    sessionStorage.setItem("guest", fromUrl);
  } catch {
    // ignore
  }
}

const fromVisit = () => {
  try {
    return clean(sessionStorage.getItem("guest"));
  } catch {
    return null;
  }
};

export const guestName = fromUrl ?? fromVisit();

export const personalLink = (name: string) =>
  `${window.location.origin}/?hi=${encodeURIComponent(name.trim())}`;
