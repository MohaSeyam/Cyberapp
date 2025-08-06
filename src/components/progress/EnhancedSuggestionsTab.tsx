import Card from '../ui/Card';
import React from 'react';
import { Lightbulb, Sparkles, TrendingUp, Target, CheckCircle, Clock, BookOpen, Zap } from 'lucide-react';

const EnhancedSuggestionsTab = React.memo(({ language }) => {
  const suggestions = [
    {
      id: 'time-management',
      title: language === 'ar' ? 'إدارة الوقت' : 'Time Management',
      description: language === 'ar' ? 'خصص وقتًا محددًا يوميًا للتعلم' : 'Set aside dedicated time daily for learning',
      icon: Clock,
      priority: 'high',
      category: 'productivity'
    },
    {
      id: 'practice-more',
      title: language === 'ar' ? 'الممارسة العملية' : 'Practical Practice',
      description: language === 'ar' ? 'ركز على المهام العملية أكثر من النظرية' : 'Focus on practical tasks over theoretical ones',
      icon: Target,
      priority: 'medium',
      category: 'learning'
    },
    {
      id: 'consistency',
      title: language === 'ar' ? 'الاستمرارية' : 'Consistency',
      description: language === 'ar' ? 'حافظ على روتين يومي ثابت' : 'Maintain a consistent daily routine',
      icon: TrendingUp,
      priority: 'high',
      category: 'habit'
    },
    {
      id: 'documentation',
      title: language === 'ar' ? 'توثيق التعلم' : 'Document Learning',
      description: language === 'ar' ? 'اكتب ملاحظات مفصلة عن كل ما تتعلمه' : 'Write detailed notes about everything you learn',
      icon: BookOpen,
      priority: 'medium',
      category: 'study'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'productivity': return 'from-blue-500 to-blue-600';
      case 'learning': return 'from-green-500 to-green-600';
      case 'habit': return 'from-purple-500 to-purple-600';
      case 'study': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Lightbulb className="w-6 h-6 mr-2 text-indigo-500" />
              {language === 'ar' ? 'اقتراحات للتحسين' : 'Improvement Suggestions'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'نصائح مخصصة لتحسين أدائك' : 'Personalized tips to improve your performance'}
            </p>
          </div>
          <Sparkles className="w-8 h-8 text-purple-500" />
        </div>
      </Card>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon;
          return (
            <Card
              key={suggestion.id}
              className="p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full bg-gradient-to-br ${getCategoryColor(suggestion.category)} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {suggestion.title}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                      {language === 'ar' ? 
                        (suggestion.priority === 'high' ? 'عالية' : 
                         suggestion.priority === 'medium' ? 'متوسطة' : 'منخفضة') :
                        suggestion.priority
                      }
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {suggestion.description}
                  </p>
                  <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span className="capitalize">{suggestion.category}</span>
                    <span className="mx-2">•</span>
                    <span>{language === 'ar' ? 'اقتراح مخصص' : 'Personalized'}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Action Card */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'أنت على المسار الصحيح!' : 'You\'re on the right track!'}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'ar' 
              ? 'استمر في التعلم والمثابرة. كل خطوة تقربك من هدفك.'
              : 'Keep learning and persevering. Every step brings you closer to your goal.'
            }
          </p>
        </div>
      </Card>
    </div>
  );
});

export default EnhancedSuggestionsTab;