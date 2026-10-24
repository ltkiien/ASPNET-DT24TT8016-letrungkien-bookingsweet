import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DICTIONARIES, DEFAULT_LANG, LANGUAGES } from "./locales";

/**
 * Đa ngôn ngữ nhẹ, không cần thư viện ngoài.
 *
 *   const { t, lang, setLang, formatCurrency, formatDate } = useI18n();
 *   t("nav.home")                          -> "Trang chủ" / "Home"
 *   t("header.greeting", { name: "An" })   -> "Xin chào, An"
 *
 * - Ngôn ngữ được lưu trong localStorage ("lang") và gắn vào <html lang="...">
 * - Thiếu khóa ở ngôn ngữ hiện tại -> dùng tiếng Việt -> cuối cùng trả về chính khóa (dễ phát hiện khóa chưa dịch)
 * - Nếu sau này cần plural, namespace, tải từ server... có thể chuyển sang react-i18next mà vẫn giữ nguyên các khóa
 */

const STORAGE_KEY = "lang";
const LOCALE = { vi: "vi-VN", en: "en-US" };
const I18nContext = createContext(null);

const readSavedLang = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && DICTIONARIES[saved]) return saved;
  } catch {
    /* localStorage không khả dụng */
  }
  return DEFAULT_LANG;
};

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(readSavedLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((code) => {
    if (!DICTIONARIES[code]) return;
    setLangState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* bỏ qua */
    }
  }, []);

  const value = useMemo(() => {
    const t = (key, vars) => {
      let text = DICTIONARIES[lang]?.[key] ?? DICTIONARIES[DEFAULT_LANG]?.[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.replaceAll(`{${k}}`, String(v));
        });
      }
      return text;
    };
    const locale = LOCALE[lang] || LOCALE[DEFAULT_LANG];
    return {
      lang,
      setLang,
      languages: LANGUAGES,
      t,
      locale,
      // Tiền luôn là VND, chỉ đổi cách định dạng theo ngôn ngữ
      formatCurrency: (n) =>
        new Intl.NumberFormat(locale, { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n ?? 0),
      // Nhận chuỗi "YYYY-MM-DD" hoặc Date
      formatDate: (d, options = { day: "2-digit", month: "2-digit", year: "numeric" }) => {
        if (!d) return "—";
        const date = typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T00:00:00`) : new Date(d);
        return new Intl.DateTimeFormat(locale, options).format(date);
      },
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n phải được dùng bên trong <I18nProvider>");
  return ctx;
}