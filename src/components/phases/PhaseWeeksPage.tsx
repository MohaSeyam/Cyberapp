import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, ChevronRight, ChevronLeft, Target, Clock, 
  CheckCircle, PlayCircle, BookOpen, Users, Award,
  TrendingUp, BarChart3, Activity, Star, Trophy,
  Home, ArrowLeft, Shield, Server, Eye, Search, Cloud, Bug, FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import PageLayout from '../layout/PageLayout';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { animations } from '../../constants/theme';

// Phase icons mapping
const phaseIcons = {
  shield: Shield,
  server: Server,
  eye: Eye,
  search: Search,
  cloud: Cloud
};

// Breadcrumbs component
function Breadcrumbs({ phaseTitle }: { phaseTitle: string }) {
  const navigate = useNavigate();
  
  return (
    <nav className="flex items-center space-x-2 mb-6 text-sm">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
      >
        <Home className="w-4 h-4 mr-1" />
        الرئيسية
      </button>
      
      <span className="flex items-center">
        <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
        <button 
          onClick={() => navigate('/phases')}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          المراحل
        </button>
      </span>
      
      <span className="flex items-center">
        <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
        <span className="text-gray-700 dark:text-gray-200 font-semibold">
          {phaseTitle}
        </span>
      </span>
    </nav>
  );
}

