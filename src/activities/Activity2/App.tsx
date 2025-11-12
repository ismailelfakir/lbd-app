import { useMemo, useState, useEffect } from 'react';
import Step from './components/Step';
import Sidebar from '../../components/Sidebar';
import { useI18n } from '../../i18n/context';
import stepsDataEn from '../../data/steps_en.json';
import stepsDataFr from '../../data/steps_fr.json';
import './styles.css';

type StepBlock = 
  | { type: 'text'; content: string }
  | { type: 'code'; language?: string; content: string }
  | { type: 'explain'; content: string }
  | { type: 'quiz'; question: string; options: string[]; answer: string }
  | { type: 'action'; content: string };

type StepItem = {
  section: 'course' | 'workshop';
  title: string;
  meta?: { duration?: string; difficulty?: string; tags?: string[] };
  blocks?: StepBlock[];
  // Legacy fields for backward compatibility (deprecated)
  content?: string;
  code?: string;
  explain?: string;
  quiz?: string | { question: string; options: string[]; answer: string };
  diagram?: string;
  sandbox?: { template?: string; file?: string };
  action?: string;
};

export default function App() {
  const { language, t } = useI18n();
  const steps = useMemo<StepItem[]>(() => {
    const allSteps = (language === 'fr' ? stepsDataFr : stepsDataEn) as StepItem[];
    return allSteps.filter(step => step.section === 'workshop');
  }, [language]);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem(`lbd.activity2.step.${language}`);
    return saved ? Number(saved) || 0 : 0;
  });

  // Load step index for current language when language changes
  useEffect(() => {
    const saved = localStorage.getItem(`lbd.activity2.step.${language}`);
    if (saved) {
      const savedIndex = Number(saved) || 0;
      // Ensure index is within bounds
      setCurrentIndex(Math.min(savedIndex, steps.length - 1));
    } else {
      setCurrentIndex(0);
    }
    setShowQuiz(false);
    setQuizAnswered(false);
  }, [language, steps.length]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('lbd.theme') as 'light' | 'dark') || 'light');

  const total = steps.length;
  const current = steps[currentIndex];
  const isComplete = currentIndex === total - 1;
  // Check for quiz in blocks (new structure) or legacy quiz field
  const hasQuizBlock = current?.blocks?.some(b => b.type === 'quiz');
  const hasLegacyQuiz = current?.quiz && (typeof current.quiz === 'object' ? 'question' in current.quiz : true);
  const hasQuiz = hasQuizBlock || hasLegacyQuiz;

  function goPrev() {
    if (showQuiz) {
      setShowQuiz(false);
      setQuizAnswered(false);
      return;
    }
    if (currentIndex === 0) return;
    triggerFade(() => {
      setCurrentIndex((i) => Math.max(0, i - 1));
      setShowQuiz(false);
      setQuizAnswered(false);
    });
  }
  function goNext() {
    if (showQuiz) {
      // Already showing quiz - only proceed if answered
      if (!quizAnswered) return;
      triggerFade(() => {
        if (currentIndex < total - 1) {
          setCurrentIndex((i) => Math.min(total - 1, i + 1));
          setShowQuiz(false);
          setQuizAnswered(false);
        }
      });
      return;
    }
    // Check if current step has quiz
    if (hasQuiz) {
      setShowQuiz(true);
      setQuizAnswered(false);
      return;
    }
    // No quiz, move to next step
    if (currentIndex === total - 1) return;
    triggerFade(() => setCurrentIndex((i) => Math.min(total - 1, i + 1)));
  }
  function handleStepChange(index: number) {
    // Disallow jumping ahead to unchecked steps
    if (index === currentIndex || index > currentIndex) return;
    triggerFade(() => {
      setCurrentIndex(index);
      setShowQuiz(false);
      setQuizAnswered(false);
    });
  }
  function restart() {
    triggerFade(() => setCurrentIndex(0));
    localStorage.removeItem('lbd.activity2.step');
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

  useEffect(() => {
    localStorage.setItem(`lbd.activity2.step.${language}`, String(currentIndex));
    setShowQuiz(false);
    setQuizAnswered(false);
  }, [currentIndex, language]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIndex, total, showQuiz, quizAnswered]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('lbd.theme', theme);
  }, [theme]);

  // Track current activity from path
  const [currentActivity, setCurrentActivity] = useState<'activity1' | 'activity2'>(() => {
    return window.location.pathname.startsWith('/activity2') ? 'activity2' : 'activity1';
  });

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
        activityTitle={t('workshop')}
        activitySubtitle="Next.js Learning"
      />
      <div className="main-content">
        <div className="workshop-progress-bar">
          <div className="workshop-progress-fill" style={{ width: `${((currentIndex + 1) / total) * 100}%` }} />
        </div>
        <div className="deck">
          <div className="workshop-header">
            <h2 className="workshop-title">
              {t('workshop')} – {t('step')} {currentIndex + 1} / {total}
              {showQuiz && <span className="quiz-indicator"> · {t('quizCheckpoint')}</span>}
            </h2>
          </div>
          <div className={`slide-wrapper ${isFading ? 'fade' : ''}`}>
            <Step step={current} showQuiz={showQuiz} onQuizAnswered={() => setQuizAnswered(true)} />
          </div>
          {isComplete ? (
            <div className="completion-message">
              <h2>{t('workshopCompleted')}</h2>
              <p>{t('congratulations')}</p>
              <button className="btn primary" onClick={restart}>{t('restartWorkshop')}</button>
            </div>
          ) : (
            <div className="step-navigation">
              <button 
                className="btn-nav-step" 
                onClick={goPrev} 
                disabled={currentIndex === 0 && !showQuiz} 
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
                disabled={(!showQuiz && currentIndex === total - 1) || (showQuiz && !quizAnswered)} 
                aria-label={`${t('next')} ${t('step')}`}
              >
                <span>{t('next')}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


