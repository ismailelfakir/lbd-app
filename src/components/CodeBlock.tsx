import { useState } from 'react';

type CodeBlockProps = {
  code?: string;
  language?: string;
};

const MAX_LINES_COLLAPSED = 15;

export default function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!code) return null;

  const lines = code.split('\n');
  const shouldShowExpand = lines.length > MAX_LINES_COLLAPSED;
  const displayLines = shouldShowExpand && !isExpanded 
    ? lines.slice(0, MAX_LINES_COLLAPSED)
    : lines;
  const displayCode = displayLines.join('\n');

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch (_) {
      // ignore
    }
  }

  return (
    <div className="codeblock">
      <div className="codeblock-bar">
        <span className="badge">{language}</span>
        <div className="codeblock-actions">
          {shouldShowExpand && (
            <button 
              className="btn small" 
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Collapse code' : 'Expand code'}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          )}
          <button className="btn small" onClick={copy} aria-label="Copy code">Copy</button>
        </div>
      </div>
      <pre className={shouldShowExpand && !isExpanded ? 'codeblock-collapsed' : ''}>
        <code>{displayCode}</code>
        {shouldShowExpand && !isExpanded && (
          <div className="codeblock-fade" />
        )}
      </pre>
    </div>
  );
}


