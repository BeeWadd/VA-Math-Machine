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

const officialRatings = [30, 40, 50, 60, 70, 80, 90, 100] as const;
const dependentStatuses = [
  { key: 'veteran', hasSpouse: false, dependentParents: 0 },
  { key: 'spouse', hasSpouse: true, dependentParents: 0 },
  { key: 'spouse1Parent', hasSpouse: true, dependentParents: 1 },
  { key: 'spouse2Parents', hasSpouse: true, dependentParents: 2 },
  { key: 'oneParent', hasSpouse: false, dependentParents: 1 },
  { key: 'twoParents', hasSpouse: false, dependentParents: 2 },
] as const;

const officialNoChild = {
  veteran: [55247, 79584, 113290, 143502, 180845, 210215, 236230, 393858],
  spouse: [61747, 88284, 124190, 156602, 196145, 227715, 255930, 415817],
  spouse1Parent: [66947, 95284, 132990, 167102, 208445, 241715, 271730, 433441],
  spouse2Parents: [72147, 102284, 141790, 177602, 220745, 255715, 287530, 451065],
  oneParent: [60447, 86584, 122090, 154002, 193145, 224215, 252030, 411482],
  twoParents: [65647, 93584, 130890, 164502, 205445, 238215, 267830, 429106],
} as const;

const officialOneChild = {
  veteran: [59647, 85384, 120590, 152302, 191045, 221915, 249430, 408543],
  spouse: [66647, 94784, 132290, 166302, 207445, 240615, 270430, 431899],
  spouse1Parent: [71847, 101784, 141090, 176802, 219745, 254615, 286230, 449523],
  spouse2Parents: [77047, 108784, 149890, 187302, 232045, 268615, 302030, 467147],
  oneParent: [64847, 92384, 129390, 162802, 203345, 235915, 265230, 426167],
  twoParents: [70047, 99384, 138190, 173302, 215645, 249915, 281030, 443791],
} as const;

const officialAdditionalChild = [3200, 4300, 5400, 6500, 7600, 8700, 9800, 10911] as const;
const officialSchoolchild = [10500, 14000, 17600, 21100, 24600, 28100, 31700, 35245] as const;
const officialSpouseAidAndAttendance = [6100, 8100, 10100, 12100, 14100, 16100, 18100, 20141] as const;

describe('2026 basic VA compensation', () => {
  it('uses flat rates at 10 and 20 percent regardless of dependents', () => {
    expect(calculateCompensationEstimate({ ...base, disabilityRating: 10, hasSpouse: true, childrenUnder18: 5 }).totalCents).toBe(18042);
    expect(calculateCompensationEstimate({ ...base, disabilityRating: 20, dependentParents: 2 }).totalCents).toBe(35666);
  });

  it('matches official base table rows', () => {
    expect(calculateCompensationEstimate(base).totalCents).toBe(180845);
    expect(calculateCompensationEstimate({ ...base, disabilityRating: 100, hasSpouse: true, dependentParents: 2 }).totalCents).toBe(451065);
  });

  it('matches every official 30%-100% base cell and dependent addition', () => {
    expect.assertions(120);
    officialRatings.forEach((disabilityRating, index) => {
      dependentStatuses.forEach(({ key, hasSpouse, dependentParents }) => {
        const inputs = { ...base, disabilityRating, hasSpouse, dependentParents };
        expect(calculateCompensationEstimate(inputs).totalCents).toBe(
          officialNoChild[key][index],
        );
        expect(
          calculateCompensationEstimate({ ...inputs, childrenUnder18: 1 }).totalCents,
        ).toBe(officialOneChild[key][index]);
      });

      const oneChild = calculateCompensationEstimate({
        ...base,
        disabilityRating,
        childrenUnder18: 1,
      }).totalCents;
      const twoChildren = calculateCompensationEstimate({
        ...base,
        disabilityRating,
        childrenUnder18: 2,
      }).totalCents;
      expect(twoChildren - oneChild).toBe(officialAdditionalChild[index]);

      const noSchoolchild = calculateCompensationEstimate({ ...base, disabilityRating }).totalCents;
      const oneSchoolchild = calculateCompensationEstimate({
        ...base,
        disabilityRating,
        schoolChildrenOver18: 1,
      }).totalCents;
      expect(oneSchoolchild - noSchoolchild).toBe(officialSchoolchild[index]);

      const spouse = calculateCompensationEstimate({
        ...base,
        disabilityRating,
        hasSpouse: true,
      }).totalCents;
      const spouseWithAidAndAttendance = calculateCompensationEstimate({
        ...base,
        disabilityRating,
        hasSpouse: true,
        spouseAidAndAttendance: true,
      }).totalCents;
      expect(spouseWithAidAndAttendance - spouse).toBe(
        officialSpouseAidAndAttendance[index],
      );
    });
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
