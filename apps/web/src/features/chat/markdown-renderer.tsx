"use client";

import type { ReactNode } from "react";

type MarkdownRendererProps = {
  content: string;
};

type Block =
  | { type: "code"; code: string; language: string }
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; lines: string[] }
  | { type: "paragraph"; text: string };

const inlinePattern =
  /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(inlinePattern)) {
    const fullMatch = match[0];
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      nodes.push(text.slice(lastIndex, matchIndex));
    }

    if (match[2] && match[3]) {
      nodes.push(
        <a
          key={`${matchIndex}-${fullMatch}`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--accent)] underline decoration-[color:var(--accent)]/45 underline-offset-4 transition hover:decoration-[color:var(--accent)]"
        >
          {match[2]}
        </a>,
      );
    } else if (match[5]) {
      nodes.push(
        <code
          key={`${matchIndex}-${fullMatch}`}
          className="rounded-md border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[0.92em] text-slate-100"
        >
          {match[5]}
        </code>,
      );
    } else if (match[7]) {
      nodes.push(
        <strong key={`${matchIndex}-${fullMatch}`} className="font-semibold text-white">
          {match[7]}
        </strong>,
      );
    } else if (match[9]) {
      nodes.push(
        <em key={`${matchIndex}-${fullMatch}`} className="italic text-slate-100">
          {match[9]}
        </em>,
      );
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].trimStart().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      blocks.push({
        type: "code",
        code: codeLines.join("\n"),
        language,
      });
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];

      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }

      blocks.push({ type: "list", items });
      continue;
    }

    if (line.startsWith(">")) {
      const quoteLines: string[] = [];

      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push({ type: "quote", lines: quoteLines });
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length && lines[index].trim()) {
      const candidate = lines[index].trim();

      if (
        candidate.startsWith("```") ||
        candidate.startsWith(">") ||
        /^[-*]\s+/.test(candidate) ||
        /^(#{1,3})\s+/.test(candidate)
      ) {
        break;
      }

      paragraphLines.push(candidate);
      index += 1;
    }

    if (paragraphLines.length) {
      blocks.push({
        type: "paragraph",
        text: paragraphLines.join(" "),
      });
      continue;
    }

    index += 1;
  }

  return blocks;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-4 text-[15px] leading-7 text-slate-200">
      {blocks.map((block, index) => {
        if (block.type === "code") {
          return (
            <div
              key={`code-${index}`}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#09101d]"
            >
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                <span>{block.language || "Code"}</span>
              </div>
              <pre className="overflow-x-auto px-4 py-4 text-sm text-slate-100">
                <code>{block.code}</code>
              </pre>
            </div>
          );
        }

        if (block.type === "heading") {
          const Tag = block.level === 1 ? "h1" : block.level === 2 ? "h2" : "h3";
          const classes =
            block.level === 1
              ? "text-2xl font-semibold text-white"
              : block.level === 2
                ? "text-xl font-semibold text-white"
                : "text-lg font-semibold text-white";

          return (
            <Tag key={`heading-${index}`} className={classes}>
              {renderInline(block.text)}
            </Tag>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={`list-${index}`} className="space-y-2 pl-1">
              {block.items.map((item, itemIndex) => (
                <li key={`list-item-${index}-${itemIndex}`} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <span className="min-w-0">{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={`quote-${index}`}
              className="rounded-r-2xl border-l-2 border-[var(--accent)] bg-white/[0.03] px-4 py-3 text-slate-300"
            >
              {block.lines.map((line, lineIndex) => (
                <p key={`quote-line-${index}-${lineIndex}`}>
                  {renderInline(line)}
                </p>
              ))}
            </blockquote>
          );
        }

        return (
          <p key={`paragraph-${index}`} className="text-slate-200">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}
