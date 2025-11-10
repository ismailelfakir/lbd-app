export type Language = 'en' | 'fr';

export type TranslationKey = 
  | 'activities'
  | 'theory'
  | 'workshop'
  | 'steps'
  | 'progress'
  | 'darkMode'
  | 'lightMode'
  | 'previous'
  | 'next'
  | 'step'
  | 'of'
  | 'quizCheckpoint'
  | 'workshopCompleted'
  | 'congratulations'
  | 'restartWorkshop'
  | 'reflect'
  | 'correct'
  | 'incorrect'
  | 'tryAgain'
  | 'explanation'
  | 'copy'
  | 'openInStackBlitz'
  | 'toTryLocally'
  | 'noSignInRequired'
  | 'expandSidebar'
  | 'collapseSidebar'
  | 'switchToDarkMode'
  | 'switchToLightMode'
  | 'language'
  | 'english'
  | 'french';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    activities: 'Activities',
    theory: 'Theory',
    workshop: 'Workshop',
    steps: 'Steps',
    progress: 'Progress',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    previous: 'Previous',
    next: 'Next',
    step: 'Step',
    of: 'of',
    quizCheckpoint: 'Quiz Checkpoint',
    workshopCompleted: 'Workshop Completed',
    congratulations: 'Congratulations! You\'ve completed the Next.js 14 To-Do App Workshop.',
    restartWorkshop: 'Restart Workshop',
    reflect: 'Reflect',
    correct: 'Correct!',
    incorrect: 'Try again',
    tryAgain: 'Try again',
    explanation: 'Explanation',
    copy: 'Copy',
    openInStackBlitz: 'Open in StackBlitz (Next.js)',
    toTryLocally: 'To try locally, run',
    noSignInRequired: 'No sign-in required. Runs Next.js 14 + TS example by Vercel.',
    expandSidebar: 'Expand sidebar',
    collapseSidebar: 'Collapse sidebar',
    switchToDarkMode: 'Switch to dark mode',
    switchToLightMode: 'Switch to light mode',
    language: 'Language',
    english: 'English',
    french: 'Français',
  },
  fr: {
    activities: 'Activités',
    theory: 'Théorie',
    workshop: 'Atelier',
    steps: 'Étapes',
    progress: 'Progression',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',
    previous: 'Précédent',
    next: 'Suivant',
    step: 'Étape',
    of: 'sur',
    quizCheckpoint: 'Point de contrôle',
    workshopCompleted: 'Atelier terminé',
    congratulations: 'Félicitations ! Vous avez terminé l\'atelier Next.js 14 To-Do App.',
    restartWorkshop: 'Redémarrer l\'atelier',
    reflect: 'Réfléchir',
    correct: 'Correct !',
    incorrect: 'Réessayer',
    tryAgain: 'Réessayer',
    explanation: 'Explication',
    copy: 'Copier',
    openInStackBlitz: 'Ouvrir dans StackBlitz (Next.js)',
    toTryLocally: 'Pour essayer localement, exécutez',
    noSignInRequired: 'Aucune connexion requise. Exécute l\'exemple Next.js 14 + TS de Vercel.',
    expandSidebar: 'Développer la barre latérale',
    collapseSidebar: 'Réduire la barre latérale',
    switchToDarkMode: 'Passer en mode sombre',
    switchToLightMode: 'Passer en mode clair',
    language: 'Langue',
    english: 'English',
    french: 'Français',
  },
};

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang][key] || translations.en[key];
}

