# آلية عمل ربط وعرض معلومات اليوم مع المدونة

## نظرة عامة

هذا الملف يوضح آلية عمل ربط وعرض معلومات اليوم من الخطة (Plan) مع المدونة (Journal Entry) في تطبيق React.

## البنية الأساسية للبيانات

### 1. بنية المدونة (Journal Entry)
```javascript
{
  id: number,
  title: string,
  content: string,
  weekId: number,        // رقم الأسبوع
  dayKey: string,        // مفتاح اليوم (مثل: "monday", "tuesday")
  createdAt: string,
  updatedAt: string,
  tags: string[]
}
```

### 2. بنية الخطة (Plan)
```javascript
[
  {
    week: number,        // رقم الأسبوع
    phase: number,       // رقم المرحلة
    days: [
      {
        key: string,     // مفتاح اليوم
        day: {
          ar: string,    // اسم اليوم بالعربية
          en: string     // اسم اليوم بالإنجليزية
        },
        topic: {
          ar: string,    // موضوع اليوم بالعربية
          en: string     // موضوع اليوم بالإنجليزية
        }
      }
    ]
  }
]
```

## آلية العمل

### 1. القسم المنطقي: استخراج بيانات اليوم

يتم استخدام `React.useMemo` لاستخراج معلومات اليوم المرتبط بالمدونة:

```javascript
const dayInfo = React.useMemo(() => {
  // 1. التأكد من وجود البيانات المطلوبة
  if (!journalEntry?.weekId || !journalEntry?.dayKey || !plan) return null;
  
  // 2. البحث عن الأسبوع المطابق في الخطة
  const week = plan.find(w => w.week === journalEntry.weekId);
  
  if (week) {
    // 3. البحث عن اليوم المطابق داخل الأسبوع
    const day = week.days?.find(d => d.key === journalEntry.dayKey);
    
    // 4. إرجاع كائن يحتوي على معلومات الأسبوع واليوم
    return { week, day };
  }
  return null;
}, [journalEntry, plan]);
```

**خطوات العمل:**
1. **التحقق من البيانات**: التأكد من وجود `weekId` و `dayKey` في المدونة ووجود الخطة
2. **البحث عن الأسبوع**: البحث في مصفوفة الخطة عن الأسبوع المطابق
3. **البحث عن اليوم**: البحث في أيام الأسبوع عن اليوم المطابق
4. **إرجاع النتيجة**: إرجاع كائن يحتوي على معلومات الأسبوع واليوم

### 2. الدوال المساعدة

#### دالة عرض اسم اليوم
```javascript
const getDayName = (day) => {
  if (!day?.day) return language === 'ar' ? 'اليوم' : 'Day';
  return day.day[language] || day.day.ar || day.day.en || (language === 'ar' ? 'اليوم' : 'Day');
};
```

#### دالة عرض موضوع اليوم
```javascript
const getDayTopic = (day) => {
  if (!day?.topic) return null;
  return day.topic[language] || day.topic.ar || day.topic.en;
};
```

### 3. قسم العرض: واجهة المستخدم

#### عرض معلومات اليوم في الهيدر
```javascript
{dayInfo && (
  <div className="flex items-center space-x-2">
    <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
    <span className="text-purple-600 dark:text-purple-400 font-medium">
      {getDayName(dayInfo.day)}
    </span>
  </div>
)}
```

#### عرض تفاصيل اليوم الكاملة
```javascript
{/* قسم عرض معلومات اليوم المرتبط بالمدونة */}
{dayInfo && (
  <motion.div>
    <Card className="p-6 bg-purple-50 dark:bg-purple-900/20">
      <div className="flex items-center justify-between mb-4">
        <h3>{language === 'ar' ? 'معلومات اليوم' : 'Day Information'}</h3>
        {/* زر الانتقال لصفحة اليوم في الخطة */}
        <Button onClick={() => navigate(`/phases/${dayInfo.week.phase}/weeks/${dayInfo.week.week}/days/${dayInfo.day.key}`)}>
          {language === 'ar' ? 'العودة لصفحة اليوم' : 'Go to Day Page'}
        </Button>
      </div>
      
      {/* عرض تفاصيل اليوم والأسبوع */}
      <div className="space-y-2">
        <p><span>الأسبوع:</span> {dayInfo.week.week}</p>
        <p><span>اليوم:</span> {getDayName(dayInfo.day)}</p>
        {/* عرض موضوع اليوم إن وجد */}
        {getDayTopic(dayInfo.day) && (
          <p><span>الموضوع:</span> {getDayTopic(dayInfo.day)}</p>
        )}
      </div>
    </Card>
  </motion.div>
)}
```

## المميزات

### 1. الأداء المحسن
- استخدام `React.useMemo` لتجنب إعادة الحساب عند كل render
- الاعتماد على `journalEntry` و `plan` فقط كـ dependencies

### 2. المرونة في اللغات
- دعم اللغتين العربية والإنجليزية
- ترتيب الأولوية: اللغة الحالية → العربية → الإنجليزية → القيمة الافتراضية

### 3. الأمان والاستقرار
- فحص شامل للبيانات قبل الاستخدام
- استخدام Optional Chaining (`?.`) لتجنب الأخطاء
- قيم افتراضية في حالة عدم وجود البيانات

### 4. تجربة المستخدم
- عرض معلومات اليوم بشكل واضح وجذاب
- إمكانية الانتقال لصفحة اليوم في الخطة
- تصميم متجاوب مع الوضع المظلم

## الاستخدام

هذه الآلية تستخدم في:
- `JournalViewPage.jsx` - عرض المدونة
- `NoteViewPage.jsx` - عرض الملاحظة
- أي مكون آخر يحتاج لعرض معلومات اليوم المرتبط

## التطوير المستقبلي

يمكن تطوير هذه الآلية بإضافة:
1. دعم المزيد من اللغات
2. إضافة معلومات إضافية عن اليوم (مثل المهام، الموارد)
3. تحسين الأداء باستخدام React Query أو SWR
4. إضافة إمكانية تعديل معلومات اليوم من نفس الصفحة