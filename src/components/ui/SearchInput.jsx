import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchInput({ 
  placeholder = "البحث...",
  onSearch,
  className = "",
  debounceMs = 300
}) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(query);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, onSearch, debounceMs]);

  const handleClear = () => {
    setQuery("");
    if (onSearch) onSearch("");
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-10 py-2.5 rounded-xl border transition-all duration-200
            bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100
            border-gray-200 dark:border-gray-700
            focus:border-light-accent dark:focus:border-dark-accent
            focus:ring-2 focus:ring-light-accent/20 dark:focus:ring-dark-accent/20
            placeholder-gray-400 dark:placeholder-gray-500
            ${isFocused ? 'shadow-lg' : 'shadow-sm'}
          `}
        />
        
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      {/* Search suggestions dropdown */}
      <AnimatePresence>
        {isFocused && query && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            <div className="p-2">
              <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
                البحث عن: "{query}"
              </div>
              {/* Add search results here */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}