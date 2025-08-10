# إضافة أزرار الرجوع - Back Buttons Addition

## الصفحات المحدثة

تم إضافة أزرار رجوع واضحة في جميع الصفحات المطلوبة:

### 1. صفحة المراحل (PhasesPage) 🏠
- **الموقع**: أعلى الصفحة
- **النص**: "العودة للرئيسية"
- **الوظيفة**: العودة للصفحة الرئيسية
- **التصميم**: زر بسيط مع أيقونة ArrowLeft

### 2. صفحة أسابيع المرحلة (PhaseWeeksPage) 📅
- **الموقع**: أعلى الصفحة
- **النص**: "العودة للمراحل"
- **الوظيفة**: العودة لصفحة المراحل
- **التصميم**: زر بسيط مع أيقونة ArrowLeft

### 3. صفحة الأيام (DaysPage) 📋
- **الموقع**: أعلى الصفحة
- **النص**: "العودة لمرحلة [اسم المرحلة]" أو "العودة للمراحل"
- **الوظيفة**: العودة لصفحة المرحلة المحددة أو صفحة المراحل
- **التصميم**: زر بسيط مع أيقونة ArrowLeft
- **الذكاء**: يحدد تلقائياً المرحلة التي ينتمي إليها الأسبوع

### 4. صفحة اليوم (DayViewPage) 📖
- **الموقع**: أعلى الصفحة
- **النص**: "العودة لأيام الأسبوع"
- **الوظيفة**: العودة لصفحة أيام الأسبوع
- **التصميم**: زر بسيط مع أيقونة ArrowLeft

## التصميم الموحد

جميع أزرار الرجوع تتبع نفس التصميم:

```css
flex items-center gap-2 px-4 py-2 
text-gray-600 dark:text-gray-400 
hover:text-gray-900 dark:hover:text-white 
hover:bg-gray-100 dark:hover:bg-gray-800 
rounded-lg transition-all duration-200
```

### المميزات:
- **أيقونة ArrowLeft**: واضحة ومفهومة
- **تأثيرات hover**: تغيير اللون والخلفية
- **انتقالات سلسة**: animation duration-200
- **دعم الوضع المظلم**: ألوان مختلفة للوضع المظلم
- **تصميم متجاوب**: يعمل على جميع أحجام الشاشات

## التغييرات التقنية

### الملفات المحدثة:
1. `src/components/phases/PhasesPage.tsx`
2. `src/components/phases/PhaseWeeksPage.tsx`
3. `src/components/days/DaysPage.tsx` - **محدث مع ذكاء تحديد المرحلة**
4. `src/components/days/DayViewPage.tsx`

### الإضافات:
- استيراد `ArrowLeft` من lucide-react
- إضافة أزرار رجوع في أعلى كل صفحة
- تحسين تجربة التنقل للمستخدم
- **ذكاء تحديد المرحلة**: في صفحة الأيام، يحدد تلقائياً المرحلة الصحيحة

## النتائج

1. **تحسين تجربة المستخدم**: سهولة التنقل بين الصفحات
2. **اتساق في التصميم**: نفس التصميم في جميع الصفحات
3. **وضوح في التنقل**: المستخدم يعرف دائماً كيف يعود للصفحة السابقة
4. **دعم الوضع المظلم**: تجربة متناسقة في كلا الوضعين

## مثال على الاستخدام

### زر رجوع بسيط:
```typescript
<div className="flex items-center mb-4">
  <button
    onClick={() => navigate('/previous-page')}
    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
  >
    <ArrowLeft className="w-5 h-5" />
    <span>العودة للصفحة السابقة</span>
  </button>
</div>
```

### زر رجوع ذكي (مثل صفحة الأيام):
```typescript
// تحديد المرحلة التي ينتمي إليها الأسبوع
const getCurrentPhase = () => {
  return phasesData.find(phase => phase.weeks.includes(weekNumber));
};

const currentPhase = getCurrentPhase();

const goToWeekView = () => {
  if (currentPhase) {
    navigate(`/phase/${currentPhase.id}`);
  } else {
    navigate('/phases');
  }
};

// في JSX
<button onClick={goToWeekView}>
  <ArrowLeft className="w-5 h-5" />
  <span>
    {currentPhase 
      ? `العودة لمرحلة ${currentPhase.title?.ar}`
      : 'العودة للمراحل'
    }
  </span>
</button>
```