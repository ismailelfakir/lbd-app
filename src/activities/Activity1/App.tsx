import { useMemo, useState, useEffect } from 'react';
import Step from './components/Step';
import Sidebar from '../../components/Sidebar';
import { useI18n } from '../../i18n/context';
import stepsDataEn from './data/steps_course_en.json';
import stepsDataFr from './data/steps_course_fr.json';
import './styles.css';

type StepItem = {
  section: 'course' | 'workshop';
  title: string;
  content: string;
  code?: string;
  explain?: string;
  quiz?: string;
  diagram?: string;
  meta?: { duration?: string; difficulty?: string; tags?: string[] };
  sandbox?: { template?: string; file?: string };
  action?: string;
};

export default function App() {
  const { language, t } = useI18n();
  const steps = useMemo<StepItem[]>(() => {
    return (language === 'fr' ? stepsDataFr : stepsDataEn) as StepItem[];
  }, [language]);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem(`lbd.activity1.step.${language}`);
    return saved ? Number(saved) || 0 : 0;
  });

  // Load step index for current language when language changes
  useEffect(() => {
    const saved = localStorage.getItem(`lbd.activity1.step.${language}`);
    if (saved) {
      const savedIndex = Number(saved) || 0;
      // Ensure index is within bounds
      setCurrentIndex(Math.min(savedIndex, steps.length - 1));
    } else {
      setCurrentIndex(0);
    }
  }, [language, steps.length]);
  const [isFading, setIsFading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('lbd.theme') as 'light' | 'dark') || 'light');

  const total = steps.length;
  const current = steps[currentIndex];

  function goPrev() {
    if (currentIndex === 0) return;
    triggerFade(() => setCurrentIndex((i) => Math.max(0, i - 1)));
  }
  function goNext() {
    if (currentIndex === total - 1) return;
    triggerFade(() => setCurrentIndex((i) => Math.min(total - 1, i + 1)));
  }
  function handleStepChange(index: number) {
    if (index === currentIndex) return;
    triggerFade(() => setCurrentIndex(index));
  }
  function triggerFade(change: () => void) {
    setIsFading(true);
    setTimeout(() => { change(); setIsFading(false); }, 200);
  }

  function handleActivitySwitch(activity: 'activity1' | 'activity2') {
    if (window.location.pathname !== `/${activity}`) {
      history.pushState({}, '', `/${activity}`);
      window.dispatchEvent(new Event('popstate'));
      setCurrentActivity(activity);
    }
  }

  function handleThemeToggle() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  // Track current activity from path
  const [currentActivity, setCurrentActivity] = useState<'activity1' | 'activity2'>(() => {
    return window.location.pathname.startsWith('/activity2') ? 'activity2' : 'activity1';
  });

  useEffect(() => {
    localStorage.setItem(`lbd.activity1.step.${language}`, String(currentIndex));
  }, [currentIndex, language]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIndex, total]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('lbd.theme', theme);
  }, [theme]);

  useEffect(() => {
    const updateActivity = () => {
      setCurrentActivity(window.location.pathname.startsWith('/activity2') ? 'activity2' : 'activity1');
    };
    updateActivity();
    window.addEventListener('popstate', updateActivity);
    return () => window.removeEventListener('popstate', updateActivity);
  }, []);

  return (
    <div className="app-container-with-sidebar">
      <Sidebar
        steps={steps}
        currentIndex={currentIndex}
        onStepChange={handleStepChange}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        onActivitySwitch={handleActivitySwitch}
        currentActivity={currentActivity}
        activityTitle={t('theory')}
        activitySubtitle="Next.js Learning"
      />
      <div className="main-content">
        <div className="deck">
          <div className="progress-bar"><div className="bar" style={{ width: `${((currentIndex + 1) / total) * 100}%` }} /></div>
          <div className={`slide-wrapper ${isFading ? 'fade' : ''}`}>
            <Step step={current} />
          </div>
          <div className="step-navigation">
            <button 
              className="btn-nav-step" 
              onClick={goPrev} 
              disabled={currentIndex === 0} 
              aria-label={`${t('previous')} ${t('step')}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>{t('previous')}</span>
            </button>
            <button 
              className="btn-nav-step primary" 
              onClick={goNext} 
              disabled={currentIndex === total - 1} 
              aria-label={`${t('next')} ${t('step')}`}
            >
              <span>{t('next')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


