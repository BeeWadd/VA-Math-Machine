import React, { useState, useMemo, useEffect } from 'react';
import { Disability, DisabilityCondition, Laterality } from '../types';
import { disabilityConditions } from '../data/disabilityConditions';
import { MENTAL_HEALTH_CONDITIONS } from '../constants';
import Button from './ui/Button';
import Select from './ui/Select';
import Card from './ui/Card';
import CustomSelect, { CustomSelectOption } from './ui/CustomSelect';

interface DisabilityInputFormProps {
  onAddDisability: (disability: Omit<Disability, 'id'>) => void;
  existingDisabilities: Disability[];
}

const CUSTOM_CONDITION_VALUE = 'CUSTOM_CONDITION';

const DisabilityInputForm: React.FC<DisabilityInputFormProps> = ({ onAddDisability, existingDisabilities }) => {
  const sortedConditions = useMemo(() => 
    [...disabilityConditions].sort((a, b) => a.name.localeCompare(b.name)), 
    []
  );

  const [selectedConditionName, setSelectedConditionName] = useState<string>('');
  const [customConditionName, setCustomConditionName] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<string>('');
  const [selectedLaterality, setSelectedLaterality] = useState<Laterality | ''>('');
  const [error, setError] = useState<string | null>(null);

  const isCustomMode = selectedConditionName === CUSTOM_CONDITION_VALUE;

  const selectedCondition = useMemo((): DisabilityCondition | undefined => {
    if (isCustomMode) return undefined;
    return sortedConditions.find(c => c.name === selectedConditionName);
  }, [selectedConditionName, sortedConditions, isCustomMode]);

  const conditionOptions: CustomSelectOption[] = useMemo(() => [
    { value: CUSTOM_CONDITION_VALUE, label: '-- Add a custom condition --', description: 'For conditions not listed below' },
    ...sortedConditions.map(c => ({
      value: c.name,
      label: c.name,
      description: c.description
    }))
  ], [sortedConditions]);


  useEffect(() => {
    setError(null);
    if (!selectedConditionName) return;

    const conditionNameForCheck = isCustomMode ? customConditionName.trim() : selectedConditionName;

    if (!conditionNameForCheck && !isCustomMode) return;
    
    // Duplicate check
    const lateralityForCheck = selectedLaterality;
    if (lateralityForCheck === '') return;

    const isDuplicate = existingDisabilities.some(d => 
        d.name === conditionNameForCheck && d.laterality === lateralityForCheck
    );

    if (isDuplicate && lateralityForCheck !== Laterality.NONE) {
        setError('This specific condition (with side) has already been added.');
        return;
    }
    
    // Mental health check for all conditions
    const isMentalHealthCondition = MENTAL_HEALTH_CONDITIONS.includes(conditionNameForCheck);
    const hasExistingMentalHealth = existingDisabilities.some(d => MENTAL_HEALTH_CONDITIONS.includes(d.name));
    if (isMentalHealthCondition && hasExistingMentalHealth) {
      setError('Only one mental health condition can be rated. The VA combines them into a single rating.');
      return;
    }
  }, [selectedConditionName, selectedLaterality, existingDisabilities, selectedCondition, customConditionName, isCustomMode]);

  const handleConditionChange = (newConditionName: string) => {
    setSelectedConditionName(newConditionName);
    setSelectedRating('');
    setCustomConditionName('');
    
    if (newConditionName === CUSTOM_CONDITION_VALUE) {
        setSelectedLaterality(Laterality.NONE);
        return;
    }

    const condition = sortedConditions.find(c => c.name === newConditionName);
    if (condition?.canBeBilateral) {
      setSelectedLaterality(''); // Force user to make a selection
    } else {
      setSelectedLaterality(Laterality.NONE);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (error) return;

    const name = isCustomMode ? customConditionName.trim() : selectedConditionName;
    if (!name || !selectedRating) return;
        
    if (selectedLaterality === '') return;

    onAddDisability({
      name: name,
      rating: Number(selectedRating),
      laterality: selectedLaterality as Laterality,
    });
    
    setSelectedConditionName('');
    setSelectedRating('');
    setSelectedLaterality('');
    setCustomConditionName('');
  };

  const ratingOptions = useMemo(() => {
    if (isCustomMode) {
      return Array.from({ length: 11 }, (_, i) => i * 10); // 0, 10, ..., 100
    }
    return selectedCondition?.ratings ?? [];
  }, [isCustomMode, selectedCondition]);

  const isAddButtonDisabled = !!error || 
                             !selectedConditionName || 
                             !selectedRating ||
                             (isCustomMode && !customConditionName.trim()) ||
                             selectedLaterality === '';

  return (
    <Card title="1. Add Disability Ratings">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                 <CustomSelect
                    label="Condition"
                    options={conditionOptions}
                    value={selectedConditionName}
                    onChange={handleConditionChange}
                    placeholder="Select a condition"
                />
            </div>

            {isCustomMode && (
                <div>
                    <label htmlFor="custom-condition" className="block text-sm font-medium text-gray-700 mb-1">Custom Condition Name</label>
                    <input
                        type="text"
                        id="custom-condition"
                        value={customConditionName}
                        onChange={(e) => setCustomConditionName(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm text-gray-900"
                        placeholder="e.g., Left Ankle Instability"
                        required
                    />
                </div>
            )}

            <div>
                <Select
                    label="Rating"
                    value={selectedRating}
                    onChange={(e) => setSelectedRating(e.target.value)}
                    disabled={!selectedConditionName}
                >
                    <option value="" disabled>Select a rating</option>
                    {ratingOptions.map((rating) => (
                        <option key={rating} value={rating}>
                            {rating}%
                        </option>
                    ))}
                </Select>
            </div>
            
            {((!isCustomMode && selectedCondition?.canBeBilateral) || isCustomMode) && selectedConditionName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Laterality (Side affected)</label>
                <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="laterality"
                          value={Laterality.NONE}
                          checked={selectedLaterality === Laterality.NONE}
                          onChange={(e) => setSelectedLaterality(e.target.value as Laterality)}
                          className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-gray-300"
                        />
                        <span className="text-gray-800">None</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="laterality"
                          value={Laterality.LEFT}
                          checked={selectedLaterality === Laterality.LEFT}
                          onChange={(e) => setSelectedLaterality(e.target.value as Laterality)}
                          className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-gray-300"
                        />
                        <span className="text-gray-800">Left</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="laterality"
                          value={Laterality.RIGHT}
                          checked={selectedLaterality === Laterality.RIGHT}
                          onChange={(e) => setSelectedLaterality(e.target.value as Laterality)}
                          className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-gray-300"
                        />
                        <span className="text-gray-800">Right</span>
                    </label>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md" role="alert">
                <p className="font-bold">Cannot Add Condition</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isAddButtonDisabled}>
                Add Rating
            </Button>
        </form>
    </Card>
  );
};

export default DisabilityInputForm;