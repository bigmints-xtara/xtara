export const GA_MEASUREMENT_ID = "G-1J324NZLJS";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

type GtagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export const trackPageview = (url: string) => {
  if (typeof window === "undefined" || !("gtag" in window)) {
    return;
  }
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

export const trackEvent = ({ action, category, label, value }: GtagEvent) => {
  if (typeof window === "undefined" || !("gtag" in window)) {
    return;
  }
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
};
