import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Clock, Hash, MessageSquare, Lightbulb, 
  ChevronDown, ChevronUp, Copy, Check, Sparkles
} from 'lucide-react';
import { useSimpleLocalization } from '../../context/SimpleLocalizationContext';
import { generateComprehensiveSummary } from '../../utils/summarizer';

const SummaryWidget = ({ content, onClose }) => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Safe access to useSimpleLocalization
  let localizationData;
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    console.error('Error accessing useSimpleLocalization:', error);
    localizationData = {
      language: 'ar',
      direction: 'rtl',
      isRTL: true,
      toggleLanguage: () => {}
    };
  }
  const { language } = localizationData;

  useEffect(() => {
    if (content) {
      setIsLoading(true);
      // Simulate processing time for better UX
      setTimeout(() => {
        const result = generateComprehensiveSummary(content);
        setSummary(result);
        setIsLoading(false);
      }, 500);
    }
  }, [content]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const tabs = [
    {
      id: 'summary',
      label: language === 'ar' ? 'الملخص' : 'Summary',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      id: 'keypoints',
      label: language === 'ar' ? 'النقاط الرئيسية' : 'Key Points',
      icon: Hash,
      color: 'text-green-600'
    },
    {
      id: 'questions',
      label: language === 'ar' ? 'الأسئلة' : 'Questions',
      icon: MessageSquare,
      color: 'text-purple-600'
    },
    {
      id: 'stats',
      label: language === 'ar' ? 'الإحصائيات' : 'Stats',
      icon: Clock,
      color: 'text-orange-600'
    }
  ];

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'جاري إنشاء الملخص...' : 'Generating Summary...'}
            </h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {language === 'ar' ? 'الملخص الذكي' : 'Smart Summary'}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title={language === 'ar' ? 'توسيع/طي' : 'Expand/Collapse'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {language === 'ar' ? 'الملخص المختصر' : 'Brief Summary'}
                </h4>
                <button
                  onClick={() => copyToClipboard(summary.summary)}
                  className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? (language === 'ar' ? 'تم النسخ' : 'Copied') : (language === 'ar' ? 'نسخ' : 'Copy')}
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {summary.summary}
              </p>
            </motion.div>
          )}

          {activeTab === 'keypoints' && (
            <motion.div
              key="keypoints"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {language === 'ar' ? 'النقاط الرئيسية' : 'Key Points'}
                </h4>
                <button
                  onClick={() => copyToClipboard(summary.keyPoints.join('\n• '))}
                  className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? (language === 'ar' ? 'تم النسخ' : 'Copied') : (language === 'ar' ? 'نسخ' : 'Copy')}
                </button>
              </div>
              <ul className="space-y-2">
                {summary.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {activeTab === 'questions' && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {language === 'ar' ? 'أسئلة للتفكير' : 'Questions to Consider'}
                </h4>
                <button
                  onClick={() => copyToClipboard(summary.questions.join('\n• '))}
                  className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? (language === 'ar' ? 'تم النسخ' : 'Copied') : (language === 'ar' ? 'نسخ' : 'Copy')}
                </button>
              </div>
              <ul className="space-y-2">
                {summary.questions.map((question, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">?</span>
                    <span className="text-gray-700 dark:text-gray-300">{question}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h4 className="font-medium text-gray-900 dark:text-white">
                {language === 'ar' ? 'إحصائيات النص' : 'Text Statistics'}
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {language === 'ar' ? 'عدد الكلمات' : 'Word Count'}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {summary.wordCount}
                  </span>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600 dark:text-orange-400">
                      {language === 'ar' ? 'وقت القراءة' : 'Reading Time'}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {summary.readingTime} {language === 'ar' ? 'دقيقة' : 'min'}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'نصائح للقراءة' : 'Reading Tips'}
                  </span>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• {language === 'ar' ? 'اقرأ النقاط الرئيسية أولاً' : 'Read key points first'}</li>
                  <li>• {language === 'ar' ? 'فكر في الأسئلة المطروحة' : 'Consider the questions raised'}</li>
                  <li>• {language === 'ar' ? 'راجع الملخص للمراجعة السريعة' : 'Review summary for quick revision'}</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SummaryWidget;