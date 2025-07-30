import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { Download, FileText, BarChart3, Calendar, Target, Award } from "lucide-react";
import toast from "react-hot-toast";

export default function ReportExporter() {
  const { t } = useTranslation();
  const { plan, progress, notes, journal } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState("");

  const reportTypes = [
    {
      id: "progress",
      name: "تقرير التقدم",
      description: "ملخص شامل لتقدمك في الخطة",
      icon: BarChart3,
      color: "blue"
    },
    {
      id: "tasks",
      name: "تقرير المهام",
      description: "قائمة بجميع المهام وحالتها",
      icon: Target,
      color: "green"
    },
    {
      id: "notes",
      name: "تقرير الملاحظات",
      description: "جميع الملاحظات والمدونات",
      icon: FileText,
      color: "purple"
    },
    {
      id: "achievements",
      name: "تقرير الإنجازات",
      description: "ملخص الإنجازات والجوائز",
      icon: Award,
      color: "yellow"
    }
  ];

  const generateProgressReport = () => {
    const totalWeeks = plan.length;
    const completedWeeks = progress.completedWeeks?.length || 0;
    const currentWeek = progress.currentWeek || 1;
    const progressPercentage = Math.round((completedWeeks / totalWeeks) * 100);

    const report = {
      title: "تقرير التقدم - خطة الأمن السيبراني",
      date: new Date().toLocaleDateString('ar-SA'),
      summary: {
        totalWeeks,
        completedWeeks,
        currentWeek,
        progressPercentage
      },
      phases: [
        {
          name: "المرحلة الأولى",
          weeks: "1-17",
          status: currentWeek <= 17 ? "جارية" : "مكتملة"
        },
        {
          name: "المرحلة الثانية", 
          weeks: "18-37",
          status: currentWeek > 17 && currentWeek <= 37 ? "جارية" : currentWeek > 37 ? "مكتملة" : "قادمة"
        },
        {
          name: "المرحلة الثالثة",
          weeks: "38-50", 
          status: currentWeek > 37 ? "جارية" : "قادمة"
        }
      ],
      recommendations: generateRecommendations(progressPercentage)
    };

    return report;
  };

  const generateTasksReport = () => {
    const allTasks = [];
    plan.forEach(week => {
      week.days?.forEach(day => {
        day.tasks?.forEach(task => {
          allTasks.push({
            week: week.week,
            day: day.day?.ar || day.day?.en,
            topic: day.topic?.ar || day.topic?.en,
            task: task.description?.ar || task.description?.en,
            type: task.type,
            duration: task.duration,
            status: progress.completedTasks?.includes(task.id) ? "مكتملة" : "قيد الانتظار"
          });
        });
      });
    });

    return {
      title: "تقرير المهام - خطة الأمن السيبراني",
      date: new Date().toLocaleDateString('ar-SA'),
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter(t => t.status === "مكتملة").length,
      tasks: allTasks
    };
  };

  const generateNotesReport = () => {
    const allNotes = [...(notes || []), ...(journal || [])];
    
    return {
      title: "تقرير الملاحظات والمدونات",
      date: new Date().toLocaleDateString('ar-SA'),
      totalEntries: allNotes.length,
      notes: allNotes.map(note => ({
        title: note.title,
        content: note.content,
        date: note.createdAt,
        type: note.taskId ? "ملاحظة مهمة" : "مدونة"
      }))
    };
  };

  const generateAchievementsReport = () => {
    const achievements = [];
    const progressPercentage = Math.round(((progress.completedWeeks?.length || 0) / plan.length) * 100);

    if (progressPercentage >= 25) {
      achievements.push({
        title: "ربع الطريق",
        description: "أكملت 25% من الخطة",
        date: new Date().toLocaleDateString('ar-SA'),
        icon: "🏆"
      });
    }

    if (progressPercentage >= 50) {
      achievements.push({
        title: "منتصف الطريق",
        description: "أكملت 50% من الخطة",
        date: new Date().toLocaleDateString('ar-SA'),
        icon: "🎯"
      });
    }

    if (progressPercentage >= 75) {
      achievements.push({
        title: "قرب النهاية",
        description: "أكملت 75% من الخطة",
        date: new Date().toLocaleDateString('ar-SA'),
        icon: "⭐"
      });
    }

    if (progressPercentage >= 100) {
      achievements.push({
        title: "إنجاز كامل",
        description: "أكملت الخطة بالكامل!",
        date: new Date().toLocaleDateString('ar-SA'),
        icon: "🎉"
      });
    }

    return {
      title: "تقرير الإنجازات",
      date: new Date().toLocaleDateString('ar-SA'),
      totalAchievements: achievements.length,
      achievements
    };
  };

  const generateRecommendations = (progressPercentage) => {
    const recommendations = [];
    
    if (progressPercentage < 25) {
      recommendations.push("ركز على إكمال المهام الأساسية في المرحلة الأولى");
      recommendations.push("خصص وقتاً ثابتاً يومياً للدراسة");
    } else if (progressPercentage < 50) {
      recommendations.push("ابدأ في تطبيق المعرفة العملية");
      recommendations.push("انضم لمجتمعات الأمن السيبراني");
    } else if (progressPercentage < 75) {
      recommendations.push("ركز على المشاريع العملية");
      recommendations.push("ابدأ في بناء البورتفوليو");
    } else {
      recommendations.push("استعد للانتقال إلى المرحلة التالية");
      recommendations.push("ابدأ في البحث عن فرص العمل");
    }

    return recommendations;
  };

  const exportToJSON = (data, filename) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (data, filename) => {
    // Convert data to CSV format
    let csv = '';
    
    if (data.tasks) {
      // Tasks report
      csv = 'الأسبوع,اليوم,الموضوع,المهمة,النوع,المدة,الحالة\n';
      data.tasks.forEach(task => {
        csv += `${task.week},${task.day},${task.topic},${task.task},${task.type},${task.duration},${task.status}\n`;
      });
    } else if (data.notes) {
      // Notes report
      csv = 'العنوان,المحتوى,التاريخ,النوع\n';
      data.notes.forEach(note => {
        csv += `${note.title},${note.content},${note.date},${note.type}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (reportType, format) => {
    setIsGenerating(true);
    
    try {
      let reportData;
      let filename;

      switch (reportType) {
        case "progress":
          reportData = generateProgressReport();
          filename = "تقرير_التقدم";
          break;
        case "tasks":
          reportData = generateTasksReport();
          filename = "تقرير_المهام";
          break;
        case "notes":
          reportData = generateNotesReport();
          filename = "تقرير_الملاحظات";
          break;
        case "achievements":
          reportData = generateAchievementsReport();
          filename = "تقرير_الإنجازات";
          break;
        default:
          throw new Error("نوع التقرير غير معروف");
      }

      if (format === "json") {
        exportToJSON(reportData, filename);
      } else if (format === "csv") {
        exportToCSV(reportData, filename);
      }

      toast.success(`تم تصدير ${reportTypes.find(r => r.id === reportType)?.name} بنجاح`);
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("خطأ في تصدير التقرير");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Download className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t("exportReports", "تصدير التقارير")}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {reportTypes.map(report => {
          const IconComponent = report.icon;
          return (
            <motion.div
              key={report.id}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedReport === report.id
                  ? `border-${report.color}-500 bg-${report.color}-50 dark:bg-${report.color}-900/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setSelectedReport(report.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <IconComponent className={`w-5 h-5 text-${report.color}-600`} />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {report.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {report.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedReport && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            اختر تنسيق التصدير:
          </h4>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleExport(selectedReport, "json")}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              {isGenerating ? "جاري التصدير..." : "JSON"}
            </button>
            
            <button
              onClick={() => handleExport(selectedReport, "csv")}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              {isGenerating ? "جاري التصدير..." : "CSV"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}