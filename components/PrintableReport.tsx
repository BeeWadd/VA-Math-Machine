import React from 'react';
import { Disability, CalculationResult, DependencyStatus, Laterality } from '../types';
import { DEPENDENCY_OPTIONS } from '../constants';

interface PrintableReportProps {
  disabilities: Disability[];
  results: CalculationResult;
  dependencyStatus: DependencyStatus;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ disabilities, results, dependencyStatus }) => {

  const dependencyLabel = DEPENDENCY_OPTIONS.find(opt => opt.value === dependencyStatus)?.label || 'Veteran Only';
  
  const getDisabilityDisplayName = (disability: Disability): string => {
    if (disability.laterality !== Laterality.NONE) {
      const side = disability.laterality.charAt(0) + disability.laterality.slice(1).toLowerCase();
      return `${disability.name} (${side})`;
    }
    return disability.name;
  };

  return (
    <div className="hidden print:block font-sans p-8">
      <header className="mb-8 text-center border-b-2 border-gray-300 pb-4">
        <h1 className="text-3xl font-bold text-brand-blue">VA Math Machine Estimate</h1>
        <p className="text-gray-600 mt-1">Generated on: {new Date().toLocaleDateString()}</p>
      </header>

      <main>
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">Estimated Monthly Compensation</h2>
          <div className="bg-brand-secondary text-brand-blue text-center p-6 rounded-lg border border-brand-accent">
            <p className="text-5xl font-extrabold">
              ${results.monthlyCompensation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-lg font-semibold mt-1">per month</p>
          </div>
          <p className="text-sm text-gray-600 text-center mt-2">
            Based on a <span className="font-semibold">{results.finalRoundedRating}%</span> rating with status: <span className="font-semibold">{dependencyLabel}</span>.
          </p>
        </section>

        <section className="mb-8 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Calculation Summary</h2>
            <div className="space-y-2 text-lg">
                <div className="flex justify-between items-baseline">
                    <span>Combined Body Rating:</span>
                    <span className="font-bold">{results.combinedBodyRating.toFixed(1)}%</span>
                </div>
                {results.bilateralFactor > 0 && (
                    <div className="flex justify-between items-baseline">
                        <span>Bilateral Factor Bonus:</span>
                        <span className="font-bold">{results.bilateralFactor.toFixed(1)}%</span>
                    </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t mt-2">
                    <span className="font-semibold text-brand-blue">Final VA Rating (Rounded):</span>
                    <span className="font-extrabold text-2xl text-brand-blue">{results.finalRoundedRating}%</span>
                </div>
            </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Your Disability Ratings</h2>
          {disabilities.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Condition</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Rating</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {disabilities.map(d => (
                    <tr key={d.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getDisabilityDisplayName(d)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-bold">{d.rating}%</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          ) : (
            <p className="text-gray-500">No disabilities were added.</p>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Calculation Breakdown</h2>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <ul className="text-sm text-gray-700 list-decimal list-inside space-y-1">
              {results.calculationSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="mt-12 pt-4 border-t text-xs text-gray-500 text-center">
        <p>
          <strong>Disclaimer:</strong> This calculator is an estimation tool and is not affiliated with the U.S. Department of Veterans' Affairs. It is based on publicly available VA regulations (38 CFR § 4.25 & 4.26) and compensation rates effective December 1, 2024. It is not an official VA tool and should not be considered a guarantee of benefits. For official information, please consult the U.S. Department of Veterans Affairs at VA.gov.
        </p>
      </footer>
    </div>
  );
};

export default PrintableReport;