import React from 'react';
import { CalculationResult } from '../types.ts';
import Button from './ui/Button.tsx';
import Card from './ui/Card.tsx';

interface ResultsDisplayProps {
  results: CalculationResult;
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onReset }) => {
  const {
    bilateralFactor,
    combinedBodyRating,
    finalRoundedRating,
    monthlyCompensation,
    calculationSteps,
  } = results;

  const handlePrint = () => {
    window.print();
  };

  const ResultRow: React.FC<{ label: string; value: string; isPrimary?: boolean }> = ({ label, value, isPrimary = false }) => (
    <div className={`flex justify-between items-baseline ${isPrimary ? 'text-lg' : 'text-base'} py-2 border-b border-gray-200 last:border-b-0`}>
      <span className="text-gray-600">{label}</span>
      <span className={`font-bold ${isPrimary ? 'text-brand-blue' : 'text-gray-800'}`}>{value}</span>
    </div>
  );

  return (
    <Card title="4. Your Estimated Benefits">
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Monthly Payment</h3>
                <div className="bg-brand-secondary text-brand-blue text-center p-6 rounded-lg">
                    <p className="text-4xl lg:text-5xl font-extrabold">
                        ${monthlyCompensation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-lg font-semibold mt-1">per month</p>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">Based on VA compensation rates effective December 1, 2024.</p>
            </div>

            <div>
                 <h3 className="text-lg font-semibold text-gray-700 mb-2">Rating Calculation</h3>
                 <div className="space-y-1">
                    {bilateralFactor > 0 && <ResultRow label="Bilateral Factor" value={`${bilateralFactor.toFixed(1)}%`} />}
                    <ResultRow label="Combined Body Rating" value={`${combinedBodyRating.toFixed(1)}%`} />
                    <ResultRow label="Rounded VA Rating" value={`${finalRoundedRating}%`} isPrimary={true} />
                 </div>
            </div>
            
            <div className="flex space-x-2">
                <Button onClick={onReset} variant="secondary" className="w-full">
                    Reset
                </Button>
                <Button onClick={handlePrint} variant="primary" className="w-full">
                    Export as PDF
                </Button>
            </div>


            <details className="bg-gray-50 rounded-lg p-3">
                <summary className="font-semibold text-gray-600 cursor-pointer">View Calculation Steps</summary>
                <ul className="mt-2 text-sm text-gray-500 list-disc list-inside space-y-1">
                   {calculationSteps.map((step, index) => <li key={index}>{step}</li>)}
                </ul>
            </details>
        </div>
    </Card>
  );
};

export default ResultsDisplay;