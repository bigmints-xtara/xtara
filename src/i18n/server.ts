import { cookies } from "next/headers";
import { defaultLocale, locales, localeCookieName, type Locale } from "./config";

export async function getLocaleFromCookie(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }
  return defaultLocale;
}
