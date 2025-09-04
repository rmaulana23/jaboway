import { idLocales } from '../data/locales';

export const t = (key: string, replacements?: Record<string, string | number>): string => {
  let str = idLocales[key] || key;
  if (replacements) {
    Object.keys(replacements).forEach(rKey => {
      str = str.replace(`{${rKey}}`, String(replacements[rKey]));
    });
  }
  return str;
};