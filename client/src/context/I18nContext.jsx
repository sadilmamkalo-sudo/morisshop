import { createContext, useContext, useState, useEffect } from 'react';
import ar from '../i18n/ar';
import fr from '../i18n/fr';
import en from '../i18n/en';

const translations = { ar, fr, en };
const I18nContext = createContext();

export function I18nProvider({ children }) {
  const saved = localStorage.getItem('lang');
  const [lang, setLang] = useState(saved || 'ar');

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = (path) => {
    const keys = path.split('.');
    let result = translations[lang];
    for (const key of keys) {
      result = result?.[key];
    }
    return result || path;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
