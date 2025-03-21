import React, { useState, useEffect, useRef } from 'react';

interface AutocompleteProps {
  suggestions: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  required?: boolean;
}

const Autocomplete = ({ 
  suggestions, 
  value, 
  onChange, 
  placeholder, 
  className = "", 
  required = false 
}: AutocompleteProps) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input value
  useEffect(() => {
    if (!value || !value.trim()) {
      setFilteredSuggestions([]);
      return;
    }
    
    const filtered = suggestions.filter(
      suggestion => suggestion.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 10); // Limit to 10 suggestions
    
    setFilteredSuggestions(filtered);
  }, [value, suggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value;
    onChange(userInput);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        onChange(filteredSuggestions[highlightedIndex]);
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    }
    // Up arrow
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (highlightedIndex > 0) {
        setHighlightedIndex(highlightedIndex - 1);
      } else {
        setHighlightedIndex(filteredSuggestions.length - 1);
      }
    }
    // Down arrow
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (highlightedIndex < filteredSuggestions.length - 1) {
        setHighlightedIndex(highlightedIndex + 1);
      } else {
        setHighlightedIndex(0);
      }
    }
    // Escape key
    else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => value && setShowSuggestions(true)}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
        required={required}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                index === highlightedIndex ? 'bg-indigo-100' : ''
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete; 