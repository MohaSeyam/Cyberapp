import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Grid, List, Filter, Search, ChevronDown, ChevronUp
} from 'lucide-react';
import PhaseCard from './PhaseCard';
import { phaseService } from '../../services/phaseService';
import { animations } from '../../constants/theme';

interface PhasesListProps {
  completedWeeks: number[];
  onPhaseClick?: (phaseId: number) => void;
  lang: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'progress' | 'difficulty' | 'duration' | 'name';

export default function PhasesList({ completedWeeks, onPhaseClick, lang }: PhasesListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('progress');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get all phases with stats
  const phasesWithStats = phaseService.getAllPhasesWithStats(completedWeeks);
  const currentPhase = phaseService.getCurrentPhase(completedWeeks);

  // Filter and sort phases
  const filteredAndSortedPhases = phasesWithStats
    .filter(phase => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        phase.title[lang].toLowerCase().includes(searchLower) ||
        phase.focus[lang].toLowerCase().includes(searchLower) ||
        phase.mainContent[lang].toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return b.stats.progress - a.stats.progress;
        case 'difficulty':
          const difficultyOrder = { 'مبتدئ': 1, 'مبتدئ - متوسط': 2, 'متوسط': 3, 'متوسط - متقدم': 4, 'متقدم': 5, 'خبير': 6 };
          return (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) - 
                 (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0);
        case 'duration':
          return parseInt(a.duration) - parseInt(b.duration);
        case 'name':
          return a.title[lang].localeCompare(b.title[lang]);
        default:
          return 0;
      }
    });

  const handlePhaseClick = (phaseId: number) => {
    if (onPhaseClick) {
      onPhaseClick(phaseId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={lang === 'ar' ? 'البحث في المراحل...' : 'Search phases...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* View Mode and Filters */}
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">{lang === 'ar' ? 'ترتيب' : 'Sort'}</span>
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
        >
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'ar' ? 'ترتيب حسب' : 'Sort by'}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="progress">{lang === 'ar' ? 'التقدم' : 'Progress'}</option>
                <option value="difficulty">{lang === 'ar' ? 'الصعوبة' : 'Difficulty'}</option>
                <option value="duration">{lang === 'ar' ? 'المدة' : 'Duration'}</option>
                <option value="name">{lang === 'ar' ? 'الاسم' : 'Name'}</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Current Phase Indicator */}
      {currentPhase && (
        <motion.div
          {...animations.fadeIn}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                {lang === 'ar' ? 'المرحلة الحالية' : 'Current Phase'}: {currentPhase.title[lang]}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {currentPhase.stats.remainingWeeks} {lang === 'ar' ? 'أسبوع متبقي' : 'weeks remaining'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Phases Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredAndSortedPhases.map((phase, index) => (
          <motion.div
            key={phase.id}
            {...animations.stagger(index * 0.1)}
            className={viewMode === 'list' ? 'w-full' : ''}
          >
            <PhaseCard
              phase={phase}
              isActive={currentPhase?.id === phase.id}
              onClick={() => handlePhaseClick(phase.id)}
              lang={lang}
            />
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedPhases.length === 0 && (
        <motion.div
          {...animations.fadeIn}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {lang === 'ar' ? 'لا توجد مراحل' : 'No phases found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {lang === 'ar' 
              ? 'جرب تغيير معايير البحث أو الترتيب' 
              : 'Try changing your search criteria or sorting options'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
}