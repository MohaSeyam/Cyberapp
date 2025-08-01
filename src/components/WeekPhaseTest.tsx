import React, { useState } from 'react';
import { weekPhaseService } from '../services/weekPhaseService';

export const WeekPhaseTest: React.FC = () => {
  const [testWeek, setTestWeek] = useState<number>(1);
  const [results, setResults] = useState<any>(null);

  const runTest = () => {
    const weekData = weekPhaseService.getWeekWithPhase(testWeek);
    const phaseData = weekPhaseService.getPhaseForWeek(testWeek);
    const validationErrors = weekPhaseService.getValidationErrors();
    
    setResults({
      weekData,
      phaseData,
      validationErrors,
      isValid: weekPhaseService.validateWeekPhaseAssignment(testWeek, weekData?.phase || 0)
    });
  };

  const testAllWeeks = () => {
    const allResults = [];
    for (let week = 1; week <= 50; week++) {
      const weekData = weekPhaseService.getWeekWithPhase(week);
      const phaseData = weekPhaseService.getPhaseForWeek(week);
      const isValid = weekPhaseService.validateWeekPhaseAssignment(week, weekData?.phase || 0);
      
      allResults.push({
        week,
        weekData: weekData?.title.ar,
        phaseData: phaseData?.title.ar,
        phaseId: weekData?.phase,
        isValid
      });
    }
    setResults({ allResults });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        اختبار نظام ربط الأسابيع بالمراحل
      </h1>

      {/* Test Controls */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">اختبار أسبوع معين:</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="50"
              value={testWeek}
              onChange={(e) => setTestWeek(Number(e.target.value))}
              className="p-2 border border-gray-300 rounded-md w-20"
            />
            <button
              onClick={runTest}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              اختبار
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">اختبار جميع الأسابيع:</label>
          <button
            onClick={testAllWeeks}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            اختبار الكل
          </button>
        </div>
      </div>

      {/* Test Results */}
      {results && (
        <div className="space-y-6">
          {/* Single Week Test Results */}
          {results.weekData && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">نتائج اختبار الأسبوع {testWeek}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">بيانات الأسبوع:</h3>
                  <p><strong>العنوان:</strong> {results.weekData.title.ar}</p>
                  <p><strong>الهدف:</strong> {results.weekData.objective.ar}</p>
                  <p><strong>رقم المرحلة:</strong> {results.weekData.phase}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">بيانات المرحلة:</h3>
                  <p><strong>العنوان:</strong> {results.phaseData?.title.ar}</p>
                  <p><strong>التركيز:</strong> {results.phaseData?.focus.ar}</p>
                  <p><strong>المدة:</strong> {results.phaseData?.duration}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p><strong>الحالة:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    results.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {results.isValid ? 'صحيح' : 'خطأ في الربط'}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* All Weeks Test Results */}
          {results.allResults && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">نتائج اختبار جميع الأسابيع</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-4 py-2">الأسبوع</th>
                      <th className="border px-4 py-2">عنوان الأسبوع</th>
                      <th className="border px-4 py-2">عنوان المرحلة</th>
                      <th className="border px-4 py-2">رقم المرحلة</th>
                      <th className="border px-4 py-2">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.allResults.map((result: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border px-4 py-2 text-center">{result.week}</td>
                        <td className="border px-4 py-2">{result.weekData}</td>
                        <td className="border px-4 py-2">{result.phaseData}</td>
                        <td className="border px-4 py-2 text-center">{result.phaseId}</td>
                        <td className="border px-4 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-sm ${
                            result.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {result.isValid ? 'صحيح' : 'خطأ'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4">
                <p><strong>إجمالي الأخطاء:</strong> {results.allResults.filter((r: any) => !r.isValid).length}</p>
                <p><strong>إجمالي الصحيح:</strong> {results.allResults.filter((r: any) => r.isValid).length}</p>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {results.validationErrors && results.validationErrors.length > 0 && (
            <div className="bg-red-50 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3 text-red-700">
                أخطاء في ربط الأسابيع بالمراحل:
              </h3>
              <div className="space-y-2">
                {results.validationErrors.map((error: any, index: number) => (
                  <div key={index} className="bg-red-100 p-3 rounded">
                    <p><strong>الأسبوع {error.week}:</strong></p>
                    <p>المرحلة الحالية: {error.currentPhase}</p>
                    <p>المرحلة الصحيحة: {error.correctPhase}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Tests */}
      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">اختبارات سريعة</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { week: 1, expectedPhase: 1 },
            { week: 5, expectedPhase: 2 },
            { week: 9, expectedPhase: 3 },
            { week: 18, expectedPhase: 4 },
            { week: 26, expectedPhase: 5 },
            { week: 33, expectedPhase: 6 },
            { week: 38, expectedPhase: 7 },
            { week: 42, expectedPhase: 8 }
          ].map((test) => {
            const weekData = weekPhaseService.getWeekWithPhase(test.week);
            const isValid = weekData?.phase === test.expectedPhase;
            
            return (
              <div key={test.week} className="bg-white p-4 rounded border">
                <h4 className="font-medium">الأسبوع {test.week}</h4>
                <p>المرحلة المتوقعة: {test.expectedPhase}</p>
                <p>المرحلة الفعلية: {weekData?.phase || 'غير موجود'}</p>
                <p className={`font-medium ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {isValid ? '✓ صحيح' : '✗ خطأ'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};