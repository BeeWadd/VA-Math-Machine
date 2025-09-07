
export enum Laterality {
  NONE = 'NONE',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface Disability {
  id: string;
  name: string;
  rating: number;
  laterality: Laterality;
}

export interface DisabilityCondition {
  name: string;
  ratings: number[];
  canBeBilateral?: boolean;
  description?: string;
}

export enum DependencyStatus {
  VETERAN_ONLY = 'VETERAN_ONLY',
  VETERAN_WITH_SPOUSE = 'VETERAN_WITH_SPOUSE',
  VETERAN_WITH_SPOUSE_AND_CHILD = 'VETERAN_WITH_SPOUSE_AND_CHILD',
  VETERAN_WITH_CHILD = 'VETERAN_WITH_CHILD',
  VETERAN_WITH_SPOUSE_AND_TWO_CHILDREN = 'VETERAN_WITH_SPOUSE_AND_TWO_CHILDREN',
  VETERAN_WITH_TWO_CHILDREN = 'VETERAN_WITH_TWO_CHILDREN',
}

export type CompensationRates = {
  [rating: number]: {
    [status in DependencyStatus]?: number;
  };
};

export interface CalculationResult {
  bilateralFactor: number;
  combinedBodyRating: number;
  finalRoundedRating: number;
  monthlyCompensation: number;
  calculationSteps: string[];
}
