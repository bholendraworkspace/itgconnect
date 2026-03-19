"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Trash2, Eye, Code2 } from "lucide-react";

const defaultMd = `# Markdown Preview

Write markdown on the left, see rendered output on the right.

## Features
- **Bold**, *italic*, ~~strikethrough~~
- [Links](https://example.com)
- Inline \`code\` blocks

### Code Block
\`\`\`js
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet("Developer"));
\`\`\`

### Lists
1. First item
2. Second item
   - Nested bullet

> Blockquote: This tool is great for previewing PR descriptions!

---

| Column A | Column B |
|----------|----------|
| Cell 1   | Cell 2   |
`;

function parseMarkdown(md: string): string {
  let html = md
    // Code blocks (must come before inline code)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) =>
      `<pre class="md-pre"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim()}</code></pre>`
    )
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
    // Headers
    .replace(/^######\s+(.+)$/gm, '<h6 class="md-h6">$1</h6>')
    .replace(/^#####\s+(.+)$/gm, '<h5 class="md-h5">$1</h5>')
    .replace(/^####\s+(.+)$/gm, '<h4 class="md-h4">$1</h4>')
    .replace(/^###\s+(.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2 class="md-h2">$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h1 class="md-h1">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    // Links and images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-img" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="md-link" target="_blank" rel="noopener">$1</a>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="md-hr" />')
    // Blockquotes
    .replace(/^>\s+(.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>')
    // Tables
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split("|").filter(Boolean).map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) return "<!--table-sep-->";
      return "<tr>" + cells.map((c) => `<td class="md-td">${c}</td>`).join("") + "</tr>";
    })
    .replace(/((?:<tr>.*<\/tr>\n?)+)/g, '<table class="md-table"><tbody>$1</tbody></table>')
    .replace(/<!--table-sep-->\n?/g, "");

  // Unordered lists
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li class="md-li">$1</li>');
  html = html.replace(/((?:<li class="md-li">.*<\/li>\n?)+)/g, '<ul class="md-ul">$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="md-oli">$1</li>');
  html = html.replace(/((?:<li class="md-oli">.*<\/li>\n?)+)/g, '<ol class="md-ol">$1</ol>');

  // Paragraphs (wrap remaining non-tag lines)
  html = html
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<")) return line;
      return `<p class="md-p">${line}</p>`;
    })
    .join("\n");

  return html;
}

const previewStyles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; padding: 1rem; color: #1e293b; line-height: 1.6; font-size: 14px; margin: 0; }
    .md-h1 { font-size: 1.8em; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; margin: 0.8em 0 0.4em; }
    .md-h2 { font-size: 1.4em; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.2em; margin: 0.8em 0 0.4em; }
    .md-h3 { font-size: 1.15em; font-weight: 600; margin: 0.8em 0 0.4em; }
    .md-h4, .md-h5, .md-h6 { font-size: 1em; font-weight: 600; margin: 0.6em 0 0.3em; }
    .md-p { margin: 0.4em 0; }
    .md-pre { background: #f1f5f9; border-radius: 8px; padding: 12px; overflow-x: auto; font-size: 13px; margin: 0.8em 0; }
    .md-pre code { font-family: 'SF Mono', Consolas, monospace; }
    .md-inline-code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-family: 'SF Mono', Consolas, monospace; }
    .md-link { color: #2563eb; text-decoration: none; }
    .md-link:hover { text-decoration: underline; }
    .md-blockquote { border-left: 3px solid #cbd5e1; margin: 0.6em 0; padding: 0.3em 0 0.3em 1em; color: #64748b; }
    .md-hr { border: none; border-top: 1px solid #e2e8f0; margin: 1em 0; }
    .md-ul, .md-ol { padding-left: 1.5em; margin: 0.4em 0; }
    .md-li, .md-oli { margin: 0.2em 0; }
    .md-table { width: 100%; border-collapse: collapse; margin: 0.8em 0; }
    .md-td { border: 1px solid #e2e8f0; padding: 6px 12px; text-align: left; }
    .md-img { max-width: 100%; border-radius: 8px; }
    del { color: #94a3b8; }
  </style>
`;

export function MarkdownPreview() {
  const [input, setInput] = useState(defaultMd);
  const [copied, setCopied] = useState(false);

  const renderedHtml = useMemo(() => parseMarkdown(input), [input]);
  const iframeSrc = `<!DOCTYPE html><html><head>${previewStyles}</head><body>${renderedHtml}</body></html>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(renderedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-indigo-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Markdown Preview</CardTitle>
          <Badge variant="outline" className="text-[10px]">{input.split("\n").length} lines</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleCopy} disabled={!input.trim()} className="h-7 text-xs gap-1.5">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied HTML" : "Copy HTML"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setInput("")} disabled={!input} className="h-7 text-xs gap-1.5 ml-auto">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Code2 className="h-3 w-3 text-muted-foreground" />
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Markdown</p>
            </div>
            <Textarea
              placeholder="Type markdown here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-80 font-mono text-xs rounded-xl resize-none"
              spellCheck={false}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Preview</p>
            </div>
            <iframe
              srcDoc={iframeSrc}
              title="Markdown Preview"
              sandbox=""
              className="h-80 w-full rounded-xl border bg-white"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
