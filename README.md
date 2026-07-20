# VA Math Machine

VA Math Machine is a privacy-conscious estimator for the Department of Veterans Affairs combined disability rating and basic monthly disability compensation. Rating labels and selections are processed only in the browser tab; the calculator does not store or transmit entries. GitHub Pages still receives normal web-request information, including visitors' IP addresses. Printing or saving creates a document on the user's device that may contain sensitive information.

> This is an independent educational tool. It is not affiliated with, endorsed by, or a substitute for a decision from the U.S. Department of Veterans Affairs. Results are estimates and are not legal, medical, or claims advice.

## Live calculator

Use the deployed application at [beewadd.github.io/VA-Math-Machine](https://beewadd.github.io/VA-Math-Machine/).

## What it calculates

- Combined ratings using the whole-person method and the integer-by-integer semantics of 38 C.F.R. § 4.25 Table I
- The bilateral factor for compensable disabilities covered by 38 C.F.R. § 4.26
- The most favorable schedular result when the § 4.26(d) exception applies
- Basic monthly compensation using the VA rates effective December 1, 2025 (the 2026 rate table)
- Common dependent additions for a spouse, up to two dependent parents, children under 18, qualifying schoolchildren over 18, and a spouse receiving Aid and Attendance

The compensation estimate does not model Special Monthly Compensation, TDIU eligibility, offsets, apportionment, effective-date rules, staged ratings, pension, survivor benefits, or every dependency exception.

The calculator accepts up to 30 assigned ratings. Exact § 4.26(d) subset comparison is limited to 14 bilateral-classified ratings so the calculation remains responsive; the interface fails closed instead of silently approximating above that limit.

## Authoritative sources

- [38 C.F.R. § 4.25 — Combined Ratings Table](https://www.ecfr.gov/current/title-38/chapter-I/part-4/subpart-A/section-4.25)
- [38 C.F.R. § 4.26 — Bilateral factor](https://www.ecfr.gov/current/title-38/chapter-I/part-4/subpart-A/section-4.26)
- [VA current Veterans disability compensation rates](https://www.va.gov/disability/compensation-rates/veteran-rates/)

The rate module records its effective date, verification date, official source URL, and next scheduled review date. The interface warns when that review date has arrived.

## Local development

Prerequisite: Node.js 22 or later.

```bash
npm ci
npm run dev
```

No API key or environment file is required.

## Verification

```bash
npm run check
npm audit --omit=dev
```

`npm run check` runs linting, the regulation and rate unit tests, UI/accessibility tests, TypeScript compilation, and the production build.

## Deployment

The `Deploy GitHub Pages` workflow verifies and builds the app from locked dependencies, uploads only `dist/`, and deploys from the default branch. GitHub Pages must be configured to use **GitHub Actions** as its publishing source.

Because GitHub Pages cannot attach arbitrary HTTP response headers, this static site also ships a restrictive Content Security Policy in the document. A future deployment on infrastructure that supports response headers should add `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and an explicit `Permissions-Policy` at the HTTP layer.

## Privacy and exports

There is no analytics tag, application server, database, browser storage, service worker, or runtime content delivery network. Refreshing or closing the page clears entries. The print action uses the browser's native print dialog so the user can print or choose “Save as PDF” without loading a PDF library or transmitting the report through the calculator. Saved files, shared computers, operating-system print queues, printers, and cloud print destinations are outside the calculator's control.

## Security

See [SECURITY.md](SECURITY.md). Dependabot monitors npm and GitHub Actions dependencies, CI audits production dependencies, and CodeQL scans JavaScript/TypeScript changes.
