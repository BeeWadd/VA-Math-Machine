import {
  calculateCompensationEstimate,
  COMPENSATION_2026_METADATA,
  isCompensationRateReviewDue,
  type CompensationRating,
} from '../data/compensation-2026';
import {
  calculateCombinedRating,
  MAX_BILATERAL_RATINGS,
  type BilateralLocation,
  type DisabilityRating,
} from './ratings';

export type BilateralCategory = 'none' | 'upper' | 'lower' | 'muscle';
export type Side = 'none' | 'left' | 'right';

export interface CalculatorEntry {
  id: string;
  label: string;
  percentage: number;
  bilateralCategory: BilateralCategory;
  side: Side;
  muscleGroup?: string;
}

export interface Dependents {
  spouse: boolean;
  parents: 0 | 1 | 2;
  childrenUnder18: number;
  schoolChildrenOver18: number;
  spouseAidAndAttendance: boolean;
}

export const RATE_METADATA = COMPENSATION_2026_METADATA;
export const MAX_BILATERAL_ENTRIES = MAX_BILATERAL_RATINGS;
export const isRateReviewDue = isCompensationRateReviewDue;

function bilateralFor(entry: CalculatorEntry): BilateralLocation | undefined {
  if (entry.side === 'none' || entry.bilateralCategory === 'none') return undefined;
  if (entry.bilateralCategory === 'upper') {
    return { kind: 'upper-extremity', side: entry.side };
  }
  if (entry.bilateralCategory === 'lower') {
    return { kind: 'lower-extremity', side: entry.side };
  }
  return {
    kind: 'paired-skeletal-muscle',
    side: entry.side,
    muscleGroup: entry.muscleGroup ?? '',
  };
}

export function estimateBenefits(entries: CalculatorEntry[], dependents: Dependents) {
  const ratings: DisabilityRating[] = entries.map((entry) => ({
    id: entry.id,
    label: entry.label,
    percentage: entry.percentage,
    bilateral: bilateralFor(entry),
  }));
  const result = calculateCombinedRating(ratings);
  const rating = {
    combinedValue: result.combinedValue,
    finalRating: result.finalRating,
    bilateralApplied: Boolean(result.bilateral),
    bilateralAddition: result.bilateral?.factor ?? 0,
    steps: result.steps,
  };

  const compensation =
    result.finalRating >= 10 && !isCompensationRateReviewDue()
      ? calculateCompensationEstimate({
          disabilityRating: result.finalRating as CompensationRating,
          hasSpouse: dependents.spouse,
          dependentParents: dependents.parents,
          childrenUnder18: dependents.childrenUnder18,
          schoolChildrenOver18: dependents.schoolChildrenOver18,
          spouseAidAndAttendance: dependents.spouseAidAndAttendance,
        })
      : null;

  return { rating, compensation };
}
