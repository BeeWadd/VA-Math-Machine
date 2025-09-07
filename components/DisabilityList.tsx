import React from 'react';
import { Disability, Laterality } from '../types.ts';
import Button from './ui/Button.tsx';

interface DisabilityListProps {
  disabilities: Disability[];
  onRemoveDisability: (id: string) => void;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);


const DisabilityList: React.FC<DisabilityListProps> = ({ disabilities, onRemoveDisability }) => {
  if (disabilities.length === 0) {
    return <p className="text-gray-500 text-center">No ratings added yet.</p>;
  }

  const getDisabilityDisplayName = (disability: Disability): string => {
    if (disability.laterality !== Laterality.NONE) {
      const side = disability.laterality.charAt(0) + disability.laterality.slice(1).toLowerCase();
      return `${disability.name} (${side})`;
    }
    return disability.name;
  };

  return (
    <div className="space-y-3">
      {disabilities.map((disability) => {
        const displayName = getDisabilityDisplayName(disability);
        return (
          <div key={disability.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
            <div className="flex-grow">
              <p className="font-semibold text-gray-800">{displayName}</p>
              <div className="flex items-center mt-1">
                <span className="font-bold text-lg text-brand-blue">{disability.rating}%</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button
                variant="danger"
                onClick={() => onRemoveDisability(disability.id)}
                className="px-2 py-1 text-xs"
                aria-label={`Remove ${displayName} - ${disability.rating}% rating`}
              >
                <TrashIcon />
              </Button>
            </div>
          </div>
        );
        })}
    </div>
  );
};

export default DisabilityList;