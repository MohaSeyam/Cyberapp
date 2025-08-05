import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Tag, Edit2, Trash2 } from 'lucide-react';
import Card from '../ui/Card';

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  dayKey: string;
  dayInfo?: {
    week?: any;
    day?: any;
  };
}

interface JournalListProps {
  entries: JournalEntry[];
  onEntryClick: (entryId: number) => void;
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entryId: number) => void;
  getDayTitle: (dayKey: string, weekId: number) => string;
  language: string;
}

const JournalList = React.memo(({
  entries,
  onEntryClick,
  onEditEntry,
  onDeleteEntry,
  getDayTitle,
  language
}: JournalListProps) => {
  if (entries.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">
            {language === 'ar' ? 'لا توجد مدونات' : 'No journal entries found'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {language === 'ar' ? 'المدونات' : 'Journal Entries'} ({entries.length})
        </h2>
      </div>

      <div className="space-y-2">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
            onClick={() => onEntryClick(entry.id)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {entry.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {entry.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>
                    {new Date(entry.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                  {entry.dayInfo?.day && (
                    <span className="text-blue-600 dark:text-blue-400">
                      {getDayTitle(entry.dayKey, entry.dayInfo.week?.id || 0)}
                    </span>
                  )}
                </div>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex space-x-1">
                    {entry.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {entry.tags.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        +{entry.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditEntry(entry);
                  }}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={language === 'ar' ? 'تعديل' : 'Edit'}
                >
                  <Edit2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEntry(entry.id);
                  }}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  title={language === 'ar' ? 'حذف' : 'Delete'}
                >
                  <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
});

export default JournalList;