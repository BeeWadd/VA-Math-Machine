import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve('dist');
const forbiddenMarkers = [
  'googletagmanager',
  'aistudiocdn',
  'unpkg.com',
  'cdnjs.cloudflare',
  'jspdf',
  'html2canvas',
  'dataurlnewwindow',
  'navigator.userAgent',
  'GEMINI_API_KEY',
  'API_KEY',
];
const forbiddenExtensions = new Set(['.env', '.log']);

function filesUnder(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

const files = filesUnder(root);
const htmlPath = join(root, 'index.html');
const html = readFileSync(htmlPath, 'utf8');
const requiredPolicy = [
  "default-src 'none'",
  "script-src 'self'",
  "script-src-attr 'none'",
  "style-src 'self'",
  "style-src-attr 'none'",
  "connect-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
];

for (const directive of requiredPolicy) {
  if (!html.includes(directive)) {
    throw new Error(`Built CSP is missing: ${directive}`);
  }
}

if (/unsafe-inline|unsafe-eval|\bws:|\bwss:|blob:/i.test(html)) {
  throw new Error('Built CSP contains a forbidden source allowance.');
}

for (const path of files) {
  const relativePath = relative(root, path);
  if (relativePath.startsWith('.git') || forbiddenExtensions.has(extname(path))) {
    throw new Error(`Non-deployable file found in dist: ${relativePath}`);
  }

  if (!/\.(?:html|js|css|map|json|txt|svg)$/i.test(path)) continue;
  const content = readFileSync(path, 'utf8').toLowerCase();
  for (const marker of forbiddenMarkers) {
    if (content.includes(marker.toLowerCase())) {
      throw new Error(`Forbidden legacy or secret marker "${marker}" in ${relativePath}`);
    }
  }
}

console.log(`Verified ${files.length} deployable build files and strict CSP.`);
