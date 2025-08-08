import React from 'react';
import { WeekPhaseProvider, WeekPhaseExample, WeekPhaseHookExample, WeekPhaseTest } from '../components';

export const WeekPhaseDemo: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'example' | 'hook' | 'test'>('example');

  return (
    <WeekPhaseProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <h1 className="text-4xl font-bold text-center mb-8">
            نظام ربط الأسابيع بالمراحل - التجريبي
          </h1>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1 bg-white rounded-lg shadow p-1">
              <button
                onClick={() => setActiveTab('example')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'example'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                المثال الأساسي
              </button>
              <button
                onClick={() => setActiveTab('hook')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'hook'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                مثال Hook
              </button>
              <button
                onClick={() => setActiveTab('test')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'test'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                اختبار النظام
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-lg">
            {activeTab === 'example' && <WeekPhaseExample />}
            {activeTab === 'hook' && <WeekPhaseHookExample />}
            {activeTab === 'test' && <WeekPhaseTest />}
          </div>

          {/* System Info */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">معلومات النظام</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">الميزات الرئيسية:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• ربط ديناميكي للأسابيع بالمراحل</li>
                  <li>• تجاهل رقم المرحلة في PlanData.json</li>
                  <li>• التحقق من صحة الربط</li>
                  <li>• إدارة تقدم الأسابيع</li>
                  <li>• التنقل الذكي بين الأسابيع</li>
                  <li>• واجهة سهلة الاستخدام</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">كيفية الاستخدام:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• استخدم WeekPhaseProvider لتغليف التطبيق</li>
                  <li>• استخدم useWeekPhaseData للوصول للبيانات</li>
                  <li>• استخدم weekPhaseService للوصول المباشر</li>
                  <li>• تحقق من صحة الربط باستمرار</li>
                  <li>• استخدم المكونات الجاهزة للعرض</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WeekPhaseProvider>
  );
};