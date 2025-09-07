import { useMemo } from 'react';
import { Disability, DependencyStatus, CalculationResult, Laterality } from '../types.ts';
import { compensationRates } from '../data/compensationRates.ts';

// VA Math: Combines two ratings
const combineRatings = (r1: number, r2: number): number => {
    return r1 + r2 * (1 - r1 / 100);
};

// Normalizes a condition name to group potential bilateral pairs
const normalizeNameForBilateralCheck = (name: string): string => {
    return name
        .toLowerCase()
        // remove left/right and common abbreviations
        .replace(/\b(left|right|lft|rgt|l\b|r\b)\b/g, '')
        // remove punctuation
        .replace(/[^\w\s]/g, '')
        // collapse multiple spaces to a single space
        .replace(/\s+/g, ' ')
        .trim();
};

export const useVaCalculator = (disabilities: Disability[], dependencyStatus: DependencyStatus): CalculationResult => {
    return useMemo(() => {
        const calculationSteps: string[] = [];

        if (disabilities.length === 0) {
            return {
                bilateralFactor: 0,
                combinedBodyRating: 0,
                finalRoundedRating: 0,
                monthlyCompensation: 0,
                calculationSteps: ["Add a disability rating to begin."]
            };
        }
        
        calculationSteps.push(`Starting calculation with ${disabilities.length} ratings.`);
        
        // Step 1: Identify bilateral pairs and separate other ratings
        const bilateralEligible = disabilities.filter(d => d.laterality === Laterality.LEFT || d.laterality === Laterality.RIGHT);
        const nonBilateralRatings = disabilities
            .filter(d => d.laterality === Laterality.NONE)
            .map(d => d.rating);

        const groupedByName: { [key: string]: Disability[] } = {};
        for (const disability of bilateralEligible) {
            const normalizedName = normalizeNameForBilateralCheck(disability.name);
            if (!groupedByName[normalizedName]) {
                groupedByName[normalizedName] = [];
            }
            groupedByName[normalizedName].push(disability);
        }
        
        const bilateralPairRatings: number[] = [];
        
        // Find pairs and process them. Unpaired limbs get added to the main list.
        Object.entries(groupedByName).forEach(([normalizedName, group]) => {
            const hasLeft = group.some(d => d.laterality === Laterality.LEFT);
            const hasRight = group.some(d => d.laterality === Laterality.RIGHT);
            
            if (hasLeft && hasRight) {
                const capitalizedPairName = normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);
                calculationSteps.push(`Found bilateral pair for: ${capitalizedPairName}.`);
                group.forEach(d => bilateralPairRatings.push(d.rating));
            } else {
                // Not a pair, so treat as individual ratings
                group.forEach(d => {
                    const side = d.laterality.charAt(0) + d.laterality.slice(1).toLowerCase();
                    calculationSteps.push(`Treating ${d.name} (${side}) as a non-bilateral rating as it has no pair.`);
                    nonBilateralRatings.push(d.rating);
                });
            }
        });

        let bilateralCombined = 0;
        let bilateralFactor = 0;
        
        // Step 2: Calculate Bilateral Factor if pairs were found (38 CFR § 4.26)
        if (bilateralPairRatings.length > 0) {
            const sortedPairRatings = [...bilateralPairRatings].sort((a, b) => b - a);
            calculationSteps.push(`Combining bilateral pair ratings (${sortedPairRatings.join('%, ')}%) for bilateral factor.`);
            
            bilateralCombined = sortedPairRatings.reduce((acc, current) => combineRatings(acc, current), 0);
            calculationSteps.push(`Combined bilateral rating = ${bilateralCombined.toFixed(1)}%`);
            
            bilateralFactor = bilateralCombined * 0.1;
            calculationSteps.push(`Bilateral factor (10% of combined) = ${bilateralFactor.toFixed(1)}%`);
        } else {
            calculationSteps.push("No bilateral pairs found. No bilateral factor to apply.");
        }

        // Step 3: Create a final list of all ratings to be combined
        const allRatings = [...nonBilateralRatings];
        if (bilateralCombined > 0) {
            allRatings.push(bilateralCombined);
        }
        if (bilateralFactor > 0) {
            allRatings.push(bilateralFactor);
        }
        
        // Handle case where there are no ratings to combine (e.g. only one side of a pair is entered)
        if (allRatings.length === 0) {
             return {
                bilateralFactor: 0,
                combinedBodyRating: 0,
                finalRoundedRating: 0,
                monthlyCompensation: 0,
                calculationSteps: [...calculationSteps, "No ratings available for final combination."]
            };
        }

        // Sort from highest to lowest for VA combination math
        allRatings.sort((a, b) => b - a);
        calculationSteps.push(`Final ratings to combine (sorted): ${allRatings.map(r => r.toFixed(1)).join('%, ')}%`);
        

        // Step 4: Combine all ratings (38 CFR § 4.25)
        const combinedBodyRating = allRatings.reduce((acc, current) => combineRatings(acc, current), 0);
        calculationSteps.push(`Combined Body Rating = ${combinedBodyRating.toFixed(1)}%`);
        
        // Step 5: Round to the nearest 10
        const finalRoundedRating = Math.round(combinedBodyRating / 10) * 10;
        calculationSteps.push(`Rounding ${combinedBodyRating.toFixed(1)}% to the nearest 10% = ${finalRoundedRating}%`);
        
        // Step 6: Determine monthly compensation
        const monthlyCompensation = compensationRates[finalRoundedRating]?.[dependencyStatus] ?? 0;
        calculationSteps.push(`Monthly compensation for ${finalRoundedRating}% rating: $${monthlyCompensation.toFixed(2)}`);

        return {
            bilateralFactor,
            combinedBodyRating,
            finalRoundedRating,
            monthlyCompensation,
            calculationSteps
        };
    }, [disabilities, dependencyStatus]);
};