export default function PhaseWeeksPage() {
  const { phaseId = "1" } = useParams<{ phaseId: string }>();
  const navigate = useNavigate();
  const { plan, progress, lang } = useApp();
  const { t } = useLocalization();

  // Safety checks for data
  const safePlan = plan || [];
  const safeProgress = progress || [];

  // Get phase data
  const phases = [
    {
      id: 1,
      title: { ar: "أساسيات الأمن السيبراني", en: "Cybersecurity Foundations" },
      focus: { ar: "بناء المعرفة النظرية والمفاهيم الأساسية", en: "Building theoretical knowledge" },
      duration: "4 أسابيع",
      difficulty: "مبتدئ",
      color: "blue",
      icon: "shield"
    },
    {
      id: 2,
      title: { ar: "التقنيات والأنظمة الأساسية", en: "Core Technologies & Systems" },
      focus: { ar: "فهم وإدارة الأنظمة والتقنيات الجوهرية", en: "Understanding core systems" },
      duration: "4 أسابيع",
      difficulty: "مبتدئ - متوسط",
      color: "green",
      icon: "server"
    },
    {
      id: 3,
      title: { ar: "عقلية المدافع", en: "The Defender's Mindset" },
      focus: { ar: "تعلم أدوات وعمليات الفريق الأزرق", en: "Learning Blue Team tools" },
      duration: "9 أسابيع",
      difficulty: "متوسط",
      color: "indigo",
      icon: "eye"
    },
    {
      id: 4,
      title: { ar: "الدفاع والتحليل المتقدم", en: "Advanced Defense & Analysis" },
      focus: { ar: "التعمق في تقنيات التحليل المتقدمة", en: "Advanced analysis techniques" },
      duration: "8 أسابيع",
      difficulty: "متقدم",
      color: "purple",
      icon: "search"
    },
    {
      id: 5,
      title: { ar: "تأمين البنى التحتية الحديثة", en: "Securing Modern Architectures" },
      focus: { ar: "بناء المهارات لتأمين البيئات الحديثة", en: "Securing modern environments" },
      duration: "7 أسابيع",
      difficulty: "متوسط - متقدم",
      color: "teal",
      icon: "cloud"
    }
  ];

  const currentPhase = phases.find(p => p.id === parseInt(phaseId));
  const phaseWeeks = safePlan.filter(week => week.phase === parseInt(phaseId));

  // Calculate week completion
  const getWeekCompletion = (weekNumber: number) => {
    const week = safePlan.find(w => w.week === weekNumber);
    if (!week) return { completed: 0, total: 0, percentage: 0 };

    const totalTasks = week.days?.reduce((sum, day) => sum + (day.tasks?.length || 0), 0) || 0;
    const weekProgress = safeProgress.filter(p => p.weekId === (weekNumber?.toString() || ''));
    const completedTasks = weekProgress.filter(p => p.done).length;

    return {
      completed: completedTasks,
      total: totalTasks,
      percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  // Calculate phase completion
  const getPhaseCompletion = () => {
    const totalWeeks = phaseWeeks.length;
    const completedWeeks = phaseWeeks.filter(week => {
      const completion = getWeekCompletion(week.week);
      return completion.percentage === 100;
    }).length;

    return {
      totalWeeks,
      completedWeeks,
      progress: totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0
    };
  };

  const goToWeekDays = (weekNumber: number) => {
    navigate(`/days/${weekNumber}`);
  };

  const goToPhases = () => {
    navigate('/phases');
  };

  if (!currentPhase) {
    return (
      <PageLayout title="خطأ" subtitle="المرحلة غير موجودة" showHeader={true}>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            المرحلة غير موجودة
          </h3>
          <Button onClick={goToPhases}>
            العودة للمراحل
          </Button>
        </div>
      </PageLayout>
    );
  }

  const PhaseIcon = phaseIcons[currentPhase.icon as keyof typeof phaseIcons] || Shield;
  const phaseCompletion = getPhaseCompletion();

  // Task type icons and colors mapping
  const taskTypeConfig = {
    'Blue Team': {
      icon: Shield,
      color: 'blue',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    'Red Team': {
      icon: Bug,
      color: 'red',
      bgColor: 'bg-red-100 dark:bg-red-900',
      textColor: 'text-red-600 dark:text-red-400'
    },
    'Particular': {
      icon: Eye,
      color: 'purple',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    'Soft Skills': {
      icon: Users,
      color: 'green',
      bgColor: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-400'
    },
    'Policies': {
      icon: FileText,
      color: 'orange',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      textColor: 'text-orange-600 dark:text-orange-400'
    }
  };

  const breadcrumbs = [
    { label: 'المراحل', icon: Calendar, onClick: goToPhases },
    { label: currentPhase.title[lang], icon: Target }
  ];

  return (
    <PageLayout 
      title={currentPhase.title[lang]} 
      subtitle={currentPhase.focus[lang]} 
      showHeader={true}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        
        {/* Breadcrumbs */}
        <Breadcrumbs phaseTitle={currentPhase.title[lang]} />
        
        {/* Phase Header */}
        <Card className={`bg-gradient-to-r ${
          currentPhase.color === 'blue' ? 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' :
          currentPhase.color === 'green' ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' :
          currentPhase.color === 'indigo' ? 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20' :
          currentPhase.color === 'purple' ? 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' :
          'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft />}
                onClick={goToPhases}
              />
              
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-full ${
                  currentPhase.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                  currentPhase.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                  currentPhase.color === 'indigo' ? 'bg-indigo-100 dark:bg-indigo-900' :
                  currentPhase.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                  'bg-teal-100 dark:bg-teal-900'
                }`}>
                  <PhaseIcon className={`w-6 h-6 ${
                    currentPhase.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    currentPhase.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    currentPhase.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
                    currentPhase.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                    'text-teal-600 dark:text-teal-400'
                  }`} />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentPhase.title[lang]}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentPhase.focus[lang]}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-3xl font-bold ${
                currentPhase.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                currentPhase.color === 'green' ? 'text-green-600 dark:text-green-400' :
                currentPhase.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
                currentPhase.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                'text-teal-600 dark:text-teal-400'
              }`}>
                {phaseCompletion.progress}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                تقدم المرحلة
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                إجمالي الأسابيع
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {phaseCompletion.totalWeeks}
              </p>
            </div>

            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                الأسابيع المكتملة
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {phaseCompletion.completedWeeks}
              </p>
            </div>

            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                المستوى
              </h3>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {currentPhase.difficulty}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  currentPhase.color === 'blue' ? 'bg-blue-500' :
                  currentPhase.color === 'green' ? 'bg-green-500' :
                  currentPhase.color === 'indigo' ? 'bg-indigo-500' :
                  currentPhase.color === 'purple' ? 'bg-purple-500' :
                  'bg-teal-500'
                }`}
                style={{ width: `${phaseCompletion.progress}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Weeks List */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            أسابيع المرحلة
          </h3>
          
          <div className="space-y-3">
            {phaseWeeks.map((week, index) => {
              const completion = getWeekCompletion(week.week);
              
              return (
                <motion.div key={week.week} {...animations.stagger(index * 0.1)} className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${completion.percentage === 100 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'}`} onClick={() => goToWeekDays(week.week)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${completion.percentage === 100 ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        {completion.percentage === 100 ? (<CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />) : (<Calendar className="w-6 h-6 text-gray-600 dark:text-gray-400" />)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white"> الأسبوع {week.week} </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400"> {week.title[lang]} </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white"> {completion.percentage}% </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500"> {completion.completed}/{completion.total} مهام </div>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-300 ${completion.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${completion.percentage}%` }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </PageLayout>
  );
}