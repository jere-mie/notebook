import { useEffect, useId, useMemo, useRef, useState } from 'react';
import mermaid from 'mermaid';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import clike from 'react-syntax-highlighter/dist/esm/languages/prism/clike';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import diff from 'react-syntax-highlighter/dist/esm/languages/prism/diff';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin';
import lua from 'react-syntax-highlighter/dist/esm/languages/prism/lua';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import powershell from 'react-syntax-highlighter/dist/esm/languages/prism/powershell';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import r from 'react-syntax-highlighter/dist/esm/languages/prism/r';
import regex from 'react-syntax-highlighter/dist/esm/languages/prism/regex';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import scala from 'react-syntax-highlighter/dist/esm/languages/prism/scala';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import type { Theme } from '../types';

const MARKDOWN_REMARK_PLUGINS = [remarkGfm, remarkMath];
const MARKDOWN_REHYPE_PLUGINS = [rehypeKatex];
const MARKDOWN_CODE_LANGUAGE_ALIASES: Record<string, string> = {
  html: 'markup',
  xml: 'markup',
  shell: 'bash',
  sh: 'bash',
  zsh: 'bash',
  console: 'bash',
  terminal: 'bash',
  js: 'javascript',
  mjs: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  mts: 'typescript',
  tsx: 'tsx',
  yml: 'yaml',
  md: 'markdown',
  ps1: 'powershell',
  pwsh: 'powershell',
  cs: 'csharp',
  'c#': 'csharp',
  dockerfile: 'docker',
  patch: 'diff',
  diff: 'diff',
  kt: 'kotlin',
  rs: 'rust',
  py: 'python',
  rb: 'ruby',
  tex: 'latex',
};

SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('clike', clike);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('diff', diff);
SyntaxHighlighter.registerLanguage('docker', docker);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('kotlin', kotlin);
SyntaxHighlighter.registerLanguage('lua', lua);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('markup', markup);
SyntaxHighlighter.registerLanguage('powershell', powershell);
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('r', r);
SyntaxHighlighter.registerLanguage('regex', regex);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('ruby', ruby);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('scala', scala);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('swift', swift);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('yaml', yaml);

const CODE_THEME_LIGHT = {
  ...vs,
  'code[class*="language-"]': {
    ...(vs['code[class*="language-"]'] ?? {}),
    background: 'transparent',
    textShadow: 'none',
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  },
  'pre[class*="language-"]': {
    ...(vs['pre[class*="language-"]'] ?? {}),
    background: 'transparent',
    textShadow: 'none',
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  },
};

const CODE_THEME_DARK = {
  ...vscDarkPlus,
  'code[class*="language-"]': {
    ...(vscDarkPlus['code[class*="language-"]'] ?? {}),
    background: 'transparent',
    textShadow: 'none',
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  },
  'pre[class*="language-"]': {
    ...(vscDarkPlus['pre[class*="language-"]'] ?? {}),
    background: 'transparent',
    textShadow: 'none',
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  },
};

interface MermaidBlockProps {
  chart: string;
  theme: Theme;
}

