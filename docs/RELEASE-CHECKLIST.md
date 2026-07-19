# Release checklist

## Calculation and data

- [ ] A second reviewer has checked 38 C.F.R. §§ 4.25 and 4.26 behavior and test vectors.
- [ ] A second reviewer has checked every compensation value against the official VA table.
- [ ] `npm run check` passes.
- [ ] Full-tree and production-only npm audits pass.

## Privacy, security, and accessibility

- [ ] The built artifact passes the legacy marker, secret, and CSP scan.
- [ ] No entry is sent in a request, URL, log, browser storage, or print filename.
- [ ] Keyboard-only, focus, status-message, 320px reflow, 400% zoom, and print checks pass.
- [ ] Automated accessibility checks pass and a manual screen-reader-oriented review is complete.
- [ ] Chromium, Firefox, and WebKit smoke tests pass.

## GitHub and deployment

- [ ] Required checks and branch protection are enabled on `main`.
- [ ] Dependabot alerts/security updates and secret scanning are enabled.
- [ ] Pages source is GitHub Actions, HTTPS is enforced, and only `main` may deploy.
- [ ] Production assets load under `/VA-Math-Machine/` with no CSP violations.
- [ ] Deployed sample calculations and current rate metadata match the reviewed release.
- [ ] Relevant issues are linked and closed only after deployment.
- [ ] A version tag and changelog entry are created.

GitHub Pages cannot add `frame-ancestors`, `X-Content-Type-Options`, Permissions Policy, or other custom response headers. This limitation must remain documented unless hosting changes.
