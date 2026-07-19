import { describe, expect, it } from 'vitest';
import {
  calculateCompensationEstimate,
  CompensationInputError,
  isCompensationRateReviewDue,
  type CompensationInputs,
} from './compensation-2026';

const base: CompensationInputs = {
  disabilityRating: 70,
  hasSpouse: false,
  dependentParents: 0,
  childrenUnder18: 0,
  schoolChildrenOver18: 0,
  spouseAidAndAttendance: false,
};

describe('2026 basic VA compensation', () => {
  it('uses flat rates at 10 and 20 percent regardless of dependents', () => {
    expect(calculateCompensationEstimate({ ...base, disabilityRating: 10, hasSpouse: true, childrenUnder18: 5 }).totalCents).toBe(18042);
    expect(calculateCompensationEstimate({ ...base, disabilityRating: 20, dependentParents: 2 }).totalCents).toBe(35666);
  });

  it('matches official base table rows', () => {
    expect(calculateCompensationEstimate(base).totalCents).toBe(180845);
    expect(calculateCompensationEstimate({ ...base, disabilityRating: 100, hasSpouse: true, dependentParents: 2 }).totalCents).toBe(451065);
  });

  it('adds minor children and spouse A&A in integer cents', () => {
    expect(calculateCompensationEstimate({ ...base, hasSpouse: true, childrenUnder18: 3, spouseAidAndAttendance: true }).totalCents).toBe(236745);
  });

  it('treats schoolchildren as separate additions, not the minor-child base', () => {
    expect(calculateCompensationEstimate({ ...base, hasSpouse: true, schoolChildrenOver18: 1 }).totalCents).toBe(220745);
    expect(calculateCompensationEstimate({ ...base, hasSpouse: true, childrenUnder18: 3, schoolChildrenOver18: 1 }).totalCents).toBe(247245);
  });

  it('matches a complex 100 percent dependent example', () => {
    expect(calculateCompensationEstimate({ ...base, disabilityRating: 100, hasSpouse: true, dependentParents: 2, childrenUnder18: 1, schoolChildrenOver18: 2, spouseAidAndAttendance: true }).totalCents).toBe(557778);
  });

  it('rejects spouse A&A without a spouse', () => {
    expect(() => calculateCompensationEstimate({ ...base, spouseAidAndAttendance: true })).toThrow(CompensationInputError);
  });

  it('fails the freshness check on the scheduled review date', () => {
    expect(isCompensationRateReviewDue(new Date('2026-11-30T23:59:59Z'))).toBe(false);
    expect(isCompensationRateReviewDue(new Date('2026-12-01T00:00:00Z'))).toBe(true);
  });
});
