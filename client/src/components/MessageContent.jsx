import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css'; // <--- CRITICAL: Imports KaTeX CSS

const MessageContent = ({ content }) => {
  return (
    <div className="markdown-body text-sm leading-relaxed overflow-hidden">
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // 1. Handle Code Blocks
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="relative rounded-md overflow-hidden my-2">
                <div className="flex items-center justify-between bg-slate-800 px-4 py-1 text-xs text-slate-400 border-b border-white/5">
                  <span>{match[1]}</span>
                </div>
                <SyntaxHighlighter
                  {...props}
                  children={String(children).replace(/\n$/, '')}
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{ margin: 0, padding: '1rem', background: '#0f172a' }} // Matches bg-slate-900
                />
              </div>
            ) : (
              // Inline Code (e.g. `const x = 1`)
              <code {...props} className="bg-slate-800/50 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs">
                {children}
              </code>
            );
          },
          // 2. Handle Paragraphs (to prevent huge spacing)
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          // 3. Handle Links
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
              {children}
            </a>
          ),
          // 4. Handle Lists
          ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MessageContent;