import React from 'react';
import { motion } from 'framer-motion';

const AVAILABLE_TAGS = [
  "مهم", "مراجعة", "معلومة", "تجربة", "تحذير", "مصطلح", "سؤال", "ملخص", 
  "تطبيق عملي", "ملاحظة شخصية", "أمان", "اختراق", "دفاع", "هجوم", 
  "شبكات", "برمجة", "أدوات", "تقنيات", "أفضل الممارسات", "نصائح"
];

export default function TagSelector({ selectedTags = [], onTagsChange, maxTags = 5 }) {
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          التاجات ({selectedTags.length}/{maxTags})
        </label>
        {selectedTags.length > 0 && (
          <button
            onClick={() => onTagsChange([])}
            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            مسح الكل
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_TAGS.map(tag => (
          <motion.button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
              selectedTags.includes(tag)
                ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600'
            } ${
              !selectedTags.includes(tag) && selectedTags.length >= maxTags
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
            whileHover={selectedTags.includes(tag) || selectedTags.length < maxTags ? { scale: 1.05 } : {}}
            whileTap={selectedTags.includes(tag) || selectedTags.length < maxTags ? { scale: 0.95 } : {}}
            disabled={!selectedTags.includes(tag) && selectedTags.length >= maxTags}
          >
            {tag}
          </motion.button>
        ))}
      </div>
      
      {selectedTags.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            التاجات المختارة:
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-xs rounded-full flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}