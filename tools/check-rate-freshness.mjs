import { readFileSync } from 'node:fs';

const source = readFileSync('src/data/compensation-2026.ts', 'utf8');
const match = source.match(/reviewDueDate:\s*['"](\d{4}-\d{2}-\d{2})['"]/);

if (!match) {
  throw new Error('The compensation data must declare a reviewDueDate.');
}

const reviewDue = new Date(`${match[1]}T00:00:00Z`);
const today = new Date();

if (today >= reviewDue) {
  throw new Error(
    `VA compensation data review was due ${match[1]}. Verify and update rates before release.`,
  );
}

console.log(`Compensation data freshness gate passes; next review is ${match[1]}.`);
