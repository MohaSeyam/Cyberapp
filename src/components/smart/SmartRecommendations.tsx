import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, Target, Clock, TrendingUp, BookOpen, 
  Zap, Star, Award, Brain, Rocket, Calendar, Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { animations } from '../../constants/theme';

interface Recommendation {
  id: string;
  type: 'task' | 'resource' | 'tip' | 'challenge';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: React.ComponentType<any>;
  action?: () => void;
  category: string;
  estimatedTime?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface UserProgress {
  completedTasks: number;
  totalTasks: number;
  currentStreak: number;
  averageTimePerTask: number;
  weakAreas: string[];
  strongAreas: string[];
  lastActivity: Date;
  preferredTime: string;
  learningStyle: 'visual' | 'practical' | 'theoretical';
}

export default function SmartRecommendations() {
  const { plan, progress, appState } = useApp();
  const { t, language } = useLocalization();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // تحليل تقدم المستخدم
  const analyzeUserProgress = useMemo(() => {
    if (!plan || !progress) return null;

    const completedTasks = progress.filter(p => p.done).length;
    const totalTasks = plan.reduce((total, week) => {
      return total + week.days.filter(day => day.key !== 'fri').reduce((dayTotal, day) => {
        return dayTotal + (day.tasks?.length || 0);
      }, 0);
    }, 0);

    // تحليل المناطق الضعيفة والقوية
    const taskTypes = progress.reduce((acc, p) => {
      const task = plan.flatMap(w => w.days.flatMap(d => d.tasks)).find(t => t.id === p.taskId);
      if (task) {
        const type = task.type || 'general';
        acc[type] = (acc[type] || 0) + (p.done ? 1 : 0);
      }
      return acc;
    }, {} as Record<string, number>);

    const weakAreas = Object.entries(taskTypes)
      .filter(([_, completed]) => completed < 2)
      .map(([type]) => type);

    const strongAreas = Object.entries(taskTypes)
      .filter(([_, completed]) => completed >= 3)
      .map(([type]) => type);

    // حساب متوسط الوقت لكل مهمة
    const averageTimePerTask = progress.length > 0 
      ? progress.reduce((total, p) => total + (p.timeSpent || 30), 0) / progress.length 
      : 30;

    return {
      completedTasks,
      totalTasks,
      currentStreak: calculateCurrentStreak(progress),
      averageTimePerTask,
      weakAreas,
      strongAreas,
      lastActivity: new Date(Math.max(...progress.map(p => new Date(p.completedAt || Date.now()).getTime()))),
      preferredTime: determinePreferredTime(progress),
      learningStyle: determineLearningStyle(progress, plan)
    };
  }, [plan, progress]);

  // حساب التتابع الحالي
  const calculateCurrentStreak = (progress: any[]) => {
    const sortedProgress = progress
      .filter(p => p.done)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedProgress.length; i++) {
      const taskDate = new Date(sortedProgress[i].completedAt);
      taskDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // تحديد الوقت المفضل
  const determinePreferredTime = (progress: any[]) => {
    const timeSlots = progress
      .filter(p => p.done && p.completedAt)
      .map(p => new Date(p.completedAt).getHours());

    if (timeSlots.length === 0) return 'morning';

    const morning = timeSlots.filter(h => h >= 6 && h < 12).length;
    const afternoon = timeSlots.filter(h => h >= 12 && h < 18).length;
    const evening = timeSlots.filter(h => h >= 18 && h < 22).length;

    if (morning >= afternoon && morning >= evening) return 'morning';
    if (afternoon >= evening) return 'afternoon';
    return 'evening';
  };

  // تحديد أسلوب التعلم
  const determineLearningStyle = (progress: any[], plan: any[]) => {
    const completedTasks = progress.filter(p => p.done);
    const taskTypes = completedTasks.map(p => {
      const task = plan.flatMap(w => w.days.flatMap(d => d.tasks)).find(t => t.id === p.taskId);
      return task?.type || 'general';
    });

    const visual = taskTypes.filter(t => ['video', 'reading', 'diagram'].includes(t)).length;
    const practical = taskTypes.filter(t => ['hands-on', 'lab', 'practice'].includes(t)).length;
    const theoretical = taskTypes.filter(t => ['theory', 'concept', 'research'].includes(t)).length;

    if (practical >= visual && practical >= theoretical) return 'practical';
    if (visual >= theoretical) return 'visual';
    return 'theoretical';
  };

  // إنشاء التوصيات الذكية
  const generateRecommendations = useMemo(() => {
    if (!analyzeUserProgress) return [];

    const recs: Recommendation[] = [];

    // توصيات بناءً على المناطق الضعيفة
    analyzeUserProgress.weakAreas.forEach(area => {
      recs.push({
        id: `weak-${area}`,
        type: 'task',
        title: language === 'ar' ? `تحسين مهارات ${area}` : `Improve ${area} skills`,
        description: language === 'ar' 
          ? `ركز على تطوير مهارات ${area} من خلال ممارسة المزيد من التمارين`
          : `Focus on developing ${area} skills through more practice exercises`,
        priority: 'high',
        icon: Target,
        category: area,
        estimatedTime: 45,
        difficulty: 'beginner'
      });
    });

    // توصيات بناءً على التتابع
    if (analyzeUserProgress.currentStreak < 3) {
      recs.push({
        id: 'build-streak',
        type: 'challenge',
        title: language === 'ar' ? 'بناء التتابع' : 'Build Your Streak',
        description: language === 'ar' 
          ? 'حاول إكمال مهمة واحدة كل يوم لبناء تتابع قوي'
          : 'Try to complete one task daily to build a strong streak',
        priority: 'high',
        icon: Flame,
        category: 'motivation',
        estimatedTime: 20,
        difficulty: 'beginner'
      });
    }

    // توصيات بناءً على أسلوب التعلم
    if (analyzeUserProgress.learningStyle === 'practical') {
      recs.push({
        id: 'hands-on-practice',
        type: 'resource',
        title: language === 'ar' ? 'تمارين عملية' : 'Hands-on Practice',
        description: language === 'ar' 
          ? 'جرب المختبرات الافتراضية والتمارين العملية'
          : 'Try virtual labs and hands-on exercises',
        priority: 'medium',
        icon: Zap,
        category: 'practice',
        estimatedTime: 60,
        difficulty: 'intermediate'
      });
    }

    // توصيات بناءً على الوقت المفضل
    const timeRecommendations = {
      morning: {
        title: language === 'ar' ? 'تعلم في الصباح' : 'Morning Learning',
        description: language === 'ar' 
          ? 'استفد من طاقتك الصباحية للتعلم العميق'
          : 'Take advantage of your morning energy for deep learning'
      },
      afternoon: {
        title: language === 'ar' ? 'جلسة بعد الظهر' : 'Afternoon Session',
        description: language === 'ar' 
          ? 'وقت مثالي للمراجعة والتطبيق العملي'
          : 'Perfect time for review and practical application'
      },
      evening: {
        title: language === 'ar' ? 'تعلم مسائي' : 'Evening Learning',
        description: language === 'ar' 
          ? 'ركز على المفاهيم النظرية والمراجعة'
          : 'Focus on theoretical concepts and review'
      }
    };

    recs.push({
      id: 'time-optimization',
      type: 'tip',
      title: timeRecommendations[analyzeUserProgress.preferredTime].title,
      description: timeRecommendations[analyzeUserProgress.preferredTime].description,
      priority: 'medium',
      icon: Clock,
      category: 'optimization',
      estimatedTime: 30,
      difficulty: 'beginner'
    });

    // توصيات بناءً على معدل الإنجاز
    const completionRate = (analyzeUserProgress.completedTasks / analyzeUserProgress.totalTasks) * 100;
    
    if (completionRate < 30) {
      recs.push({
        id: 'start-small',
        type: 'tip',
        title: language === 'ar' ? 'ابدأ صغيراً' : 'Start Small',
        description: language === 'ar' 
          ? 'ركز على مهمة واحدة يومياً لبناء العادة'
          : 'Focus on one task daily to build the habit',
        priority: 'high',
        icon: Rocket,
        category: 'motivation',
        estimatedTime: 15,
        difficulty: 'beginner'
      });
    } else if (completionRate > 70) {
      recs.push({
        id: 'advanced-challenge',
        type: 'challenge',
        title: language === 'ar' ? 'تحدي متقدم' : 'Advanced Challenge',
        description: language === 'ar' 
          ? 'جرب مشاريع أكثر تعقيداً لاختبار مهاراتك'
          : 'Try more complex projects to test your skills',
        priority: 'medium',
        icon: Star,
        category: 'advanced',
        estimatedTime: 120,
        difficulty: 'advanced'
      });
    }

    return recs.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [analyzeUserProgress, language]);

  useEffect(() => {
    if (analyzeUserProgress) {
      setUserProgress(analyzeUserProgress);
      setRecommendations(generateRecommendations);
      setLoading(false);
    }
  }, [analyzeUserProgress, generateRecommendations]);

  const handleRecommendationClick = (recommendation: Recommendation) => {
    // تنفيذ الإجراء المطلوب
    if (recommendation.action) {
      recommendation.action();
    }
    
    // تسجيل التفاعل مع التوصية
    console.log('User clicked recommendation:', recommendation.id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'advanced': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* عنوان القسم */}
      <motion.div
        {...animations.fadeIn}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {language === 'ar' ? 'التوصيات الذكية' : 'Smart Recommendations'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {language === 'ar' 
            ? 'توصيات مخصصة بناءً على تقدمك وأسلوب تعلمك'
            : 'Personalized recommendations based on your progress and learning style'
          }
        </p>
      </motion.div>

      {/* إحصائيات سريعة */}
      {userProgress && (
        <motion.div
          {...animations.fadeIn}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((userProgress.completedTasks / userProgress.totalTasks) * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'معدل الإنجاز' : 'Completion Rate'}
            </div>
          </Card>
          
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-orange-600">
              {userProgress.currentStreak}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'أيام التتابع' : 'Streak Days'}
            </div>
          </Card>
          
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(userProgress.averageTimePerTask)}m
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'متوسط الوقت' : 'Avg Time'}
            </div>
          </Card>
        </motion.div>
      )}

      {/* قائمة التوصيات */}
      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.id}
            {...animations.stagger(index * 0.1)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-300"
              onClick={() => handleRecommendationClick(recommendation)}
            >
              <div className="flex items-start space-x-4 rtl:space-x-reverse">
                <div className={`p-3 rounded-full ${getPriorityColor(recommendation.priority)}`}>
                  <recommendation.icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {recommendation.title}
                    </h3>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                        {language === 'ar' 
                          ? recommendation.priority === 'high' ? 'عالية' : recommendation.priority === 'medium' ? 'متوسطة' : 'منخفضة'
                          : recommendation.priority
                        }
                      </span>
                      {recommendation.difficulty && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recommendation.difficulty)}`}>
                          {language === 'ar' 
                            ? recommendation.difficulty === 'beginner' ? 'مبتدئ' : recommendation.difficulty === 'intermediate' ? 'متوسط' : 'متقدم'
                            : recommendation.difficulty
                          }
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {recommendation.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500">
                      {recommendation.estimatedTime && (
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {recommendation.estimatedTime} {language === 'ar' ? 'دقيقة' : 'min'}
                        </span>
                      )}
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {recommendation.category}
                      </span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {language === 'ar' ? 'ابدأ' : 'Start'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* رسالة إذا لم توجد توصيات */}
      {recommendations.length === 0 && (
        <motion.div
          {...animations.fadeIn}
          className="text-center py-12"
        >
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'لا توجد توصيات حالياً' : 'No recommendations available'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'ar' 
              ? 'اكمل المزيد من المهام لتلقي توصيات مخصصة'
              : 'Complete more tasks to receive personalized recommendations'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
}