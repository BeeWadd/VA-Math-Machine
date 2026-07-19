export const COMPENSATION_2026_METADATA = {
  label: '2026 VA disability compensation rates',
  effectiveDate: '2025-12-01',
  verifiedDate: '2026-07-18',
  reviewDueDate: '2026-12-01',
  sourceUrl: 'https://www.va.gov/disability/compensation-rates/veteran-rates/',
  exclusions: [
    'Special Monthly Compensation (SMC)',
    'TDIU eligibility',
    'CRDP and CRSC',
    'offsets, withholdings, apportionment, recoupment, and garnishment',
    'retroactive and effective-date adjustments',
    'helpless adult children and other unmodeled dependency classes',
  ],
} as const;

export type CompensationRating = 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;
export type DependentParentCount = 0 | 1 | 2;

export interface CompensationInputs {
  disabilityRating: CompensationRating;
  hasSpouse: boolean;
  dependentParents: DependentParentCount;
  childrenUnder18: number;
  schoolChildrenOver18: number;
  spouseAidAndAttendance: boolean;
}

export type CompensationLineItemKind =
  | 'base'
  | 'additional-child-under-18'
  | 'schoolchild-over-18'
  | 'spouse-aid-and-attendance';

export interface CompensationLineItem {
  kind: CompensationLineItemKind;
  label: string;
  amountCents: number;
}

export interface CompensationEstimate {
  totalCents: number;
  total: number;
  lineItems: CompensationLineItem[];
  metadata: typeof COMPENSATION_2026_METADATA;
}

export class CompensationInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompensationInputError';
  }
}

const RATINGS = [30, 40, 50, 60, 70, 80, 90, 100] as const;
const FLAT: Record<10 | 20, number> = { 10: 18042, 20: 35666 };

const NO_CHILD = {
  veteran: [55247, 79584, 113290, 143502, 180845, 210215, 236230, 393858],
  spouse: [61747, 88284, 124190, 156602, 196145, 227715, 255930, 415817],
  spouse1Parent: [66947, 95284, 132990, 167102, 208445, 241715, 271730, 433441],
  spouse2Parents: [72147, 102284, 141790, 177602, 220745, 255715, 287530, 451065],
  oneParent: [60447, 86584, 122090, 154002, 193145, 224215, 252030, 411482],
  twoParents: [65647, 93584, 130890, 164502, 205445, 238215, 267830, 429106],
} as const;

const ONE_CHILD_UNDER_18 = {
  veteran: [59647, 85384, 120590, 152302, 191045, 221915, 249430, 408543],
  spouse: [66647, 94784, 132290, 166302, 207445, 240615, 270430, 431899],
  spouse1Parent: [71847, 101784, 141090, 176802, 219745, 254615, 286230, 449523],
  spouse2Parents: [77047, 108784, 149890, 187302, 232045, 268615, 302030, 467147],
  oneParent: [64847, 92384, 129390, 162802, 203345, 235915, 265230, 426167],
  twoParents: [70047, 99384, 138190, 173302, 215645, 249915, 281030, 443791],
} as const;

const ADDITIONAL_CHILD_UNDER_18 = [3200, 4300, 5400, 6500, 7600, 8700, 9800, 10911] as const;
const SCHOOLCHILD_OVER_18 = [10500, 14000, 17600, 21100, 24600, 28100, 31700, 35245] as const;
const SPOUSE_AID_AND_ATTENDANCE = [6100, 8100, 10100, 12100, 14100, 16100, 18100, 20141] as const;

type TableKey = keyof typeof NO_CHILD;

function tableKey(hasSpouse: boolean, parents: DependentParentCount): TableKey {
  if (hasSpouse) {
    if (parents === 2) return 'spouse2Parents';
    if (parents === 1) return 'spouse1Parent';
    return 'spouse';
  }
  if (parents === 2) return 'twoParents';
  if (parents === 1) return 'oneParent';
  return 'veteran';
}

export function validateCompensationInputs(inputs: CompensationInputs): void {
  if (![10, 20, ...RATINGS].includes(inputs.disabilityRating)) {
    throw new CompensationInputError('The combined rating must be 10 through 100 in steps of 10.');
  }
  if (![0, 1, 2].includes(inputs.dependentParents)) {
    throw new CompensationInputError('Dependent parents must be zero, one, or two.');
  }
  for (const [label, value] of [
    ['Children under 18', inputs.childrenUnder18],
    ['Schoolchildren over 18', inputs.schoolChildrenOver18],
  ] as const) {
    if (!Number.isSafeInteger(value) || value < 0 || value > 20) {
      throw new CompensationInputError(`${label} must be a whole number from 0 through 20.`);
    }
  }
  if (inputs.spouseAidAndAttendance && !inputs.hasSpouse) {
    throw new CompensationInputError('Spouse Aid and Attendance requires a spouse.');
  }
}

export function calculateCompensationEstimate(
  inputs: CompensationInputs,
): CompensationEstimate {
  validateCompensationInputs(inputs);
  if (inputs.disabilityRating === 10 || inputs.disabilityRating === 20) {
    const totalCents = FLAT[inputs.disabilityRating];
    return {
      totalCents,
      total: totalCents / 100,
      lineItems: [{ kind: 'base', label: `${inputs.disabilityRating}% base rate`, amountCents: totalCents }],
      metadata: COMPENSATION_2026_METADATA,
    };
  }

  const index = RATINGS.indexOf(inputs.disabilityRating);
  const key = tableKey(inputs.hasSpouse, inputs.dependentParents);
  const hasMinorChild = inputs.childrenUnder18 > 0;
  const baseCents = (hasMinorChild ? ONE_CHILD_UNDER_18 : NO_CHILD)[key][index];
  const lineItems: CompensationLineItem[] = [
    {
      kind: 'base',
      label: hasMinorChild ? 'Base rate including one child under 18' : 'Base rate',
      amountCents: baseCents,
    },
  ];

  const additionalMinorCount = Math.max(0, inputs.childrenUnder18 - 1);
  if (additionalMinorCount) {
    lineItems.push({
      kind: 'additional-child-under-18',
      label: `${additionalMinorCount} additional ${additionalMinorCount === 1 ? 'child' : 'children'} under 18`,
      amountCents: additionalMinorCount * ADDITIONAL_CHILD_UNDER_18[index],
    });
  }
  if (inputs.schoolChildrenOver18) {
    lineItems.push({
      kind: 'schoolchild-over-18',
      label: `${inputs.schoolChildrenOver18} qualifying ${inputs.schoolChildrenOver18 === 1 ? 'schoolchild' : 'schoolchildren'} over 18`,
      amountCents: inputs.schoolChildrenOver18 * SCHOOLCHILD_OVER_18[index],
    });
  }
  if (inputs.spouseAidAndAttendance) {
    lineItems.push({
      kind: 'spouse-aid-and-attendance',
      label: 'Spouse Aid and Attendance addition',
      amountCents: SPOUSE_AID_AND_ATTENDANCE[index],
    });
  }

  const totalCents = lineItems.reduce((sum, item) => sum + item.amountCents, 0);
  return { totalCents, total: totalCents / 100, lineItems, metadata: COMPENSATION_2026_METADATA };
}

export function isCompensationRateReviewDue(asOf = new Date()): boolean {
  return asOf >= new Date(`${COMPENSATION_2026_METADATA.reviewDueDate}T00:00:00Z`);
}
