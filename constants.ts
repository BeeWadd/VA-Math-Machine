import { DependencyStatus } from './types';

export const DEPENDENCY_OPTIONS = [
  { value: DependencyStatus.VETERAN_ONLY, label: 'Veteran Only' },
  { value: DependencyStatus.VETERAN_WITH_SPOUSE, label: 'Veteran with Spouse' },
  { value: DependencyStatus.VETERAN_WITH_CHILD, label: 'Veteran with 1 Child' },
  { value: DependencyStatus.VETERAN_WITH_SPOUSE_AND_CHILD, label: 'Veteran with Spouse & 1 Child' },
  { value: DependencyStatus.VETERAN_WITH_TWO_CHILDREN, label: 'Veteran with 2 Children' },
  { value: DependencyStatus.VETERAN_WITH_SPOUSE_AND_TWO_CHILDREN, label: 'Veteran with Spouse & 2 Children' },
];

export const MENTAL_HEALTH_CONDITIONS: string[] = [
    'Post-Traumatic Stress Disorder (PTSD)',
    'Major Depressive Disorder',
    'Generalized Anxiety Disorder',
    'Somatic Symptom Disorder',
    'Adjustment Disorder',
    'Bipolar Disorder',
];