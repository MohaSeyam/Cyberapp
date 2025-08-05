import React from 'react';
import { Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface JournalSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: 'newest' | 'oldest' | 'title';
  setSortBy: (sort: 'newest' | 'oldest' | 'title') => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  availableTags: string[];
  language: string;
}

const JournalSearchBar = React.memo(({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  selectedTag,
  setSelectedTag,
  availableTags,
  language
}: JournalSearchBarProps) => {
  const sortOptions = [
    { value: 'newest', label: { ar: 'الأحدث', en: 'Newest' } },
    { value: 'oldest', label: { ar: 'الأقدم', en: 'Oldest' } },
    { value: 'title', label: { ar: 'حسب العنوان', en: 'By Title' } }
  ];

  return (
    <motion.div 
      className="mb-6 space-y-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={language === 'ar' ? 'البحث في المدونات...' : 'Search journal entries...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>{language === 'ar' ? 'فلترة' : 'Filter'}</span>
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label[language as keyof typeof option.label]}
            </option>
          ))}
        </select>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <motion.div 
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'فلترة حسب التاق' : 'Filter by Tag'}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag('')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTag === '' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {language === 'ar' ? 'الكل' : 'All'}
                </button>
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTag === tag 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});

export default JournalSearchBar;