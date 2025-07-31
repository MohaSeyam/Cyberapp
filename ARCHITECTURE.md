# 🏗️ هيكل المشروع الجديد

## 📁 هيكل الملفات

```
src/
├── components/
│   ├── ui/                    # مكونات UI الأساسية
│   │   ├── Button.tsx        # زر موحد
│   │   ├── Modal.tsx         # نافذة منبثقة موحدة
│   │   └── ...
│   ├── layout/               # مكونات التخطيط
│   ├── forms/                # نماذج الإدخال
│   └── editors/              # محررات النصوص
│       └── RichTextEditor.tsx # محرر النصوص الموحد
├── context/
│   └── AppContext.tsx        # Context موحد ومنظم
├── hooks/
│   └── useLocalization.ts    # Hook للترجمة
├── services/
│   └── database.ts           # خدمة قاعدة البيانات المركزية
├── types/
│   └── index.ts              # أنواع TypeScript
├── constants/
│   └── index.ts              # الثوابت
└── utils/                    # دوال مساعدة
```

## 🎯 المبادئ الأساسية

### 1. **فصل المسؤوليات**
- كل ملف له مسؤولية واحدة واضحة
- لا توجد دوال مكررة
- كل خدمة تتعامل مع نوع واحد من البيانات

### 2. **التنظيم الهرمي**
```
Types → Constants → Services → Hooks → Context → Components
```

### 3. **إعادة الاستخدام**
- مكونات UI موحدة
- Hooks قابلة لإعادة الاستخدام
- خدمات مركزية

## 🔧 الخدمات (Services)

### `database.ts`
- **planService**: إدارة الخطة
- **notesService**: إدارة الملاحظات
- **journalService**: إدارة المدونة
- **resourcesService**: إدارة المراجع
- **progressService**: إدارة التقدم
- **settingsService**: إدارة الإعدادات
- **dataService**: استيراد/تصدير البيانات

## 🎨 المكونات (Components)

### UI Components
- **Button**: زر موحد مع متغيرات متعددة
- **Modal**: نافذة منبثقة موحدة
- **RichTextEditor**: محرر نصوص موحد

### Layout Components
- مكونات التخطيط والتنقل

### Form Components
- نماذج الإدخال المختلفة

## 🪝 Hooks

### `useLocalization`
- إدارة الترجمة
- دعم العربية والإنجليزية
- ترجمة ديناميكية

## 📊 Context

### `AppContext`
- إدارة الحالة العامة
- إدارة الإشعارات
- إدارة النوافذ المنبثقة
- إدارة اللغة والثيم

## 🏷️ Types

### أنواع البيانات
- **Week, Day, Task**: هيكل الخطة
- **Note, JournalEntry**: المحتوى
- **Resource**: المراجع
- **Progress**: التقدم
- **AppSettings**: الإعدادات

## 🔄 تدفق البيانات

```
User Action → Component → Hook → Context → Service → Database
     ↑                                                      ↓
     ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

## 🚀 المزايا

### 1. **الأداء**
- إعادة التصميم محسنة
- تحميل البيانات مرة واحدة
- إدارة ذكية للحالة

### 2. **الصيانة**
- كود منظم وواضح
- سهولة إضافة ميزات جديدة
- سهولة إصلاح الأخطاء

### 3. **التوسع**
- هيكل قابل للتوسع
- إضافة أنواع جديدة سهلة
- إضافة خدمات جديدة بسيطة

### 4. **الاستقرار**
- معالجة أفضل للأخطاء
- تحقق من صحة البيانات
- إشعارات واضحة للمستخدم

## 🔧 الاستخدام

### إضافة مكون جديد
```typescript
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import Button from '../components/ui/Button';

export default function NewComponent() {
  const { addNote } = useApp();
  const { t } = useLocalization();
  
  return (
    <Button onClick={() => addNote(noteData)}>
      {t('addNote')}
    </Button>
  );
}
```

### إضافة خدمة جديدة
```typescript
// في services/database.ts
export const newService = {
  async getAll(): Promise<NewType[]> {
    // implementation
  },
  async add(data: NewType): Promise<number> {
    // implementation
  }
};
```

## 📝 ملاحظات التطوير

1. **استخدم الأنواع**: دائماً استخدم TypeScript types
2. **استخدم الثوابت**: لا تكتب القيم مباشرة
3. **استخدم الخدمات**: لا تتعامل مع قاعدة البيانات مباشرة
4. **استخدم Hooks**: للدوال القابلة لإعادة الاستخدام
5. **استخدم Context**: للحالة المشتركة
6. **استخدم مكونات UI**: للعناصر المتكررة

## 🎯 النتيجة

- ✅ كود منظم ومحترف
- ✅ أداء محسن
- ✅ صيانة سهلة
- ✅ توسع سلس
- ✅ استقرار عالي
- ✅ تجربة مستخدم محسنة