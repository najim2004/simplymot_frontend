const RETURN_URL_KEY = "book-my-mot-return-url";
const SCROLL_POSITION_KEY = "book-my-mot-results-scroll";

/** Persist search results URL and scroll position before opening garage details. */
export function saveBookMyMotResultsContext(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    RETURN_URL_KEY,
    `${window.location.pathname}${window.location.search}`,
  );
  sessionStorage.setItem(SCROLL_POSITION_KEY, String(window.scrollY));
}

/** Read and clear saved scroll position when returning to search results. */
export function consumeBookMyMotScrollPosition(): number | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SCROLL_POSITION_KEY);
  sessionStorage.removeItem(SCROLL_POSITION_KEY);
  if (raw === null) return null;
  const y = Number.parseInt(raw, 10);
  return Number.isFinite(y) ? y : null;
}

export function getBookMyMotReturnUrl(fallback?: {
  registration?: string | null;
  postcode?: string | null;
  sortBy?: string | null;
  isLoggedIn?: string | null;
}): string {
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem(RETURN_URL_KEY);
    if (stored?.startsWith("/driver/book-my-mot")) {
      return stored;
    }
  }

  const params = new URLSearchParams();
  if (fallback?.registration) {
    params.set("registration", fallback.registration);
  }
  if (fallback?.postcode) {
    params.set("postcode", fallback.postcode);
  }
  if (fallback?.sortBy) {
    params.set("sort_by", fallback.sortBy);
  }
  if (fallback?.isLoggedIn) {
    params.set("is_logged_in", fallback.isLoggedIn);
  }

  const query = params.toString();
  return query ? `/driver/book-my-mot?${query}` : "/driver/book-my-mot";
}
