import { useState, useEffect, useCallback } from 'react';
import CodeBlock from '../../../components/CodeBlock';
import { useI18n } from '../../../i18n/context';

type StepData = {
  section: 'course' | 'workshop';
  title: string;
  content: string;
  code?: string;
  explain?: string;
  quiz?: string | { question: string; options: string[]; answer: string };
  diagram?: string;
  meta?: { duration?: string; difficulty?: string; tags?: string[] };
  sandbox?: { template?: string; file?: string };
};

function formatExplainText(text: string): string {
  const esc = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  let html = esc(text);
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

function renderMarkdown(md: string) {
  const esc = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const toInline = (s: string) => {
    let html = esc(s);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/\n/g, '<br>');
    return html;
  };
  
  const lines = md.split('\n');
  const out: JSX.Element[] = [];
  let list: string[] = [];
  const flush = () => { if (list.length) { out.push(<ul key={`ul-${out.length}`}>{list.map((i, k) => <li key={k} dangerouslySetInnerHTML={{ __html: toInline(i) }} />)}</ul>); list = []; } };
  for (const line of lines) {
    if (!line.trim()) { flush(); continue; }
    if (/^#\s+/.test(line)) { flush(); out.push(<h1 key={`h1-${out.length}`} dangerouslySetInnerHTML={{ __html: toInline(line.replace(/^#\s+/, '')) }} />); continue; }
    if (/^##\s+/.test(line)) { flush(); out.push(<h2 key={`h2-${out.length}`} dangerouslySetInnerHTML={{ __html: toInline(line.replace(/^##\s+/, '')) }} />); continue; }
    if (/^(-|\*)\s+/.test(line)) { list.push(line.replace(/^(-|\*)\s+/, '')); continue; }
    if (/^>\s+/.test(line)) { flush(); out.push(<blockquote key={`q-${out.length}`} dangerouslySetInnerHTML={{ __html: toInline(line.replace(/^>\s+/, '')) }} />); continue; }
    flush(); out.push(<p key={`p-${out.length}`} dangerouslySetInnerHTML={{ __html: toInline(line) }} />);
  }
  flush();
  return <div className="step-content">{out}</div>;
}

export default function Step({ step, showQuiz, onQuizAnswered }: { step: StepData; showQuiz: boolean; onQuizAnswered?: () => void }) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);

  const isQCM = step.quiz && typeof step.quiz === 'object' && 'question' in step.quiz;
  const maxAttempts = 3;
  const quizData = (step.quiz as { question: string; options: string[]; answer: string }) || null;
  const isFinalized = !!feedback && (feedback.includes('✅') || attempts >= maxAttempts);

  const handleAnswer = useCallback((option: string, isCorrect: boolean) => {
    if (!quizData) return;

    // If quiz already finalized, ignore further input
    if (isFinalized) return;

    if (isCorrect) {
      setSelected(option);
      setFeedback(`✅ ${t('correct')}`);
      if (onQuizAnswered) onQuizAnswered();
      return;
    }

    // Incorrect answer path
    setSelected(option);
    setAttempts((prev) => {
      const nextAttempts = prev + 1;
      if (nextAttempts >= maxAttempts) {
        // Reveal correct answer and finalize
        setSelected(quizData.answer);
        setFeedback(`✅ ${t('correct')}`);
        if (onQuizAnswered) onQuizAnswered();
      } else {
        setFeedback(`❌ ${t('tryAgain')}`);
      }
      return nextAttempts;
    });
  }, [onQuizAnswered, quizData, isFinalized, t]);

  useEffect(() => {
    setSelected(null);
    setFeedback(null);
    setAttempts(0);
  }, [step.title, showQuiz]);

  useEffect(() => {
    if (!isQCM || !showQuiz) return;
    const quiz = step.quiz as { question: string; options: string[]; answer: string };
    function handleKey(e: KeyboardEvent) {
      const num = parseInt(e.key);
      if (Number.isNaN(num)) return;
      if (num < 1 || num > quiz.options.length) return;
      if (isFinalized) return;
      const option = quiz.options[num - 1];
      handleAnswer(option, option === quiz.answer);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isQCM, step.quiz, handleAnswer, showQuiz, isFinalized]);

  return (
    <article className="step" role="region" aria-label={step.title}>
      <h1 className="step-title">{step.title}</h1>
      {step.meta ? (
        <div className="meta-badges">
          {step.meta.duration ? <span className="meta-badge">{step.meta.duration}</span> : null}
          {step.meta.difficulty ? <span className="meta-badge">{step.meta.difficulty}</span> : null}
          {step.meta.tags && step.meta.tags.length ? (
            <span className="meta-badge tags">{step.meta.tags.join(' · ')}</span>
          ) : null}
        </div>
      ) : null}
      {!showQuiz ? (
        <>
          {renderMarkdown(step.content)}
          {step.diagram ? (
            <div className="diagram"><img src={step.diagram} alt="diagram" /></div>
          ) : null}
          <CodeBlock code={step.code} />
          {step.explain ? (
            <div className="explain-box">
              <div className="explain-box-header">
                <svg className="explain-box-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21h6"></path>
                  <path d="M12 3a6 6 0 0 0-6 6c0 2.5 1.5 4.5 3 6"></path>
                  <path d="M12 3a6 6 0 0 1 6 6c0 2.5-1.5 4.5-3 6"></path>
                  <path d="M9 15h6"></path>
                </svg>
                <h4 className="explain-box-title">{t('explanation')}</h4>
              </div>
              <div className="explain-box-content" dangerouslySetInnerHTML={{ __html: formatExplainText(step.explain) }} />
            </div>
          ) : null}
          {step.sandbox?.file ? (
            <p className="note">{t('toTryLocally')} <code>npx create-next-app@latest --typescript --app</code></p>
          ) : null}
        </>
      ) : null}
      {showQuiz && isQCM ? (
        <div className="quiz-box">
          <h4>{(step.quiz as { question: string; options: string[]; answer: string }).question}</h4>
          <div className="quiz-options">
            {(step.quiz as { question: string; options: string[]; answer: string }).options.map((opt, idx) => (
              <button
                key={opt}
                className={`quiz-option ${selected === opt ? 'selected' : ''} ${selected && opt === (step.quiz as { question: string; options: string[]; answer: string }).answer ? 'correct' : ''} ${selected && selected === opt && opt !== (step.quiz as { question: string; options: string[]; answer: string }).answer ? 'incorrect' : ''}`}
                onClick={() => handleAnswer(opt, opt === (step.quiz as { question: string; options: string[]; answer: string }).answer)}
                disabled={isFinalized}
                aria-label={`Option ${idx + 1}: ${opt}`}
              >
                <span className="quiz-option-number">{idx + 1}</span>
                {opt}
              </button>
            ))}
          </div>
          {feedback && <p className={`quiz-feedback ${feedback.includes('✅') ? 'correct' : 'incorrect'}`}>{feedback}</p>}
          {!isFinalized ? (
            <p className="quiz-attempts" aria-live="polite">
              {attempts}/{maxAttempts}
            </p>
          ) : null}
        </div>
      ) : showQuiz && step.quiz && typeof step.quiz === 'string' ? (
        <div className="reflect-box">
          <h4>{t('reflect')}</h4>
          <p>{step.quiz}</p>
        </div>
      ) : null}
    </article>
  );
}
