// Progress Page - Enhanced with Tabs, Skills Matrix, and Charts
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Clock, Flame, Trophy, BarChart3, PieChart, 
  TrendingUp, Award, Star, Users, BookOpen, Zap,
  CheckCircle, Circle, Calendar, Activity, ArrowRight,
  LineChart, Brain, Lightbulb
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { animations } from '../constants/theme';
import { WeekPhaseProvider } from '../components/WeekPhaseProvider';
import OverallProgressCard from '../components/progress/OverallProgressCard';

// Tab Types
type TabType = 'overview' | 'analytics' | 'skills' | 'achievements' | 'suggestions';

// Skills Matrix Interface
interface Skill {
  id: string;
  name: string;
  category: string;
  level: number; // 0-5
  description: string;
  color: string;
}

export default function ProgressPage() {
  const { plan, progress } = useApp();
  const lang = 'ar'; // Default to Arabic
  const { t } = useLocalization();
  
  // Safe translation function
  const safeT = (key: string) => {
    try {
      return t ? t(key) : key;
    } catch (error) {
      console.warn('Translation function not available:', error);
      return key;
    }
  };
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('all');

  // Safety checks for data
  const safePlan = plan || [];
  const safeProgress = progress || [];

  // استخراج مهمة بناءً على id
  const getTaskById = (taskId: string) =>
    safePlan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).find(t => t.id === taskId);

  // Calculate statistics with safety checks
  const totalWeeks = safePlan.length;
  const totalTasks = safePlan.reduce((total, week) => 
    total + (week.days || []).reduce((dayTotal, day) => dayTotal + (day.tasks || []).length, 0), 0
  );
  const completedTasks = safeProgress.filter(p => p.done).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate total duration with safety checks
  const totalDuration = safePlan.reduce((total, week) => 
    total + (week.days || []).reduce((dayTotal, day) => 
      dayTotal + (day.tasks || []).reduce((taskTotal, task) => taskTotal + (task.duration || 0), 0), 0
    ), 0
  );
  
  const completedDuration = safeProgress.reduce((total, p) => {
    const task = safePlan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).find(t => t.id === p.taskId);
    return total + (task?.duration || 0);
  }, 0);

  // Calculate streak information
  const calculateStreak = () => {
    if (safeProgress.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    const completedDates = safeProgress
      .filter(p => p.done)
      .map(p => new Date(p.updatedAt || 0).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (completedDates.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    for (let i = 0; i < completedDates.length; i++) {
      const currentDate = new Date(completedDates[i]);
      const nextDate = i < completedDates.length - 1 ? new Date(completedDates[i + 1]) : null;
      
      if (nextDate) {
        const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak + 1);
          tempStreak = 0;
        }
      } else {
        tempStreak++;
      }
      
      if (i === 0) {
        const daysSinceLastActivity = Math.floor((Date.now() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastActivity === 0 || daysSinceLastActivity === 1) {
          currentStreak = tempStreak;
        } else if (daysSinceLastActivity === 2 && completedDates.includes(yesterday)) {
          currentStreak = tempStreak;
        } else {
          currentStreak = 0;
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return { currentStreak, longestStreak };
  };
  
  const { currentStreak, longestStreak } = calculateStreak();

  // Get last activity
  const lastActivity = safeProgress
    .filter(p => p.done)
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())[0];

  // Calculate task types distribution (including Policies)
  const completedTaskTypes = safeProgress
    .filter(p => p.done)
    .map(p => {
      const task = safePlan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).find(t => t.id === p.taskId);
      return task?.type;
    })
    .filter(Boolean);

  const blueTeamTasks = completedTaskTypes.filter(type => type === 'Blue Team').length;
  const redTeamTasks = completedTaskTypes.filter(type => type === 'Red Team').length;
  const practicalTasks = completedTaskTypes.filter(type => type === 'Practical').length;
  const theoreticalTasks = completedTaskTypes.filter(type => type === 'Theoretical').length;
  const policiesTasks = completedTaskTypes.filter(type => type === 'Policies').length;

  // Skills Matrix Data
  const skillsMatrix: Skill[] = useMemo(() => [
    {
      id: '1',
      name: lang === 'ar' ? 'التحليل الجنائي' : 'Forensic Analysis',
      category: lang === 'ar' ? 'التحليل' : 'Analysis',
      level: Math.min(5, Math.floor(blueTeamTasks / 3)),
      description: lang === 'ar' ? 'مهارات تحليل الأدلة الرقمية' : 'Digital evidence analysis skills',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: lang === 'ar' ? 'اختبار الاختراق' : 'Penetration Testing',
      category: lang === 'ar' ? 'الهجوم' : 'Offensive',
      level: Math.min(5, Math.floor(redTeamTasks / 3)),
      description: lang === 'ar' ? 'مهارات اختبار الاختراق' : 'Penetration testing skills',
      color: 'bg-red-500'
    },
    {
      id: '3',
      name: lang === 'ar' ? 'التحليل العملي' : 'Practical Analysis',
      category: lang === 'ar' ? 'التطبيق' : 'Practical',
      level: Math.min(5, Math.floor(practicalTasks / 2)),
      description: lang === 'ar' ? 'مهارات التطبيق العملي' : 'Practical application skills',
      color: 'bg-green-500'
    },
    {
      id: '4',
      name: lang === 'ar' ? 'المفاهيم النظرية' : 'Theoretical Concepts',
      category: lang === 'ar' ? 'النظرية' : 'Theory',
      level: Math.min(5, Math.floor(theoreticalTasks / 2)),
      description: lang === 'ar' ? 'فهم المفاهيم النظرية' : 'Understanding theoretical concepts',
      color: 'bg-purple-500'
    },
    {
      id: '5',
      name: lang === 'ar' ? 'السياسات والإجراءات' : 'Policies & Procedures',
      category: lang === 'ar' ? 'السياسات' : 'Policies',
      level: Math.min(5, Math.floor(policiesTasks / 2)),
      description: lang === 'ar' ? 'فهم السياسات والإجراءات' : 'Understanding policies and procedures',
      color: 'bg-orange-500'
    },
    {
      id: '6',
      name: lang === 'ar' ? 'الأمن السيبراني' : 'Cybersecurity',
      category: lang === 'ar' ? 'الأمن' : 'Security',
      level: Math.min(5, Math.floor((blueTeamTasks + redTeamTasks) / 4)),
      description: lang === 'ar' ? 'مهارات الأمن السيبراني الشاملة' : 'Comprehensive cybersecurity skills',
      color: 'bg-indigo-500'
    }
  ], [blueTeamTasks, redTeamTasks, practicalTasks, theoreticalTasks, policiesTasks]);

  // Smart Suggestions System
  const suggestions = useMemo(() => {
    const suggestionsList = [];

    if (completedTasks === 0) {
      suggestionsList.push({
        icon: ArrowRight,
        title: lang === 'ar' ? 'ابدأ رحلتك' : 'Start Your Journey',
        description: lang === 'ar' ? 'ابدأ بأول مهمة لتبدأ رحلتك في الأمن السيبراني' : 'Start with your first task to begin your cybersecurity journey',
        type: 'motivation',
        priority: 'high',
        color: 'text-blue-600',
        bg: 'bg-blue-50'
      });
    }

    if (completionRate < 30) {
      suggestionsList.push({
        icon: Clock,
        title: lang === 'ar' ? 'خصص وقتاً منتظماً' : 'Set Regular Time',
        description: lang === 'ar' ? 'خصص 30 دقيقة يومياً للتعلم لتحسين تقدمك' : 'Set aside 30 minutes daily for learning to improve your progress',
        type: 'time-management',
        priority: 'high',
        color: 'text-orange-600',
        bg: 'bg-orange-50'
      });
    }

    if (currentStreak === 0 && completedTasks > 0) {
      suggestionsList.push({
        icon: Flame,
        title: lang === 'ar' ? 'استعد نشاطك' : 'Get Back on Track',
        description: lang === 'ar' ? 'استعد نشاطك اليومي لبناء عادة التعلم' : 'Get back to daily activity to build learning habits',
        type: 'motivation',
        priority: 'medium',
        color: 'text-red-600',
        bg: 'bg-red-50'
      });
    }

    if (blueTeamTasks < redTeamTasks) {
      suggestionsList.push({
        icon: ArrowRight,
        title: lang === 'ar' ? 'ركز على الدفاع' : 'Focus on Defense',
        description: lang === 'ar' ? 'ركز على مهام الفريق الأزرق لتحسين مهارات الدفاع' : 'Focus on blue team tasks to improve defensive skills',
        type: 'skill-balance',
        priority: 'medium',
        color: 'text-blue-600',
        bg: 'bg-blue-50'
      });
    }

    if (policiesTasks < 2) {
      suggestionsList.push({
        icon: BookOpen,
        title: lang === 'ar' ? 'تعلم السياسات' : 'Learn Policies',
        description: lang === 'ar' ? 'ركز على مهام السياسات لفهم الإجراءات الأمنية' : 'Focus on policy tasks to understand security procedures',
        type: 'skill-balance',
        priority: 'medium',
        color: 'text-orange-600',
        bg: 'bg-orange-50'
      });
    }

    return suggestionsList;
  }, [completedTasks, completionRate, currentStreak, blueTeamTasks, redTeamTasks, policiesTasks]);

  // Tab Components
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div {...animations.fadeIn}>
          <Card className="text-center p-6">
            <div className="flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</h3>
            <p className="text-gray-600 dark:text-gray-400">{safeT('completionRate')}</p>
          </Card>
        </motion.div>

        <motion.div {...animations.fadeIn} transition={{ delay: 0.1 }}>
          <Card className="text-center p-6">
            <div className="flex items-center justify-center mb-4">
              <Flame className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{currentStreak}</h3>
            <p className="text-gray-600 dark:text-gray-400">{safeT('currentStreak')}</p>
          </Card>
        </motion.div>

        <motion.div {...animations.fadeIn} transition={{ delay: 0.2 }}>
          <Card className="text-center p-6">
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(completedDuration / 60)}</h3>
            <p className="text-gray-600 dark:text-gray-400">{safeT('hoursLearned')}</p>
          </Card>
        </motion.div>

        <motion.div {...animations.fadeIn} transition={{ delay: 0.3 }}>
          <Card className="text-center p-6">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{longestStreak}</h3>
            <p className="text-gray-600 dark:text-gray-400">{safeT('longestStreak')}</p>
          </Card>
        </motion.div>
      </div>

      {/* Task Types Distribution */}
                <Card title={safeT('taskTypesDistribution')} subtitle={safeT('distributionOfCompletedTasks')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{blueTeamTasks}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{safeT('blueTeam')}</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{redTeamTasks}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{safeT('redTeam')}</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{practicalTasks}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{safeT('practical')}</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{theoreticalTasks}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{safeT('theoretical')}</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{policiesTasks}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{safeT('policies')}</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card title={safeT('progressOverTime')} subtitle={safeT('weeklyProgressChart')}>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">{safeT('chartComingSoon')}</p>
            </div>
          </div>
        </Card>

        <Card title={safeT('taskTypePieChart')} subtitle={safeT('distributionVisualization')}>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <PieChart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">{safeT('chartComingSoon')}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Card title={safeT('detailedStatistics')} subtitle={safeT('comprehensiveAnalysis')}>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">{safeT('totalWeeks')}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{totalWeeks}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">{safeT('totalTasks')}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{totalTasks}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">{safeT('completedTasks')}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{completedTasks}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">{safeT('totalDuration')}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{Math.round(totalDuration / 60)} {safeT('hours')}</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const SkillsTab = () => (
    <div className="space-y-6">
      {/* Skills Matrix */}
      <Card title={safeT('skillsMatrix')} subtitle={safeT('yourSkillLevels')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillsMatrix.map((skill, index) => (
            <motion.div key={skill.id} {...animations.stagger(index * 0.1)}>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{skill.name}</h4>
                  <div className={`w-3 h-3 rounded-full ${skill.color}`}></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{skill.description}</p>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-4 h-4 rounded-full ${
                        level <= skill.level ? skill.color : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {skill.level}/5 {safeT('level')}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Skills Categories */}
      <Card title={safeT('skillCategories')} subtitle={safeT('categoryBreakdown')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(new Set(skillsMatrix.map(s => s.category))).map((category, index) => {
            const categorySkills = skillsMatrix.filter(s => s.category === category);
            const avgLevel = Math.round(categorySkills.reduce((sum, s) => sum + s.level, 0) / categorySkills.length);
            return (
              <motion.div key={category} {...animations.stagger(index * 0.1)}>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{category}</h4>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{avgLevel}/5</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{categorySkills.length} {safeT('skills')}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const AchievementsTab = () => (
    <div className="space-y-6">
      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            id: 'first-task',
            title: lang === 'ar' ? 'الخطوة الأولى' : 'First Step',
            description: lang === 'ar' ? 'أكمل أول مهمة' : 'Complete your first task',
            icon: Target,
            unlocked: completedTasks >= 1,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
          },
          {
            id: 'streak-3',
            title: lang === 'ar' ? 'نشاط مستمر' : 'Consistent Activity',
            description: lang === 'ar' ? 'حافظ على نشاط 3 أيام متتالية' : 'Maintain 3-day streak',
            icon: Flame,
            unlocked: currentStreak >= 3,
            color: 'text-orange-600',
            bg: 'bg-orange-50'
          },
          {
            id: 'blue-team',
            title: lang === 'ar' ? 'محلل دفاعي' : 'Defensive Analyst',
            description: lang === 'ar' ? 'أكمل 5 مهام فريق أزرق' : 'Complete 5 blue team tasks',
            icon: ArrowRight,
            unlocked: blueTeamTasks >= 5,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
          },
          {
            id: 'red-team',
            title: lang === 'ar' ? 'مخترق أخلاقي' : 'Ethical Hacker',
            description: lang === 'ar' ? 'أكمل 5 مهام فريق أحمر' : 'Complete 5 red team tasks',
            icon: Zap,
            unlocked: redTeamTasks >= 5,
            color: 'text-red-600',
            bg: 'bg-red-50'
          },
          {
            id: 'policies',
            title: lang === 'ar' ? 'خبير السياسات' : 'Policy Expert',
            description: lang === 'ar' ? 'أكمل 3 مهام سياسات' : 'Complete 3 policy tasks',
            icon: BookOpen,
            unlocked: policiesTasks >= 3,
            color: 'text-orange-600',
            bg: 'bg-orange-50'
          },
          {
            id: 'completion-50',
            title: lang === 'ar' ? 'نصف الطريق' : 'Halfway There',
            description: lang === 'ar' ? 'أكمل 50% من المهام' : 'Complete 50% of tasks',
            icon: Trophy,
            unlocked: completionRate >= 50,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50'
          }
        ].map((achievement, index) => (
          <motion.div key={achievement.id} {...animations.stagger(index * 0.1)}>
            <Card className={`p-6 text-center transition-all duration-300 ${
              achievement.unlocked ? achievement.bg : 'bg-gray-50 dark:bg-gray-800'
            }`}>
              <div className={`flex items-center justify-center mb-4 ${
                achievement.unlocked ? achievement.color : 'text-gray-400'
              }`}>
                <achievement.icon className="w-8 h-8" />
              </div>
              <h4 className={`font-semibold mb-2 ${
                achievement.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {achievement.title}
              </h4>
              <p className={`text-sm ${
                achievement.unlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {achievement.description}
              </p>
              {achievement.unlocked && (
                <div className="mt-3">
                  <CheckCircle className="w-5 h-5 mx-auto text-green-600 dark:text-green-400" />
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const SuggestionsTab = () => (
    <div className="space-y-6">
      {/* Smart Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suggestions.map((suggestion, index) => (
          <motion.div key={index} {...animations.stagger(index * 0.1)}>
            <Card className={`p-6 ${suggestion.bg} dark:bg-gray-800`}>
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${suggestion.bg.replace('bg-', 'bg-').replace('-50', '-100')}`}>
                  <suggestion.icon className={`w-6 h-6 ${suggestion.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold mb-2 ${suggestion.color}`}>
                    {suggestion.title}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {suggestion.description}
                  </p>
                  <div className="mt-3">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      suggestion.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {suggestion.priority === 'high' ? (lang === 'ar' ? 'عالية' : 'High') :
                       suggestion.priority === 'medium' ? (lang === 'ar' ? 'متوسطة' : 'Medium') :
                       (lang === 'ar' ? 'منخفضة' : 'Low')} {lang === 'ar' ? 'الأولوية' : 'Priority'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {suggestions.length === 0 && (
        <Card className="text-center py-12">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {lang === 'ar' ? 'ممتاز!' : 'Excellent!'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {lang === 'ar' ? 'أنت على المسار الصحيح. استمر في التعلم!' : 'You\'re on the right track. Keep learning!'}
          </p>
        </Card>
      )}
    </div>
  );

  // Tab Configuration
  const tabs = [
    { id: 'overview', label: lang === 'ar' ? 'نظرة عامة' : 'Overview', icon: BarChart3 },
    { id: 'analytics', label: lang === 'ar' ? 'التحليلات' : 'Analytics', icon: LineChart },
    { id: 'skills', label: lang === 'ar' ? 'المهارات' : 'Skills', icon: Brain },
    { id: 'achievements', label: lang === 'ar' ? 'الإنجازات' : 'Achievements', icon: Trophy },
    { id: 'suggestions', label: lang === 'ar' ? 'الاقتراحات' : 'Suggestions', icon: Lightbulb }
  ];

  return (
    <WeekPhaseProvider>
      <PageLayout 
        title={safeT('progress')}
        subtitle={safeT('trackYourLearning')}
        showBottomBar={true}
      >
        <motion.div {...animations.fadeIn} className="space-y-6">
          
          {/* Overall Progress Card - Using New Component */}
          <OverallProgressCard />

          {/* Tabs Navigation */}
          <Card>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  icon={tab.icon}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </Card>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'skills' && <SkillsTab />}
            {activeTab === 'achievements' && <AchievementsTab />}
            {activeTab === 'suggestions' && <SuggestionsTab />}
          </div>
        </motion.div>
      </PageLayout>
    </WeekPhaseProvider>
  );
}