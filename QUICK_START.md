# دليل الاستخدام السريع - نظام ربط الأسابيع بالمراحل

## التثبيت السريع

### 1. إضافة Provider للتطبيق

```tsx
import { WeekPhaseProvider } from './components';

function App() {
  return (
    <WeekPhaseProvider>
      <YourApp />
    </WeekPhaseProvider>
  );
}
```

### 2. استخدام Hook في المكونات

```tsx
import { useWeekPhaseData } from './hooks/useWeekPhaseData';

function WeekComponent({ weekNumber }: { weekNumber: number }) {
  const { getWeekData, completeWeek, isWeekCompleted } = useWeekPhaseData();
  
  const weekData = getWeekData(weekNumber);
  
  if (!weekData) return <div>الأسبوع غير موجود</div>;
  
  return (
    <div>
      <h2>الأسبوع {weekNumber}</h2>
      <p>المرحلة: {weekData.phaseData.title.ar}</p>
      <p>العنوان: {weekData.weekData.title.ar}</p>
      
      <button 
        onClick={() => completeWeek(weekNumber)}
        disabled={isWeekCompleted(weekNumber)}
      >
        {isWeekCompleted(weekNumber) ? 'مكتمل' : 'إكمال الأسبوع'}
      </button>
    </div>
  );
}
```

### 3. استخدام الخدمة مباشرة

```tsx
import { weekPhaseService } from './services/weekPhaseService';

// الحصول على المرحلة الصحيحة لأسبوع
const phase = weekPhaseService.getPhaseForWeek(5); // المرحلة 2

// الحصول على بيانات الأسبوع مع المرحلة
const weekData = weekPhaseService.getWeekWithPhase(5);

// التحقق من صحة الربط
const isValid = weekPhaseService.validateWeekPhaseAssignment(5, 2);
```

## الوظائف الرئيسية

### إدارة الأسابيع
```tsx
const { 
  getWeekData,           // الحصول على بيانات الأسبوع
  getPhaseWeeks,         // الحصول على أسابيع مرحلة معينة
  completeWeek,          // إكمال أسبوع
  uncompleteWeek,        // إلغاء إكمال أسبوع
  isWeekCompleted        // التحقق من إكمال أسبوع
} = useWeekPhaseData();
```

### التنقل
```tsx
const {
  getNextWeekInPhase,    // الأسبوع التالي في نفس المرحلة
  getPreviousWeekInPhase // الأسبوع السابق في نفس المرحلة
} = useWeekPhaseData();
```

### التقدم والإحصائيات
```tsx
const {
  getCurrentPhase,       // المرحلة الحالية
  getPhaseProgress,      // تقدم مرحلة معينة
  getAllPhasesProgress   // تقدم جميع المراحل
} = useWeekPhaseData();
```

## أمثلة سريعة

### عرض معلومات الأسبوع
```tsx
function WeekInfo({ weekNumber }: { weekNumber: number }) {
  const { getWeekData } = useWeekPhaseData();
  const weekData = getWeekData(weekNumber);
  
  return weekData ? (
    <div>
      <h3>الأسبوع {weekNumber}</h3>
      <p>المرحلة: {weekData.phaseData.title.ar}</p>
      <p>العنوان: {weekData.weekData.title.ar}</p>
      <p>الهدف: {weekData.weekData.objective.ar}</p>
    </div>
  ) : null;
}
```

### عرض تقدم المراحل
```tsx
function PhaseProgress() {
  const { getAllPhasesProgress } = useWeekPhaseData();
  
  return (
    <div>
      {getAllPhasesProgress.map(phase => (
        <div key={phase.phaseId}>
          <h4>{phase.phaseTitle}</h4>
          <p>التقدم: {phase.progress}%</p>
          <p>مكتمل: {phase.completedWeeks}/{phase.totalWeeks}</p>
        </div>
      ))}
    </div>
  );
}
```

### التنقل بين الأسابيع
```tsx
function WeekNavigation({ currentWeek }: { currentWeek: number }) {
  const { getNextWeekInPhase, getPreviousWeekInPhase } = useWeekPhaseData();
  
  const nextWeek = getNextWeekInPhase(currentWeek);
  const prevWeek = getPreviousWeekInPhase(currentWeek);
  
  return (
    <div>
      {prevWeek && <button>السابق ({prevWeek})</button>}
      <span>الحالي: {currentWeek}</span>
      {nextWeek && <button>التالي ({nextWeek})</button>}
    </div>
  );
}
```

## الملفات المهمة

- `src/services/weekPhaseService.ts` - الخدمة الرئيسية
- `src/hooks/useWeekPhaseData.ts` - Hook مخصص
- `src/components/WeekPhaseProvider.tsx` - Provider
- `src/components/WeekPhaseExample.tsx` - مثال أساسي
- `src/components/WeekPhaseHookExample.tsx` - مثال Hook
- `src/components/WeekPhaseTest.tsx` - اختبار النظام

## ملاحظات مهمة

1. النظام يتجاهل رقم المرحلة في `PlanData.json`
2. يتم الربط بناءً على رقم الأسبوع فقط
3. يمكن تحديث `phases.json` لتغيير الربط
4. النظام يدعم التحقق من صحة الربط
5. يمكن استخدام النظام مع أو بدون Provider