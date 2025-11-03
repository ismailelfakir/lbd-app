import { useEffect, useMemo, useState } from 'react';
import Step from './components/Step';
import Navigation from './components/Navigation';
import stepsData from './data/steps.json';

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
  const steps = useMemo<StepItem[]>(() => stepsData as StepItem[], []);
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const saved = localStorage.getItem('lbd.currentStep');
    return saved ? Number(saved) || 0 : 0;
  });
  const [isFading, setIsFading] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('lbd.theme') as 'light' | 'dark') || 'light');

  useEffect(() => {
    localStorage.setItem('lbd.currentStep', String(currentIndex));
  }, [currentIndex]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('lbd.theme', theme);
  }, [theme]);

  const total = steps.length;
  const current = steps[currentIndex];
  const isWorkshop = current.section === 'workshop';
  const workshopSteps = steps.filter((s) => s.section === 'workshop');
  const currentWorkshopIndex = isWorkshop
    ? workshopSteps.findIndex((s) => steps.indexOf(s) === currentIndex)
    : -1;
  const workshopStepProgress = isWorkshop && currentWorkshopIndex >= 0
    ? `Step ${currentWorkshopIndex + 1} of ${workshopSteps.length}`
    : null;

  function goPrev() {
    if (currentIndex === 0) return;
    triggerFade(() => setCurrentIndex((i) => Math.max(0, i - 1)));
  }

  function goNext() {
    if (currentIndex === total - 1) {
      localStorage.setItem('lbd.completed', 'true');
      return;
    }
    if (current.action === 'start-workshop') {
      const firstWorkshopIndex = steps.findIndex((s) => s.section === 'workshop');
      if (firstWorkshopIndex >= 0) {
        triggerFade(() => setCurrentIndex(firstWorkshopIndex));
        return;
      }
    }
    triggerFade(() => setCurrentIndex((i) => Math.min(total - 1, i + 1)));
  }

  const courseLastIndex = useMemo(() => {
    let idx = -1;
    for (let i = 0; i < steps.length; i++) {
      if (steps[i].section === 'course') idx = i;
    }
    return idx;
  }, [steps]);

  function triggerFade(change: () => void) {
    setIsFading(true);
    // Match CSS animation duration
    setTimeout(() => {
      change();
      setIsFading(false);
    }, 200);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIndex, total, current]);

  return (
    <div className="app-container">
      <div className="deck">
        {isWorkshop ? (
          <div className="workshop-header">
            <span className="workshop-badge">⚡ Workshop Mode</span>
            {workshopStepProgress ? (
              <span className="workshop-progress">{workshopStepProgress}</span>
            ) : null}
          </div>
        ) : null}
        <div className="progress-bar"><div className="bar" style={{ width: `${((currentIndex + 1) / total) * 100}%` }} /></div>
        <div className={`slide-wrapper ${isFading ? 'fade' : ''}`}>
          <Step step={current} />
        </div>

        <div className="progress" aria-live="polite">
          {currentIndex + 1} / {total}
        </div>

        <div className="top-actions">
          <button
            className="btn small"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </div>

        <Navigation
          onPrev={goPrev}
          onNext={goNext}
          disablePrev={currentIndex === 0}
          disableNext={currentIndex === total - 1}
          variant="side"
        />

        {currentIndex === courseLastIndex && current.action === 'start-workshop' ? (
          <div className="cta hero">
            <button className="btn primary lg" onClick={goNext}>Start Workshop 🚀</button>
          </div>
        ) : null}

        {currentIndex === total - 1 ? (
          <div className="completion">
            <h2>🎓 Course Completed</h2>
            <p>You've practiced:</p>
            <ul>
              <li>Understanding Next.js App Router structure</li>
              <li>Managing state with <code>useState</code></li>
              <li>Handling events and rendering dynamically</li>
              <li>Building confidence through experimentation</li>
            </ul>
            <p>Keep experimenting and iterating — that's learning by doing!</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}


