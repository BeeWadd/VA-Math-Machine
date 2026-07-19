import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectFile = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('production security boundaries', () => {
  it('does not load runtime scripts, styles, analytics, or fonts from third parties', () => {
    const document = projectFile('index.html');

    expect(document).not.toMatch(/https?:\/\//i);
    expect(document).not.toMatch(/googletagmanager|analytics|unpkg|cdnjs|tailwindcss|babel/i);
  });

  it('blocks network connections and plugin content through CSP', () => {
    const document = projectFile('index.html');

    expect(document).toContain("connect-src 'none'");
    expect(document).toContain("object-src 'none'");
    expect(document).toContain("base-uri 'none'");
  });

  it('contains no client-side API-key injection or legacy PDF dependency', () => {
    const packageJson = projectFile('package.json');
    const viteConfig = projectFile('vite.config.ts');

    expect(`${packageJson}\n${viteConfig}`).not.toMatch(/GEMINI|API_KEY|jspdf|html2canvas/i);
  });
});
