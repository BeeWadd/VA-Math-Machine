import React, { useState, useRef, useEffect } from 'react';

// Define option structure
export interface CustomSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomSelectProps {
  label: string;
  options: CustomSelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ label, options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find(option => option.value === value);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
        const item = listRef.current.children[highlightedIndex] as HTMLLIElement;
        item?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        if(!isOpen) setHighlightedIndex(options.findIndex(o => o.value === value));
    }
    if (e.key === 'Escape') {
        setIsOpen(false);
    }
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if(!isOpen) setIsOpen(true);
        setHighlightedIndex(prev => (prev + 1) % options.length);
    }
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if(!isOpen) setIsOpen(true);
        setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
    }
    if (e.key === 'Enter' && isOpen && highlightedIndex >= 0) {
        handleSelect(options[highlightedIndex]);
    }
  };

  const handleSelect = (option: CustomSelectOption) => {
    onChange(option.value);
    setIsOpen(false);
    setHighlightedIndex(-1);
    (wrapperRef.current?.querySelector('button') as HTMLButtonElement)?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        className="relative w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-left cursor-default focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`block truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
          {selectedOption ? selectedOption.label : placeholder || 'Select an option'}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
          tabIndex={-1}
          role="listbox"
          aria-activedescendant={highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              className={`cursor-default select-none relative py-2 pl-3 pr-9 ${highlightedIndex === index ? 'text-white bg-brand-accent' : 'text-gray-900'}`}
              id={`option-${index}`}
              role="option"
              aria-selected={value === option.value}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex flex-col">
                <span className="font-normal block truncate">
                  {option.label}
                </span>
                {option.description && (
                  <span className={`text-xs ${highlightedIndex === index ? 'text-blue-100' : 'text-gray-500'}`}>
                    {option.description}
                  </span>
                )}
              </div>
               {value === option.value && (
                <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${highlightedIndex === index ? 'text-white' : 'text-brand-accent'}`}>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;