import React, { useState } from 'react';
import { useWeekPhase } from './WeekPhaseProvider';

export const WeekPhaseExample: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([1, 2, 3]);
  
  const {
    getWeekWithPhase,
    getPhaseForWeek,
    getWeeksForPhase,
    getCurrentPhase,
    getPhaseProgress,
    getPhaseStats,
    validateWeekPhaseAssignment,
    getValidationErrors
  } = useWeekPhase();

  const weekData = getWeekWithPhase(selectedWeek);
  const phaseData = getPhaseForWeek(selectedWeek);
  const currentPhase = getCurrentPhase(completedWeeks);
  const validationErrors = getValidationErrors();

  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
  };

  const handleCompleteWeek = (week: number) => {
    if (!completedWeeks.includes(week)) {
      setCompletedWeeks([...completedWeeks, week]);
    }
  };

  const handleUncompleteWeek = (week: number) => {
    setCompletedWeeks(completedWeeks.filter(w => w !== week));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        نظام ربط الأسابيع بالمراحل
      </h1>

      {/* Week Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">اختر الأسبوع:</label>
        <select 
          value={selectedWeek} 
          onChange={(e) => handleWeekChange(Number(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {Array.from({ length: 50 }, (_, i) => i + 1).map(week => (
            <option key={week} value={week}>الأسبوع {week}</option>
          ))}
        </select>
      </div>

      {/* Selected Week Information */}
      {weekData && phaseData && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            الأسبوع {selectedWeek} - {phaseData.title.ar}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">معلومات الأسبوع:</h3>
              <p><strong>العنوان:</strong> {weekData.title.ar}</p>
              <p><strong>الهدف:</strong> {weekData.objective.ar}</p>
              <p><strong>المرحلة:</strong> {phaseData.title.ar}</p>
              <p><strong>رقم المرحلة:</strong> {phaseData.id}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">معلومات المرحلة:</h3>
              <p><strong>التركيز:</strong> {phaseData.focus.ar}</p>
              <p><strong>المحتوى الرئيسي:</strong> {phaseData.mainContent.ar}</p>
              <p><strong>المدة:</strong> {phaseData.duration}</p>
              <p><strong>المستوى:</strong> {phaseData.difficulty}</p>
            </div>
          </div>

          {/* Week Completion */}
          <div className="mt-4">
            <button
              onClick={() => handleCompleteWeek(selectedWeek)}
              disabled={completedWeeks.includes(selectedWeek)}
              className="bg-green-500 text-white px-4 py-2 rounded mr-2 disabled:bg-gray-300"
            >
              إكمال الأسبوع
            </button>
            <button
              onClick={() => handleUncompleteWeek(selectedWeek)}
              disabled={!completedWeeks.includes(selectedWeek)}
              className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
            >
              إلغاء الإكمال
            </button>
          </div>
        </div>
      )}

      {/* Current Phase Information */}
      {currentPhase && (
        <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-3">المرحلة الحالية: {currentPhase.title.ar}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(phaseId => {
              const stats = getPhaseStats(phaseId, completedWeeks);
              return (
                <div key={phaseId} className="bg-white p-4 rounded border">
                  <h4 className="font-medium">المرحلة {phaseId}</h4>
                  <p>التقدم: {stats.progress}%</p>
                  <p>مكتمل: {stats.completedWeeks}/{stats.totalWeeks}</p>
                  <p>متبقي: {stats.remainingWeeks}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-3 text-red-700">
            أخطاء في ربط الأسابيع بالمراحل:
          </h3>
          <div className="space-y-2">
            {validationErrors.map((error, index) => (
              <div key={index} className="bg-red-100 p-3 rounded">
                <p><strong>الأسبوع {error.week}:</strong></p>
                <p>المرحلة الحالية: {error.currentPhase}</p>
                <p>المرحلة الصحيحة: {error.correctPhase}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Phases Overview */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">نظرة عامة على جميع المراحل</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(phaseId => {
            const phase = getPhaseForWeek(phaseId === 1 ? 1 : phaseId === 2 ? 5 : phaseId === 3 ? 9 : phaseId === 4 ? 18 : phaseId === 5 ? 26 : phaseId === 6 ? 33 : phaseId === 7 ? 38 : 42);
            if (!phase) return null;
            
            const weeks = getWeeksForPhase(phaseId);
            return (
              <div key={phaseId} className="bg-white p-4 rounded border">
                <h4 className="font-medium">{phase.title.ar}</h4>
                <p className="text-sm text-gray-600">{phase.duration}</p>
                <p className="text-sm text-gray-600">الأسابيع: {weeks.length}</p>
                <p className="text-sm text-gray-600">المستوى: {phase.difficulty}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};