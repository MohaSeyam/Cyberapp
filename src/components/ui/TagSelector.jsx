import React from 'react';
import { motion } from 'framer-motion';
import { X, Tag } from 'lucide-react';

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-blue-600" />
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            التاجات المختارة
          </label>
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
            {selectedTags.length}/{maxTags}
          </span>
        </div>
        {selectedTags.length > 0 && (
          <motion.button
            onClick={() => onTagsChange([])}
            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-3 h-3" />
            مسح الكل
          </motion.button>
        )}
      </div>
      
      {/* Available Tags */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">
          اختر من التاجات المتاحة:
        </div>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map(tag => (
            <motion.button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                selectedTags.includes(tag)
                  ? 'bg-blue-600 text-white border-blue-700 shadow-lg transform scale-105'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-500'
              } ${
                !selectedTags.includes(tag) && selectedTags.length >= maxTags
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:scale-105'
              }`}
              whileHover={selectedTags.includes(tag) || selectedTags.length < maxTags ? { scale: 1.05 } : {}}
              whileTap={selectedTags.includes(tag) || selectedTags.length < maxTags ? { scale: 0.95 } : {}}
              disabled={!selectedTags.includes(tag) && selectedTags.length >= maxTags}
              title={!selectedTags.includes(tag) && selectedTags.length >= maxTags ? `الحد الأقصى ${maxTags} تاجات` : `إضافة ${tag}`}
            >
              {tag}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <motion.div 
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              التاجات المختارة ({selectedTags.length}):
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <motion.span
                key={tag}
                className="px-3 py-2 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-sm rounded-lg flex items-center gap-2 font-medium border border-blue-200 dark:border-blue-700"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-100 transition-colors duration-200 hover:scale-110"
                  title="إزالة التاج"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Max Tags Warning */}
      {selectedTags.length >= maxTags && (
        <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
          ⚠️ وصلت للحد الأقصى من التاجات ({maxTags}). يمكنك إزالة تاج لإضافة آخر.
        </div>
      )}
    </div>
  );
}