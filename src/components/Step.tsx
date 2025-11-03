import { useState } from 'react';
import CodeBlock from './CodeBlock';

type StepData = {
  section: 'course' | 'workshop';
  title: string;
  content: string; // markdown-friendly
  code?: string;
  explain?: string; // short hint below code
  quiz?: string; // reflection question
  diagram?: string; // optional image url
  meta?: {
    duration?: string;
    difficulty?: string;
    tags?: string[];
  };
  sandbox?: {
    template?: string;
    file?: string;
  };
  action?: string;
};

type StepProps = {
  step: StepData;
};

function renderMarkdown(md: string) {
  const escapeHtml = (str: string) =>
    str
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');

  const toHtmlInline = (text: string) => {
    let html = escapeHtml(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`([^`]+?)`/g, '<code>$1</code>');
    return html;
  };

  const lines = md.split('\n');
  const elements: JSX.Element[] = [];
  let listBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`}>
          {listBuffer.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: toHtmlInline(item) }} />
          ))}
        </ul>
      );
      listBuffer = [];
    }
  }

  for (const line of lines) {
    if (!line.trim()) {
      flushList();
      continue;
    }
    if (/^#\s+/.test(line)) {
      flushList();
      elements.push(<h1 key={`h1-${elements.length}`} dangerouslySetInnerHTML={{ __html: toHtmlInline(line.replace(/^#\s+/, '')) }} />);
      continue;
    }
    if (/^##\s+/.test(line)) {
      flushList();
      elements.push(<h2 key={`h2-${elements.length}`} dangerouslySetInnerHTML={{ __html: toHtmlInline(line.replace(/^##\s+/, '')) }} />);
      continue;
    }
    if (/^(-|\*)\s+/.test(line)) {
      listBuffer.push(line.replace(/^(-|\*)\s+/, ''));
      continue;
    }
    if (/^>\s+/.test(line)) {
      flushList();
      elements.push(
        <blockquote key={`q-${elements.length}`} dangerouslySetInnerHTML={{ __html: toHtmlInline(line.replace(/^>\s+/, '')) }} />
      );
      continue;
    }
    flushList();
    elements.push(<p key={`p-${elements.length}`} dangerouslySetInnerHTML={{ __html: toHtmlInline(line) }} />);
  }
  flushList();

  return <div className="step-content">{elements}</div>;
}

function getCodeFilePath(code?: string): string | null {
  if (!code) return null;
  // Extract file path from code comments like // components/TodoList.tsx or // app/page.tsx
  const match = code.match(/\/\/\s*(app\/|components\/)[^\s]+/);
  if (match) {
    const path = match[0].replace(/^\/\/\s*/, '').trim();
    return path;
  }
  return null;
}

function buildStackBlitzUrl(step: StepData): string {
  if (step.section !== 'workshop' || !step.code) {
    return `https://stackblitz.com`;
  }

  // Use Next.js 14 + TypeScript template
  const baseUrl = 'https://stackblitz.com/fork/github/vercel/next.js/tree/canary/examples/with-typescript-app-router';
  
  const file = step.sandbox?.file || getCodeFilePath(step.code) || 'app/page.tsx';
  const normalized = file.startsWith('/') ? file : `/${file}`;
  return `${baseUrl}?file=${encodeURIComponent(normalized)}`;
}

export default function Step({ step }: StepProps) {
  const filePath = step.sandbox?.file || getCodeFilePath(step.code);
  const isWorkshop = step.section === 'workshop';
  const [sandboxHelp, setSandboxHelp] = useState<boolean>(false);
  
  return (
    <article className="step" role="region" aria-label={step.title}>
      <h1 className="step-title">{step.title}</h1>
      {step.meta ? (
        <div className="meta">
          {step.meta.duration ? <span className="chip">{step.meta.duration}</span> : null}
          {step.meta.difficulty ? <span className="chip">{step.meta.difficulty}</span> : null}
          {step.meta.tags && step.meta.tags.length ? (
            <span className="chip tags">{step.meta.tags.join(' · ')}</span>
          ) : null}
        </div>
      ) : null}
      {renderMarkdown(step.content)}
      {step.diagram ? (
        <div className="diagram">
          <img src={step.diagram} alt="diagram" />
        </div>
      ) : null}
      <CodeBlock code={step.code} />
      {filePath ? (
        <div className="file-path">
          <code>{filePath}</code>
        </div>
      ) : null}
      {step.explain ? (
        <div className="explain">
          <strong>💡 Note:</strong> {step.explain}
        </div>
      ) : null}
      {step.code && isWorkshop ? (
        <div className="sandbox">
          <a
            className="btn small"
            href={buildStackBlitzUrl(step)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open in StackBlitz (Next.js)"
            onClick={(e) => {
              // If the browser blocks or fails to open, show help text
              setTimeout(() => {
                // simple hint always-on after click; real failure detection is limited
                setSandboxHelp(true);
              }, 200);
            }}
          >
            ▶ Open in StackBlitz (Next.js)
          </a>
          <div className="note">No sign-in required. Runs Next.js 14 + TS example by Vercel.</div>
          {sandboxHelp ? (
            <div className="explain" style={{ marginTop: 8 }}>
              If the sandbox does not open, copy the code above and run
              <code style={{ marginLeft: 6 }}>npx create-next-app@latest --typescript --app</code> locally.
            </div>
          ) : null}
        </div>
      ) : null}
      {!step.sandbox && isWorkshop ? (
        <p className="note">To try locally: run <code>npx create-next-app@latest --typescript --app</code></p>
      ) : null}
      {step.quiz ? (
        <div className="quiz">
          <strong>Reflect 💭</strong>
          <p>{step.quiz}</p>
        </div>
      ) : null}
    </article>
  );
}


