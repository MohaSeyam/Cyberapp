# نظام ربط الأسابيع بالمراحل

هذا النظام يوفر ربط ديناميكي للأسابيع بالمراحل بناءً على رقم الأسبوع، متجاهلاً رقم المرحلة الموجود في ملف PlanData.json.

## المكونات الرئيسية

### 1. خدمة ربط الأسابيع بالمراحل (`weekPhaseService.ts`)

```typescript
import { weekPhaseService } from '../services/weekPhaseService';

// الحصول على المرحلة الصحيحة لأسبوع معين
const phase = weekPhaseService.getPhaseForWeek(5); // المرحلة 2

// الحصول على بيانات الأسبوع مع المرحلة الصحيحة
const weekData = weekPhaseService.getWeekWithPhase(5);

// الحصول على جميع أسابيع مرحلة معينة
const phaseWeeks = weekPhaseService.getWeeksForPhase(2);

// التحقق من صحة ربط الأسبوع بالمرحلة
const isValid = weekPhaseService.validateWeekPhaseAssignment(5, 2); // true
```

### 2. مكون Provider (`WeekPhaseProvider.tsx`)

يوفر السياق للوصول إلى خدمة ربط الأسابيع بالمراحل في جميع أنحاء التطبيق.

```typescript
import { WeekPhaseProvider, useWeekPhase } from '../components/WeekPhaseProvider';

function App() {
  return (
    <WeekPhaseProvider>
      <YourComponents />
    </WeekPhaseProvider>
  );
}

function YourComponent() {
  const { getWeekWithPhase, getPhaseForWeek } = useWeekPhase();
  // استخدام الخدمة
}
```

### 3. Hook مخصص (`useWeekPhaseData.ts`)

يوفر واجهة سهلة الاستخدام لإدارة بيانات الأسابيع والمراحل.

```typescript
import { useWeekPhaseData } from '../hooks/useWeekPhaseData';

function YourComponent() {
  const {
    getWeekData,
    getPhaseWeeks,
    getCurrentPhase,
    completeWeek,
    uncompleteWeek,
    isWeekCompleted
  } = useWeekPhaseData();

  // استخدام الوظائف
}
```

## كيفية الاستخدام

### 1. الحصول على بيانات الأسبوع مع المرحلة الصحيحة

```typescript
const weekData = getWeekData(5);
// النتيجة:
// {
//   week: 5,
//   phase: 2,
//   weekData: { /* بيانات الأسبوع */ },
//   phaseData: { /* بيانات المرحلة */ },
//   isValid: true
// }
```

### 2. إدارة إكمال الأسابيع

```typescript
const { completeWeek, uncompleteWeek, isWeekCompleted } = useWeekPhaseData();

// إكمال أسبوع
completeWeek(5);

// إلغاء إكمال أسبوع
uncompleteWeek(5);

// التحقق من إكمال أسبوع
const isCompleted = isWeekCompleted(5);
```

### 3. التنقل بين الأسابيع

```typescript
const { getNextWeekInPhase, getPreviousWeekInPhase } = useWeekPhaseData();

const nextWeek = getNextWeekInPhase(5); // 6
const prevWeek = getPreviousWeekInPhase(5); // 4
```

### 4. الحصول على إحصائيات المراحل

```typescript
const { getAllPhasesProgress } = useWeekPhaseData();

const phasesProgress = getAllPhasesProgress;
// النتيجة:
// [
//   {
//     phaseId: 1,
//     phaseTitle: "أساسيات الأمن السيبراني",
//     totalWeeks: 4,
//     completedWeeks: 2,
//     progress: 50,
//     remainingWeeks: 2
//   },
//   // ...
// ]
```

## الميزات الرئيسية

### 1. الربط الديناميكي
- يتم ربط الأسابيع بالمراحل بناءً على ملف `phases.json`
- تجاهل رقم المرحلة الموجود في `PlanData.json`
- تحديث تلقائي للربط عند تغيير ملف المراحل

### 2. التحقق من الصحة
- التحقق من صحة ربط كل أسبوع بمرحلته
- عرض الأخطاء في الربط
- إمكانية تصحيح الأخطاء

### 3. إدارة التقدم
- تتبع الأسابيع المكتملة
- حساب تقدم كل مرحلة
- تحديد المرحلة الحالية

### 4. التنقل الذكي
- التنقل بين الأسابيع في نفس المرحلة
- منع التنقل إلى أسابيع من مراحل أخرى
- دعم التنقل للأمام والخلف

## أمثلة الاستخدام

### مثال 1: عرض معلومات الأسبوع

```typescript
function WeekInfo({ weekNumber }: { weekNumber: number }) {
  const { getWeekData } = useWeekPhaseData();
  const weekData = getWeekData(weekNumber);

  if (!weekData) return <div>الأسبوع غير موجود</div>;

  return (
    <div>
      <h2>الأسبوع {weekNumber}</h2>
      <p>المرحلة: {weekData.phaseData.title.ar}</p>
      <p>العنوان: {weekData.weekData.title.ar}</p>
      <p>الهدف: {weekData.weekData.objective.ar}</p>
    </div>
  );
}
```

### مثال 2: عرض تقدم المراحل

```typescript
function PhaseProgress() {
  const { getAllPhasesProgress } = useWeekPhaseData();
  const phases = getAllPhasesProgress;

  return (
    <div>
      {phases.map(phase => (
        <div key={phase.phaseId}>
          <h3>{phase.phaseTitle}</h3>
          <p>التقدم: {phase.progress}%</p>
          <p>مكتمل: {phase.completedWeeks}/{phase.totalWeeks}</p>
        </div>
      ))}
    </div>
  );
}
```

### مثال 3: التنقل بين الأسابيع

```typescript
function WeekNavigation({ currentWeek }: { currentWeek: number }) {
  const { getNextWeekInPhase, getPreviousWeekInPhase } = useWeekPhaseData();
  
  const nextWeek = getNextWeekInPhase(currentWeek);
  const prevWeek = getPreviousWeekInPhase(currentWeek);

  return (
    <div>
      {prevWeek && <button>الأسبوع السابق ({prevWeek})</button>}
      <span>الأسبوع الحالي: {currentWeek}</span>
      {nextWeek && <button>الأسبوع التالي ({nextWeek})</button>}
    </div>
  );
}
```

## الملفات المطلوبة

1. `src/services/weekPhaseService.ts` - الخدمة الرئيسية
2. `src/components/WeekPhaseProvider.tsx` - مكون Provider
3. `src/hooks/useWeekPhaseData.ts` - Hook مخصص
4. `src/data/phases.json` - بيانات المراحل
5. `src/data/PlanData.json` - بيانات الأسابيع

## ملاحظات مهمة

- النظام يتجاهل رقم المرحلة الموجود في `PlanData.json`
- يتم الربط بناءً على رقم الأسبوع فقط
- يمكن تحديث ملف `phases.json` لتغيير الربط
- النظام يدعم التحقق من صحة الربط
- يمكن استخدام النظام مع أو بدون Provider