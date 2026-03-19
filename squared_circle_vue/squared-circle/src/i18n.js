import i18next from 'i18next'
import pl from './lang/pl.json'
import en from './lang/en.json'

export function setupI18n(language = 'pl') {
  return i18next.init({
    lng: language,
    fallbackLng: 'pl',
    resources: {
      pl: { translation: pl },
      en: { translation: en },
    },
    interpolation: { escapeValue: false },
  })
}

export function t(key, opts) {
  return i18next.t(key, opts)
}

export function changeLanguage(lang) {
  return i18next.changeLanguage(lang)
}

export default i18next
