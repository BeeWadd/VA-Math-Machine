# Changelog

All notable changes to VA Math Machine are documented here.

## 1.0.0 — 2026-07-18

### Corrected

- Replaced continuous combined-rating math with 38 C.F.R. § 4.25 Table I integer-rounding semantics.
- Rebuilt the bilateral-factor calculation for paired extremities and paired skeletal muscle groups, including the § 4.26(d) most-favorable comparison.
- Replaced the stale and historically inaccurate payment table with VA rates effective December 1, 2025.
- Expanded dependent calculations to include spouse, dependent parents, children under 18, qualifying schoolchildren over 18, and spouse Aid and Attendance additions.
- Unified the visible stale-rate warning and payment gate on the same UTC review boundary.

### Security and privacy

- Removed Google Analytics, runtime CDNs, browser Babel, jsPDF, html2canvas, and unused Gemini API-key injection.
- Added bundled production assets, a strict meta Content Security Policy, locked dependencies, audits, CodeQL, Dependabot, and artifact scans.
- Replaced raster PDF generation with the browser's native print and “Save as PDF” path.

### Accessibility and engineering

- Rebuilt the interface with native labeled controls, keyboard/focus management, status announcements, responsive layouts, and print styles.
- Added regulation, rate, UI, accessibility, security, freshness, and build tests plus a verified Pages deployment workflow.
- Added exhaustive regression coverage for all 122 official compensation values, the published bilateral example, four affected extremities, and partial § 4.26(d) exclusions.
- Bounded exact bilateral subset comparison at 14 classified ratings to avoid multi-second browser stalls while failing closed above the documented limit.
