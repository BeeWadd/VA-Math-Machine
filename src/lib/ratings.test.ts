import { describe, expect, it } from 'vitest';
import {
  calculateCombinedRating,
  combineTableRatings,
  combineTwoRatings,
  MAX_BILATERAL_RATINGS,
  roundToSchedularRating,
  type DisabilityRating,
} from './ratings';

const plain = (values: number[]): DisabilityRating[] =>
  values.map((percentage, index) => ({ id: String(index), percentage }));

describe('38 C.F.R. § 4.25 Table I semantics', () => {
  it.each([
    [10, 10, 19],
    [60, 30, 72],
    [50, 30, 65],
    [40, 20, 52],
  ])('combines %i and %i as %i', (first, second, expected) => {
    expect(combineTwoRatings(first, second)).toBe(expected);
  });

  it('rounds after every combination', () => {
    expect(combineTableRatings([90, 30, 10, 10])).toBe(95);
    expect(calculateCombinedRating(plain([90, 30, 10, 10])).finalRating).toBe(100);
  });

  it('rounds final values ending in five upward', () => {
    expect(roundToSchedularRating(95)).toBe(100);
    expect(roundToSchedularRating(94)).toBe(90);
  });

  it('is symmetric, bounded, and monotonic for all integer pairs', () => {
    for (let a = 0; a <= 100; a += 1) {
      for (let b = 0; b <= 100; b += 1) {
        const combined = combineTwoRatings(a, b);
        expect(combined).toBe(combineTwoRatings(b, a));
        expect(combined).toBeGreaterThanOrEqual(Math.max(a, b));
        expect(combined).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe('38 C.F.R. § 4.26 bilateral treatment', () => {
  it('matches the regulation example for 60, 20, and bilateral 10/10', () => {
    const result = calculateCombinedRating([
      { id: 'a', percentage: 60 },
      { id: 'b', percentage: 20 },
      { id: 'left', percentage: 10, bilateral: { kind: 'lower-extremity', side: 'left' } },
      { id: 'right', percentage: 10, bilateral: { kind: 'lower-extremity', side: 'right' } },
    ]);
    expect(result.bilateral).toMatchObject({ combinedBeforeFactor: 19, factor: 1.9, unit: 21 });
    expect(result.combinedValue).toBe(74);
    expect(result.finalRating).toBe(70);
  });

  it('adds the factor before treating the bilateral result as one rating', () => {
    const result = calculateCombinedRating([
      { id: 'left', percentage: 10, bilateral: { kind: 'lower-extremity', side: 'left' } },
      { id: 'right', percentage: 10, bilateral: { kind: 'lower-extremity', side: 'right' } },
      { id: 'other', percentage: 30 },
    ]);
    expect(result.bilateral?.unit).toBe(21);
    expect(result.finalRating).toBe(50);
  });

  it('uses the § 4.26(d) exception when ordinary treatment is higher', () => {
    const result = calculateCombinedRating([
      { id: 'a', percentage: 90 },
      { id: 'b', percentage: 30 },
      { id: 'left', percentage: 10, bilateral: { kind: 'lower-extremity', side: 'left' } },
      { id: 'right', percentage: 10, bilateral: { kind: 'lower-extremity', side: 'right' } },
    ]);
    expect(result.defaultBilateral?.finalRating).toBe(90);
    expect(result.method).toBe('ordinary');
    expect(result.finalRating).toBe(100);
  });

  it('can remove only one paired group when partial bilateral treatment is most favorable', () => {
    const result = calculateCombinedRating([
      { id: 'other-20', percentage: 20 },
      { id: 'other-70', percentage: 70 },
      { id: 'upper-left', percentage: 10, bilateral: { kind: 'upper-extremity', side: 'left' } },
      { id: 'upper-right', percentage: 10, bilateral: { kind: 'upper-extremity', side: 'right' } },
      { id: 'lower-left', percentage: 10, bilateral: { kind: 'lower-extremity', side: 'left' } },
      { id: 'lower-right', percentage: 60, bilateral: { kind: 'lower-extremity', side: 'right' } },
    ]);
    expect(result.method).toBe('partial-bilateral');
    expect(result.bilateral?.includedIds).toEqual(['lower-left', 'lower-right']);
    expect(result.defaultBilateral?.finalRating).toBe(90);
    expect(result.ordinary.finalRating).toBe(90);
    expect(result.finalRating).toBe(100);
  });

  it('combines all four affected extremities before adding one bilateral factor', () => {
    const result = calculateCombinedRating([
      { id: 'upper-left', percentage: 20, bilateral: { kind: 'upper-extremity', side: 'left' } },
      { id: 'upper-right', percentage: 20, bilateral: { kind: 'upper-extremity', side: 'right' } },
      { id: 'lower-left', percentage: 10, bilateral: { kind: 'lower-extremity', side: 'left' } },
      { id: 'lower-right', percentage: 10, bilateral: { kind: 'lower-extremity', side: 'right' } },
    ]);
    expect(result.bilateral).toMatchObject({ combinedBeforeFactor: 48, factor: 4.8, unit: 53 });
    expect(result.finalRating).toBe(50);
  });

  it('does not apply a factor with a zero-percent side', () => {
    const result = calculateCombinedRating([
      { id: 'left', percentage: 0, bilateral: { kind: 'lower-extremity', side: 'left' } },
      { id: 'right', percentage: 10, bilateral: { kind: 'lower-extremity', side: 'right' } },
    ]);
    expect(result.bilateral).toBeUndefined();
    expect(result.finalRating).toBe(10);
  });

  it('normalizes paired muscle group names but does not mix different groups', () => {
    const matching = calculateCombinedRating([
      { id: 'left', percentage: 10, bilateral: { kind: 'paired-skeletal-muscle', side: 'left', muscleGroup: ' Group XI ' } },
      { id: 'right', percentage: 10, bilateral: { kind: 'paired-skeletal-muscle', side: 'right', muscleGroup: 'group   xi' } },
    ]);
    expect(matching.bilateral?.unit).toBe(21);

    const different = calculateCombinedRating([
      { id: 'left', percentage: 10, bilateral: { kind: 'paired-skeletal-muscle', side: 'left', muscleGroup: 'XI' } },
      { id: 'right', percentage: 10, bilateral: { kind: 'paired-skeletal-muscle', side: 'right', muscleGroup: 'XII' } },
    ]);
    expect(different.bilateral).toBeUndefined();
  });

  it('is invariant to input ordering', () => {
    const ratings: DisabilityRating[] = [
      { id: 'a', percentage: 60 },
      { id: 'b', percentage: 20 },
      { id: 'left', percentage: 10, bilateral: { kind: 'upper-extremity', side: 'left' } },
      { id: 'right', percentage: 10, bilateral: { kind: 'upper-extremity', side: 'right' } },
    ];
    const expected = calculateCombinedRating(ratings).finalRating;
    expect(calculateCombinedRating([...ratings].reverse()).finalRating).toBe(expected);
  });

  it('fails closed above the bounded exact-search limit', () => {
    const ratings: DisabilityRating[] = Array.from(
      { length: MAX_BILATERAL_RATINGS + 1 },
      (_, index) => ({
        id: String(index),
        percentage: 10,
        bilateral: {
          kind: 'lower-extremity',
          side: index % 2 === 0 ? 'left' : 'right',
        },
      }),
    );
    expect(() => calculateCombinedRating(ratings)).toThrow(
      `At most ${MAX_BILATERAL_RATINGS} bilateral-eligible ratings`,
    );
  });
});
