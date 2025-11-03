type CodeBlockProps = {
  code?: string;
  language?: string;
};

export default function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
  if (!code) return null;

  async function copy() {
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
        <button className="btn small" onClick={copy} aria-label="Copy code">Copy</button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}