function MermaidBlock({ chart, theme }: MermaidBlockProps) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const renderId = useId().replace(/:/g, '');
  const pointerStateRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const renderDiagram = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: theme === 'dark' ? 'dark' : 'default',
          fontFamily: "Aptos, Segoe UI Variable Text, Segoe UI, Helvetica Neue, Arial, sans-serif",
        });

        const { svg: renderedSvg } = await mermaid.render(`nb-mermaid-${renderId}`, chart);

        if (cancelled) return;
        setSvg(renderedSvg);
        setError(null);
        setScale(1);
        setOffset({ x: 0, y: 0 });
      } catch (renderError) {
        if (cancelled) return;
        setSvg('');
        setError(renderError instanceof Error ? renderError.message : 'Unable to render Mermaid diagram.');
      }
    };

    void renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart, renderId, theme]);

  const zoomIn = () => setScale((current) => Math.min(3, Number((current + 0.2).toFixed(2))));
  const zoomOut = () => setScale((current) => Math.max(0.4, Number((current - 0.2).toFixed(2))));
  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!svg) return;
    pointerStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointerState = pointerStateRef.current;
    if (!pointerState || pointerState.pointerId !== event.pointerId) return;
    setOffset({
      x: pointerState.originX + (event.clientX - pointerState.startX),
      y: pointerState.originY + (event.clientY - pointerState.startY),
    });
  };

  const finishPointerInteraction = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointerState = pointerStateRef.current;
    if (!pointerState || pointerState.pointerId !== event.pointerId) return;
    pointerStateRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!svg || !event.ctrlKey) return;
    event.preventDefault();
    setScale((current) => {
      const delta = event.deltaY < 0 ? 0.12 : -0.12;
      return Math.min(3, Math.max(0.4, Number((current + delta).toFixed(2))));
    });
  };

  if (error) {
    return (
      <div className="nb-mermaid-block">
        <div className="nb-mermaid-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="nb-mermaid-block">
      <div className="nb-mermaid-toolbar">
        <div className="nb-mermaid-toolbar-group">
          <button type="button" className="nb-mermaid-btn" onClick={zoomOut} aria-label="Zoom out diagram">-</button>
          <button type="button" className="nb-mermaid-btn" onClick={zoomIn} aria-label="Zoom in diagram">+</button>
          <button type="button" className="nb-mermaid-btn" onClick={resetView} aria-label="Reset diagram view">Reset</button>
        </div>
        <span className="nb-mermaid-zoom-label">{Math.round(scale * 100)}%</span>
      </div>
      {svg ? (
        <div
          className={`nb-mermaid-viewport${isDragging ? ' is-dragging' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointerInteraction}
          onPointerCancel={finishPointerInteraction}
          onWheel={handleWheel}
        >
          <div
            className="nb-mermaid-diagram"
            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      ) : (
        <div className="nb-mermaid-loading">Rendering Mermaid diagram...</div>
      )}
    </div>
  );
}

interface MarkdownPreviewProps {
  content: string;
  theme: Theme;
}

export default function MarkdownPreview({ content, theme }: MarkdownPreviewProps) {
  const codeTheme = useMemo(() => (theme === 'dark' ? CODE_THEME_DARK : CODE_THEME_LIGHT), [theme]);

  return (
    <ReactMarkdown
      remarkPlugins={MARKDOWN_REMARK_PLUGINS}
      rehypePlugins={MARKDOWN_REHYPE_PLUGINS}
      components={{
        pre({ children }) {
          return <>{children}</>;
        },
        code({ className, children, ...props }) {
          const rawCode = String(children).replace(/\n$/, '');
          const detectedLanguage = /language-([\w-]+)/.exec(className ?? '')?.[1]?.toLowerCase();
          const language = detectedLanguage ? (MARKDOWN_CODE_LANGUAGE_ALIASES[detectedLanguage] ?? detectedLanguage) : undefined;

          if (language === 'mermaid') {
            return <MermaidBlock chart={rawCode} theme={theme} />;
          }

          if (language) {
            return (
              <SyntaxHighlighter
                PreTag="div"
                language={language}
                style={codeTheme}
                customStyle={{
                  margin: 0,
                  padding: '18px 20px',
                  borderRadius: '16px',
                  border: '1px solid var(--nb-border)',
                  background: 'linear-gradient(180deg, color-mix(in srgb, var(--nb-surface) 82%, transparent), transparent), var(--nb-code-bg)',
                  fontSize: '13.5px',
                  overflowX: 'auto',
                }}
                codeTagProps={{
                  style: {
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  },
                }}
              >
                {rawCode}
              </SyntaxHighlighter>
            );
          }

          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content.trim() ? content : '_Nothing to preview yet._'}
    </ReactMarkdown>
  );
}