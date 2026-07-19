# Annual compensation-rate update procedure

The VA normally publishes a new disability compensation table effective December 1. The repository owner is responsible for beginning review in November and completing verification before the existing module's `reviewDueDate`.

1. Open the official [VA Veterans disability compensation rates](https://www.va.gov/disability/compensation-rates/veteran-rates/) page.
2. Confirm the stated effective date and compare every 10%–100% base amount and every 30%–100% dependent row/addition against `src/data/compensation-2026.ts` (or its successor).
3. Update integer-cent values, `effectiveDate`, `verifiedDate`, `reviewDueDate`, the module name, tests, visible copy, README, and changelog.
4. Add test vectors for official worked examples and manually spot-check spouse/parent/child combinations at 30%, 60%, and 100%.
5. Run `npm run check`, `npm audit --audit-level=high`, and `npm audit --omit=dev --audit-level=high`.
6. Have a second reviewer compare the complete table to the official VA source before merging.
7. Deploy through the Pages workflow and verify the effective date and sample calculations on the deployed site.

The build intentionally fails on or after `reviewDueDate`. Do not extend that date without re-verifying the official table.
