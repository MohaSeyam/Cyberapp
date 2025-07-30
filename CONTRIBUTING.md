# دليل المساهمة - CyberPlan

شكراً لاهتمامك بالمساهمة في مشروع CyberPlan! هذا الدليل سيساعدك على البدء.

## 🚀 البدء السريع

### المتطلبات الأساسية
- Node.js (الإصدار 18 أو أحدث)
- npm أو yarn
- Git

### التثبيت
```bash
# استنساخ المشروع
git clone https://github.com/MohSeyam/cyberplan.git
cd cyberplan

# تثبيت التبعيات
npm install

# تشغيل في وضع التطوير
npm run dev
```

## 📝 دليل التطوير

### هيكل المشروع
```
src/
├── components/     # المكونات القابلة لإعادة الاستخدام
├── pages/         # صفحات التطبيق
├── context/       # إدارة الحالة
├── services/      # الخدمات والـ APIs
├── hooks/         # Custom Hooks
├── utils/         # الأدوات المساعدة
└── i18n/          # الترجمة
```

### معايير الكود

#### التسمية
- **الملفات**: `PascalCase` للمكونات، `camelCase` للخدمات
- **المكونات**: `PascalCase` (مثال: `TaskItem`)
- **الدوال**: `camelCase` (مثال: `handleTaskToggle`)
- **الثوابت**: `UPPER_SNAKE_CASE` (مثال: `API_BASE_URL`)

#### التنسيق
```jsx
// ✅ صحيح
function TaskItem({ task, onToggle }) {
  return (
    <div className="task-item">
      <h3>{task.title}</h3>
    </div>
  );
}

// ❌ خطأ
function taskItem({task,onToggle}){
return(<div className="task-item"><h3>{task.title}</h3></div>);
}
```

#### التعليقات
```jsx
// تعليق سطر واحد
const totalTasks = tasks.length;

/*
 * تعليق متعدد الأسطر
 * للمنطق المعقد
 */
function complexCalculation() {
  // منطق معقد هنا
}
```

### إدارة الحالة
- استخدم `AppContext` للحالة العامة
- استخدم `useState` للحالة المحلية
- استخدم `useCallback` للدوال الممررة كـ props

### الترجمة
```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('welcome', 'مرحباً')}</h1>;
}
```

## 🧪 الاختبار

### تشغيل الاختبارات
```bash
npm test
```

### اختبار المكونات
```jsx
import { render, screen } from '@testing-library/react';
import TaskItem from './TaskItem';

test('renders task title', () => {
  const task = { id: 1, title: 'Test Task' };
  render(<TaskItem task={task} />);
  
  expect(screen.getByText('Test Task')).toBeInTheDocument();
});
```

## 📦 البناء والنشر

### البناء للإنتاج
```bash
npm run build
```

### معاينة البناء
```bash
npm run preview
```

### تحليل الحزمة
```bash
npm run analyze
```

## 🔧 الأدوات

### ESLint
```bash
# فحص الكود
npm run lint

# إصلاح تلقائي
npm run lint:fix
```

### Prettier
```bash
# تنسيق الكود
npm run format
```

### تنظيف
```bash
# حذف الملفات المؤقتة
npm run clean
```

## 🐛 الإبلاغ عن الأخطاء

### قالب تقرير الخطأ
```markdown
## وصف الخطأ
وصف واضح ومختصر للخطأ.

## خطوات التكرار
1. اذهب إلى '...'
2. انقر على '...'
3. انتقل إلى '...'
4. شاهد الخطأ

## السلوك المتوقع
ما كان يجب أن يحدث.

## لقطات الشاشة
إذا كان ذلك مناسباً، أضف لقطات شاشة.

## معلومات النظام
- المتصفح: [مثال: Chrome 91]
- نظام التشغيل: [مثال: Windows 10]
- إصدار التطبيق: [مثال: 1.0.0]

## معلومات إضافية
أي معلومات أخرى حول المشكلة.
```

## 💡 اقتراح الميزات

### قالب اقتراح الميزة
```markdown
## ملخص الميزة
وصف واضح ومختصر للميزة المقترحة.

## المشكلة التي تحلها
شرح المشكلة التي تحلها هذه الميزة.

## الحل المقترح
وصف مفصل للحل المقترح.

## البدائل المدروسة
أي حلول بديلة تم النظر فيها.

## معلومات إضافية
أي معلومات أخرى مفيدة.
```

## 🔄 عملية المساهمة

### 1. إنشاء Fork
انقر على زر "Fork" في أعلى الصفحة.

### 2. إنشاء Branch
```bash
git checkout -b feature/amazing-feature
```

### 3. إجراء التغييرات
قم بالتعديلات المطلوبة مع اتباع معايير الكود.

### 4. الالتزام
```bash
git add .
git commit -m "Add amazing feature"
```

### 5. الدفع
```bash
git push origin feature/amazing-feature
```

### 6. إنشاء Pull Request
انقر على "Compare & pull request" في GitHub.

## 📋 قائمة التحقق قبل الـ PR

- [ ] الكود يتبع معايير المشروع
- [ ] تم اختبار التغييرات محلياً
- [ ] تم تحديث الوثائق إذا لزم الأمر
- [ ] تم إضافة اختبارات للميزات الجديدة
- [ ] لا توجد أخطاء في console
- [ ] التطبيق يعمل في وضع التطوير والإنتاج

## 🏷️ أنواع الـ Commits

- `feat:` ميزة جديدة
- `fix:` إصلاح خطأ
- `docs:` تحديث الوثائق
- `style:` تغييرات في التنسيق
- `refactor:` إعادة هيكلة الكود
- `test:` إضافة أو تحديث الاختبارات
- `chore:` تحديثات في البناء أو الأدوات

## 📞 التواصل

- **Issues**: للإبلاغ عن الأخطاء واقتراح الميزات
- **Discussions**: للمناقشات العامة
- **Email**: للتواصل المباشر

## 📄 الترخيص

بالمساهمة في هذا المشروع، فإنك توافق على أن مساهماتك ستكون مرخصة تحت رخصة MIT.

---

شكراً لك على المساهمة في CyberPlan! 🚀