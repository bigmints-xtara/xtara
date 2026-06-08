"use client";


import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n/language-provider";

interface WaitlistButtonProps {
  className?: string;
  label?: string;
  href?: string;
  eventLabel?: string;
}

declare global {
  interface Window {
    showWaitlistModal?: () => void;
    __waitlistModalRegistry?: Record<string, { open: () => void; close: () => void }>;
  }
}

const WaitlistButton = ({
  className,
  label,
  href = "#",
  eventLabel,
}: WaitlistButtonProps) => {
  const { t } = useTranslations();
  const resolvedLabel = label ?? t("header.cta.joinWaitlist");
  // Hardcoded token from the user request
  const WAITLIST_TOKEN = "75bab487d01a9e0fdbd7657e";

  const handleWaitlistClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Track the analytics event
    trackEvent({
      action: "cta_click",
      category: "engagement",
      label: eventLabel ?? label ?? "waitlist_trigger",
    });

    // Suggestion: Try standard function first
    if (typeof window !== "undefined" && window.showWaitlistModal) {
      window.showWaitlistModal();
      return;
    }

    // Fallback: Check registry
    if (
      typeof window !== "undefined" &&
      window.__waitlistModalRegistry &&
      window.__waitlistModalRegistry[WAITLIST_TOKEN]
    ) {
      window.__waitlistModalRegistry[WAITLIST_TOKEN].open();
      return;
    }

    console.warn("Waitlist modal function not found. Ensure the script is loaded.");
  };

  return (
    <Button
      className={cn(
        "rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all duration-300",
        className
      )}
      onClick={handleWaitlistClick}
    >
      {resolvedLabel}
    </Button>
  );
};

export default WaitlistButton;
