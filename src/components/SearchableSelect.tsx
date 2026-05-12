import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Check, User } from 'lucide-react';

interface Option {
  value: number | string;
  label: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: number | string;
  onChange: (value: number | string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  showAvatar?: boolean;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
  searchPlaceholder = 'Cari...',
  emptyText = 'Tidak ada data',
  disabled = false,
  showAvatar = false,
  className = '',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.subLabel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optValue: number | string) => {
    onChange(optValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(0);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2 px-4 py-2.5
          bg-white border rounded-xl transition-all duration-200
          ${isOpen ? 'border-primary ring-2 ring-blue-100' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showAvatar && selectedOption && (
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
              {selectedOption.label.charAt(0).toUpperCase()}
            </div>
          )}
          {selectedOption ? (
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium text-gray-900 truncate">{selectedOption.label}</div>
              {selectedOption.subLabel && (
                <div className="text-xs text-gray-500 truncate">{selectedOption.subLabel}</div>
              )}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
            {options.length > 10 && (
              <div className="mt-2 text-xs text-gray-500">
                {filteredOptions.length} dari {options.length} data
              </div>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto">
            {/* Empty Option */}
            <button
              type="button"
              onClick={() => handleSelect(0)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                hover:bg-gray-50 border-b border-gray-50
                ${!value ? 'bg-primary/5' : ''}
              `}
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 italic">Tidak Terhubung</div>
              </div>
              {!value && <Check className="w-5 h-5 text-primary" />}
            </button>

            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <User className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <div className="text-sm">{emptyText}</div>
                {searchTerm && <div className="text-xs mt-1">Coba kata kunci lain</div>}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                    hover:bg-primary/5 
                    ${option.value === value ? 'bg-primary/5' : ''}
                    ${index < filteredOptions.length - 1 ? 'border-b border-gray-50' : ''}
                  `}
                >
                  {showAvatar && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                      {option.label.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{option.label}</div>
                    {option.subLabel && (
                      <div className="text-xs text-gray-500 truncate">{option.subLabel}</div>
                    )}
                  </div>
                  {option.value === value && <Check className="flex-shrink-0 w-5 h-5 text-primary" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
