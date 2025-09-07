import React from 'react';
import { DependencyStatus } from '../types.ts';
import { DEPENDENCY_OPTIONS } from '../constants.ts';
import Select from './ui/Select.tsx';

interface DependencySelectorProps {
  selectedStatus: DependencyStatus;
  onStatusChange: (status: DependencyStatus) => void;
}

const DependencySelector: React.FC<DependencySelectorProps> = ({ selectedStatus, onStatusChange }) => {
  return (
    <div>
      <Select
        label="Family Status"
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value as DependencyStatus)}
      >
        {DEPENDENCY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default DependencySelector;