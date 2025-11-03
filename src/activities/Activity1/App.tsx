import { useMemo, useState, useEffect } from 'react';
import Step from './components/Step';
import Navigation from './components/Navigation';
import stepsData from './data/steps_course.json';
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
  const steps = useMemo<StepItem[]>(() => stepsData as StepItem[], []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

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
  function triggerFade(change: () => void) {
    setIsFading(true);
    setTimeout(() => { change(); setIsFading(false); }, 200);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIndex, total]);

  return (
    <div className="app-container">
      <div className="deck">
        <div className="progress-bar"><div className="bar" style={{ width: `${((currentIndex + 1) / total) * 100}%` }} /></div>
        <div className={`slide-wrapper ${isFading ? 'fade' : ''}`}>
          <Step step={current} />
        </div>
        <div className="progress" aria-live="polite">{currentIndex + 1} / {total}</div>
        <Navigation onPrev={goPrev} onNext={goNext} disablePrev={currentIndex === 0} disableNext={currentIndex === total - 1} variant="side" />
      </div>
    </div>
  );
}


