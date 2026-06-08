"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locales, type Locale } from "@/i18n/config";
import { useTranslations } from "@/i18n/language-provider";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslations();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{t("languageSwitcher.label")}</span>
      <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
        <SelectTrigger size="sm" className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {locales.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {t(`languageSwitcher.options.${loc}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
