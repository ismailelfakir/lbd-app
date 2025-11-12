import { useState, useEffect, useCallback } from 'react';
import CodeBlock from '../../../components/CodeBlock';
import { useI18n } from '../../../i18n/context';

type StepBlock = 
  | { type: 'text'; content: string }
  | { type: 'code'; language?: string; content: string }
  | { type: 'explain'; content: string }
  | { type: 'quiz'; question: string; options: string[]; answer: string }
  | { type: 'action'; content: string };

type StepData = {
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

  // Check for quiz in blocks (new structure) or legacy quiz field
  const quizBlock = step.blocks?.find(b => b.type === 'quiz') as { type: 'quiz'; question: string; options: string[]; answer: string } | undefined;
  const legacyQuiz = step.quiz && typeof step.quiz === 'object' && 'question' in step.quiz ? step.quiz : null;
  const quizData = quizBlock || legacyQuiz;
  const isQCM = !!quizData;
  const maxAttempts = 3;
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
    if (!isQCM || !showQuiz || !quizData) return;
    const currentQuizData = quizData; // Store in local variable for TypeScript
    function handleKey(e: KeyboardEvent) {
      const num = parseInt(e.key);
      if (Number.isNaN(num)) return;
      if (num < 1 || num > currentQuizData.options.length) return;
      if (isFinalized) return;
      const option = currentQuizData.options[num - 1];
      handleAnswer(option, option === currentQuizData.answer);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isQCM, quizData, handleAnswer, showQuiz, isFinalized]);

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
          {step.blocks ? (
            // New blocks structure
            step.blocks
              .filter(block => block.type !== 'quiz' && block.type !== 'action')
              .map((block, idx) => {
                if (block.type === 'text') {
                  return <div key={idx}>{renderMarkdown(block.content)}</div>;
                }
                if (block.type === 'code') {
                  return <CodeBlock key={idx} code={block.content} language={block.language} />;
                }
                if (block.type === 'explain') {
                  return (
                    <div key={idx} className="explain-box">
                      <div className="explain-box-header">
                        <svg className="explain-box-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21h6"></path>
                          <path d="M12 3a6 6 0 0 0-6 6c0 2.5 1.5 4.5 3 6"></path>
                          <path d="M12 3a6 6 0 0 1 6 6c0 2.5-1.5 4.5-3 6"></path>
                          <path d="M9 15h6"></path>
                        </svg>
                        <h4 className="explain-box-title">{t('explanation')}</h4>
                      </div>
                      <div className="explain-box-content" dangerouslySetInnerHTML={{ __html: formatExplainText(block.content) }} />
                    </div>
                  );
                }
                return null;
              })
          ) : (
            // Legacy structure (backward compatibility)
            <>
              {step.content && renderMarkdown(step.content)}
              {step.diagram ? (
                <div className="diagram"><img src={step.diagram} alt="diagram" /></div>
              ) : null}
              {step.code && <CodeBlock code={step.code} />}
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
          )}
        </>
      ) : null}
      {showQuiz && isQCM && quizData ? (
        <div className="quiz-box">
          <h4>{quizData.question}</h4>
          <div className="quiz-options">
            {quizData.options.map((opt, idx) => (
              <button
                key={opt}
                className={`quiz-option ${selected === opt ? 'selected' : ''} ${selected && opt === quizData.answer ? 'correct' : ''} ${selected && selected === opt && opt !== quizData.answer ? 'incorrect' : ''}`}
                onClick={() => handleAnswer(opt, opt === quizData.answer)}
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
