const DEFAULT_NEXT_PATH = "/app";

export const getSafeNextPath = (candidate?: string | null, fallback = DEFAULT_NEXT_PATH) => {
  if (!candidate) {
    return fallback;
  }

  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }

  return candidate;
};

export const getAppBaseUrl = () =>
  (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const getRuntimeBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return getAppBaseUrl();
};

export const buildAuthCallbackUrl = (nextPath = DEFAULT_NEXT_PATH) =>
  `${getRuntimeBaseUrl()}/auth/callback?next=${encodeURIComponent(getSafeNextPath(nextPath))}`;
