import React, { useState } from 'react';
import { useWeekPhaseData } from '../hooks/useWeekPhaseData';

export const WeekPhaseHookExample: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  
  const {
    getWeekData,
    getPhaseWeeks,
    getCurrentPhase,
    getPhaseProgress,
    getAllPhasesProgress,
    getValidationErrors,
    completeWeek,
    uncompleteWeek,
    isWeekCompleted,
    getNextWeekInPhase,
    getPreviousWeekInPhase
  } = useWeekPhaseData();

  const weekData = getWeekData(selectedWeek);
  const currentPhase = getCurrentPhase();
  const validationErrors = getValidationErrors();

  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
  };

  const handleCompleteWeek = () => {
    completeWeek(selectedWeek);
  };

  const handleUncompleteWeek = () => {
    uncompleteWeek(selectedWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = getNextWeekInPhase(selectedWeek);
    if (nextWeek) {
      setSelectedWeek(nextWeek);
    }
  };

  const handlePreviousWeek = () => {
    const prevWeek = getPreviousWeekInPhase(selectedWeek);
    if (prevWeek) {
      setSelectedWeek(prevWeek);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        نظام ربط الأسابيع بالمراحل - باستخدام Hook
      </h1>

      {/* Week Navigation */}
      <div className="mb-6 flex items-center justify-center space-x-4">
        <button
          onClick={handlePreviousWeek}
          disabled={!getPreviousWeekInPhase(selectedWeek)}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          الأسبوع السابق
        </button>
        
        <select 
          value={selectedWeek} 
          onChange={(e) => handleWeekChange(Number(e.target.value))}
          className="p-2 border border-gray-300 rounded-md"
        >
          {Array.from({ length: 50 }, (_, i) => i + 1).map(week => (
            <option key={week} value={week}>الأسبوع {week}</option>
          ))}
        </select>
        
        <button
          onClick={handleNextWeek}
          disabled={!getNextWeekInPhase(selectedWeek)}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          الأسبوع التالي
        </button>
      </div>

      {/* Selected Week Information */}
      {weekData && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">
              الأسبوع {selectedWeek} - {weekData.phaseData.title.ar}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handleCompleteWeek}
                disabled={isWeekCompleted(selectedWeek)}
                className="bg-green-500 text-white px-4 py-2 rounded text-sm disabled:bg-gray-300"
              >
                {isWeekCompleted(selectedWeek) ? 'مكتمل' : 'إكمال الأسبوع'}
              </button>
              <button
                onClick={handleUncompleteWeek}
                disabled={!isWeekCompleted(selectedWeek)}
                className="bg-red-500 text-white px-4 py-2 rounded text-sm disabled:bg-gray-300"
              >
                إلغاء الإكمال
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3 text-lg">معلومات الأسبوع:</h3>
              <div className="space-y-2">
                <p><strong>العنوان:</strong> {weekData.weekData.title.ar}</p>
                <p><strong>الهدف:</strong> {weekData.weekData.objective.ar}</p>
                <p><strong>المرحلة:</strong> {weekData.phaseData.title.ar}</p>
                <p><strong>رقم المرحلة:</strong> {weekData.phase}</p>
                <p><strong>الحالة:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    weekData.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {weekData.isValid ? 'صحيح' : 'خطأ في الربط'}
                  </span>
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3 text-lg">معلومات المرحلة:</h3>
              <div className="space-y-2">
                <p><strong>التركيز:</strong> {weekData.phaseData.focus.ar}</p>
                <p><strong>المحتوى الرئيسي:</strong> {weekData.phaseData.mainContent.ar}</p>
                <p><strong>المدة:</strong> {weekData.phaseData.duration}</p>
                <p><strong>المستوى:</strong> {weekData.phaseData.difficulty}</p>
                <p><strong>التقدم:</strong> {getPhaseProgress(weekData.phase)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Phase Information */}
      {currentPhase && (
        <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">المرحلة الحالية: {currentPhase.title.ar}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getAllPhasesProgress.map((phase) => (
              <div key={phase.phaseId} className="bg-white p-4 rounded border">
                <h4 className="font-medium mb-2">{phase.phaseTitle}</h4>
                <div className="space-y-1 text-sm">
                  <p>التقدم: {phase.progress}%</p>
                  <p>مكتمل: {phase.completedWeeks}/{phase.totalWeeks}</p>
                  <p>متبقي: {phase.remainingWeeks}</p>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${phase.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-3 text-red-700">
            أخطاء في ربط الأسابيع بالمراحل:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Phase Weeks List */}
      {weekData && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            أسابيع المرحلة {weekData.phase}: {weekData.phaseData.title.ar}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getPhaseWeeks(weekData.phase).map((week) => (
              <div 
                key={week.week} 
                className={`p-4 rounded border cursor-pointer transition-colors ${
                  week.week === selectedWeek 
                    ? 'bg-blue-100 border-blue-300' 
                    : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => setSelectedWeek(week.week)}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">الأسبوع {week.week}</h4>
                  {isWeekCompleted(week.week) && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      مكتمل
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">{week.title.ar}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};