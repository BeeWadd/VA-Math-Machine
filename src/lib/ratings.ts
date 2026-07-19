export type BodySide = 'left' | 'right';

export type BilateralLocation =
  | { kind: 'upper-extremity'; side: BodySide }
  | { kind: 'lower-extremity'; side: BodySide }
  | { kind: 'paired-skeletal-muscle'; side: BodySide; muscleGroup: string };

export interface DisabilityRating {
  id: string;
  percentage: number;
  label?: string;
  bilateral?: BilateralLocation;
}

export interface BilateralCalculation {
  includedIds: string[];
  combinedBeforeFactor: number;
  factor: number;
  unit: number;
}

export interface CalculationAlternative {
  method: 'ordinary' | 'full-bilateral' | 'partial-bilateral';
  combinedValue: number;
  finalRating: number;
  bilateral?: BilateralCalculation;
}

export interface CombinedRatingResult extends CalculationAlternative {
  steps: string[];
  ordinary: CalculationAlternative;
  defaultBilateral?: CalculationAlternative;
}

export const MAX_BILATERAL_RATINGS = 14;

const normalizeMuscleGroup = (value: string) =>
  value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US');

const roundHalfUp = (value: number) => Math.floor(value + 0.5);

export function combineTwoRatings(first: number, second: number): number {
  const combined = first + ((100 - first) * second) / 100;
  return Math.min(100, roundHalfUp(combined));
}

export function combineTableRatings(ratings: number[]): number {
  const ordered = [...ratings].sort((a, b) => b - a);
  return ordered.reduce((combined, rating) => combineTwoRatings(combined, rating), 0);
}

export function roundToSchedularRating(combinedValue: number): number {
  return Math.min(100, Math.floor((combinedValue + 5) / 10) * 10);
}

function validate(ratings: DisabilityRating[]): void {
  const ids = new Set<string>();
  for (const rating of ratings) {
    if (!rating.id.trim() || ids.has(rating.id)) {
      throw new TypeError('Every rating must have a unique, nonempty ID.');
    }
    ids.add(rating.id);
    if (!Number.isInteger(rating.percentage) || rating.percentage < 0 || rating.percentage > 100) {
      throw new RangeError('Ratings must be whole percentages from 0 through 100.');
    }
    if (
      rating.bilateral?.kind === 'paired-skeletal-muscle' &&
      !normalizeMuscleGroup(rating.bilateral.muscleGroup)
    ) {
      throw new TypeError('A paired skeletal muscle rating requires a muscle-group name.');
    }
  }
}

function groupKey(location: BilateralLocation): string {
  if (location.kind === 'paired-skeletal-muscle') {
    return `muscle:${normalizeMuscleGroup(location.muscleGroup)}`;
  }
  return location.kind;
}

function qualifyingIds(ratings: DisabilityRating[]): Set<string> {
  const sides = new Map<string, Set<BodySide>>();
  for (const rating of ratings) {
    if (!rating.bilateral || rating.percentage === 0) continue;
    const key = groupKey(rating.bilateral);
    const current = sides.get(key) ?? new Set<BodySide>();
    current.add(rating.bilateral.side);
    sides.set(key, current);
  }
  const qualifyingGroups = new Set(
    [...sides].filter(([, present]) => present.has('left') && present.has('right')).map(([key]) => key),
  );
  return new Set(
    ratings
      .filter(
        (rating) =>
          rating.percentage > 0 &&
          rating.bilateral &&
          qualifyingGroups.has(groupKey(rating.bilateral)),
      )
      .map(({ id }) => id),
  );
}

function isValidSelectedGroup(selected: DisabilityRating[]): boolean {
  if (selected.length < 2) return false;
  const sides = new Map<string, Set<BodySide>>();
  for (const rating of selected) {
    if (!rating.bilateral) return false;
    const key = groupKey(rating.bilateral);
    const current = sides.get(key) ?? new Set<BodySide>();
    current.add(rating.bilateral.side);
    sides.set(key, current);
  }
  return [...sides.values()].every((present) => present.has('left') && present.has('right'));
}

function ordinaryAlternative(ratings: DisabilityRating[]): CalculationAlternative {
  const combinedValue = combineTableRatings(ratings.map(({ percentage }) => percentage));
  return { method: 'ordinary', combinedValue, finalRating: roundToSchedularRating(combinedValue) };
}

