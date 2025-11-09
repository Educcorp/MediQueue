import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traducciones
import commonES from './locales/es/common.json';
import commonEN from './locales/en/common.json';
import homeES from './locales/es/home.json';
import homeEN from './locales/en/home.json';
import takeTurnES from './locales/es/takeTurn.json';
import takeTurnEN from './locales/en/takeTurn.json';
import adminES from './locales/es/admin.json';
import adminEN from './locales/en/admin.json';
import consultorioES from './locales/es/consultorio.json';
import consultorioEN from './locales/en/consultorio.json';
import settingsES from './locales/es/settings.json';
import settingsEN from './locales/en/settings.json';
import validationES from './locales/es/validation.json';
import validationEN from './locales/en/validation.json';
import aboutES from './locales/es/about.json';
import aboutEN from './locales/en/about.json';
import tutorialES from './locales/es/tutorial.json';
import tutorialEN from './locales/en/tutorial.json';

// Recursos de traducción organizados por idioma y namespace
const resources = {
  es: {
    common: commonES,
    home: homeES,
    takeTurn: takeTurnES,
    admin: adminES,
    consultorio: consultorioES,
    settings: settingsES,
    validation: validationES,
    about: aboutES,
    tutorial: tutorialES
  },
  en: {
    common: commonEN,
    home: homeEN,
    takeTurn: takeTurnEN,
    admin: adminEN,
    consultorio: consultorioEN,
    settings: settingsEN,
    validation: validationEN,
    about: aboutEN,
    tutorial: tutorialEN
  }
};

i18n
  // Detector de idioma del navegador
  .use(LanguageDetector)
  // Conectar con React
  .use(initReactI18next)
  // Inicializar configuración
  .init({
    resources,
    fallbackLng: 'es', // Idioma por defecto si no se detecta
    defaultNS: 'common', // Namespace por defecto
    ns: ['common', 'home', 'takeTurn', 'admin', 'consultorio', 'settings', 'validation', 'about', 'tutorial'],
    
    detection: {
      // Orden de detección del idioma
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Clave en localStorage
      lookupLocalStorage: 'i18nextLng',
      // Cachear la selección del usuario
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false, // React ya escapa por defecto
      formatSeparator: ','
    },
    
    react: {
      useSuspense: false, // Desactivar suspense para evitar warnings
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p']
    },
    
    // Debug en desarrollo
    debug: process.env.NODE_ENV === 'development',
    
    // Separador de namespace
    keySeparator: '.',
    nsSeparator: ':',
  });

export default i18n;