function bilateralAlternative(
  ratings: DisabilityRating[],
  selectedIds: Set<string>,
  fullCount: number,
): CalculationAlternative {
  const selected = ratings.filter(({ id }) => selectedIds.has(id));
  const remaining = ratings.filter(({ id }) => !selectedIds.has(id));
  const combinedBeforeFactor = combineTableRatings(selected.map(({ percentage }) => percentage));
  const factor = combinedBeforeFactor / 10;
  const unit = Math.min(100, roundHalfUp(combinedBeforeFactor + factor));
  const combinedValue = combineTableRatings([
    unit,
    ...remaining.map(({ percentage }) => percentage),
  ]);
  return {
    method: selected.length === fullCount ? 'full-bilateral' : 'partial-bilateral',
    combinedValue,
    finalRating: roundToSchedularRating(combinedValue),
    bilateral: {
      includedIds: selected.map(({ id }) => id).sort(),
      combinedBeforeFactor,
      factor,
      unit,
    },
  };
}

function betterException(
  candidate: CalculationAlternative,
  current: CalculationAlternative,
): boolean {
  if (candidate.finalRating !== current.finalRating) return candidate.finalRating > current.finalRating;
  if (candidate.combinedValue !== current.combinedValue)
    return candidate.combinedValue > current.combinedValue;
  const candidateCount = candidate.bilateral?.includedIds.length ?? 0;
  const currentCount = current.bilateral?.includedIds.length ?? 0;
  if (candidateCount !== currentCount) return candidateCount > currentCount;
  return (candidate.bilateral?.includedIds.join('|') ?? '').localeCompare(
    current.bilateral?.includedIds.join('|') ?? '',
  ) < 0;
}

function buildSteps(
  ratings: DisabilityRating[],
  result: CalculationAlternative,
  ordinary: CalculationAlternative,
  full?: CalculationAlternative,
): string[] {
  const steps = [`Ratings sorted from highest to lowest: ${ratings.map((r) => `${r.percentage}%`).sort((a, b) => parseInt(b) - parseInt(a)).join(', ')}.`];
  if (result.bilateral) {
    steps.push(
      `Eligible bilateral ratings combine to ${result.bilateral.combinedBeforeFactor}%.`,
      `Ten percent of that value is ${result.bilateral.factor.toFixed(1)}%; the bilateral unit rounds to ${result.bilateral.unit}%.`,
    );
  }
  steps.push(`Whole-person value after Table I combinations: ${result.combinedValue}%.`);
  if (full && result.method !== 'full-bilateral') {
    steps.push(
      `38 C.F.R. § 4.26(d) comparison: full bilateral treatment yields ${full.finalRating}%, ordinary/partial treatment yields ${result.finalRating}%; the higher result is used.`,
    );
  } else if (!full) {
    steps.push(`No qualifying bilateral pair was present; ordinary treatment yields ${ordinary.finalRating}%.`);
  }
  steps.push(`Final schedular rounding produces ${result.finalRating}%.`);
  return steps;
}

export function calculateCombinedRating(inputRatings: DisabilityRating[]): CombinedRatingResult {
  validate(inputRatings);
  const ratings = [...inputRatings].sort(
    (a, b) => b.percentage - a.percentage || a.id.localeCompare(b.id),
  );
  const ordinary = ordinaryAlternative(ratings);
  const eligible = ratings.filter(({ id }) => qualifyingIds(ratings).has(id));
  if (eligible.length < 2) {
    return { ...ordinary, ordinary, steps: buildSteps(ratings, ordinary, ordinary) };
  }
  if (eligible.length > MAX_BILATERAL_RATINGS) {
    throw new RangeError(
      `At most ${MAX_BILATERAL_RATINGS} bilateral-eligible ratings can be compared exactly.`,
    );
  }

  const allIds = new Set(eligible.map(({ id }) => id));
  const full = bilateralAlternative(ratings, allIds, eligible.length);
  let bestException = ordinary;
  const subsetCount = 2 ** eligible.length;

  for (let mask = 1; mask < subsetCount - 1; mask += 1) {
    const selected = eligible.filter((_, index) => (mask & 2 ** index) !== 0);
    if (!isValidSelectedGroup(selected)) continue;
    const candidate = bilateralAlternative(
      ratings,
      new Set(selected.map(({ id }) => id)),
      eligible.length,
    );
    if (betterException(candidate, bestException)) bestException = candidate;
  }

  const result = bestException.finalRating > full.finalRating ? bestException : full;
  return {
    ...result,
    ordinary,
    defaultBilateral: full,
    steps: buildSteps(ratings, result, ordinary, full),
  };
}
