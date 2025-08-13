# بنية الأزرار في التطبيق - توثيق شامل

## نظرة عامة

يحتوي التطبيق على نظام أزرار متطور ومتسق مصمم لتوفير تجربة مستخدم موحدة عبر جميع الصفحات. يتكون النظام من مكونات قابلة لإعادة الاستخدام مع دعم كامل للغات المتعددة والتصميم المتجاوب.

## 1. مكون الزر الأساسي (Button Component)

### الموقع: `src/components/ui/Button.jsx`

### الخصائص (Props):
```javascript
const Button = ({
  children,           // محتوى الزر (نص أو عناصر JSX)
  variant = 'primary', // نوع الزر (primary, outline, ghost)
  size = 'md',        // حجم الزر (sm, md, lg)
  icon,               // أيقونة الزر
  iconPosition = 'left', // موقع الأيقونة (left, right)
  onClick,            // دالة النقر
  disabled = false,   // حالة التعطيل
  loading = false,    // حالة التحميل
  className = '',     // classes إضافية
  type = 'button',    // نوع الزر HTML
  ...props           // خصائص إضافية
}) => {
```

### الأنواع المتاحة (Variants):

#### 1. Primary (أساسي)
```javascript
primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
```
- **الاستخدام**: الأزرار الرئيسية والإجراءات المهمة
- **الألوان**: أزرق مع تأثيرات hover

#### 2. Outline (إطار)
```javascript
outline: 'border border-gray-300 dark:border-gray-600 bg-transparent'
```
- **الاستخدام**: أزرار ثانوية وأزرار الإجراءات
- **المظهر**: إطار مع خلفية شفافة

#### 3. Ghost (شبح)
```javascript
ghost: 'bg-transparent'
```
- **الاستخدام**: أزرار التنقل والأزرار البسيطة
- **المظهر**: شفاف تماماً

### الأحجام المتاحة (Sizes):

```javascript
const sizeClasses = {
  sm: 'px-3 py-1 text-sm',    // صغير
  md: 'px-4 py-2 text-base',  // متوسط (افتراضي)
  lg: 'px-5 py-3 text-lg'     // كبير
};
```

### دعم الأيقونات:

```javascript
// مثال على استخدام الأيقونة
<Button 
  variant="outline" 
  icon={<Copy className="w-4 h-4" />}
  onClick={handleCopyContent}
>
  نسخ
</Button>
```

### دعم RTL:
- يتم عكس مواقع الأيقونات تلقائياً حسب اللغة
- دعم كامل للعربية والإنجليزية

## 2. أزرار التحكم الرئيسية

### الموقع: `src/pages/NoteViewPage.jsx` و `src/pages/JournalViewPage.jsx`

### 2.1 زر الرجوع (Back Button)

```javascript
<Button
  variant="ghost"
  icon={<ArrowLeft className="w-5 h-5" />}
  onClick={() => navigate(-1)}
  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
>
  {language === 'ar' ? 'العودة' : 'Back'}
</Button>
```

**الخصائص:**
- **النوع**: Ghost (شفاف)
- **الأيقونة**: سهم للخلف
- **الوظيفة**: العودة للصفحة السابقة
- **التصميم**: متجاوب مع الوضع المظلم

### 2.2 زر النسخ (Copy Button)

```javascript
<Button
  variant="outline"
  icon={<Copy className="w-4 h-4" />}
  onClick={handleCopyContent}
>
  {language === 'ar' ? 'نسخ' : 'Copy'}
</Button>
```

**الدالة المرتبطة:**
```javascript
const handleCopyContent = async () => {
  if (!note) return;
  try {
    const contentToCopy = `${note.title}\n\n${note.content.replace(/<[^>]*>/g, '')}`;
    const textArea = document.createElement("textarea");
    textArea.value = contentToCopy;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    toast.success('✓ تم نسخ المحتوى بنجاح');
  } catch (error) {
    console.error('Error copying content:', error);
    toast.error('✕ فشل في نسخ المحتوى');
  }
};
```

### 2.3 زر الطباعة (Print Button)

```javascript
<Button
  variant="outline"
  icon={<Printer className="w-4 h-4" />}
  onClick={handlePrint}
>
  {language === 'ar' ? 'طباعة' : 'Print'}
</Button>
```

**الدالة المرتبطة:**
```javascript
const handlePrint = () => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${note.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .content { line-height: 1.6; }
            .meta { color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="title">${note.title}</div>
          <div class="meta">
            ${dayInfo ? `اليوم: ${getDayName(dayInfo.day)}` : ''}
            ${note.createdAt ? `تاريخ الإنشاء: ${new Date(note.createdAt).toLocaleDateString('ar-SA')}` : ''}
          </div>
          <div class="content">${note.content}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};
```

### 2.4 زر التعديل (Edit Button)

```javascript
<Button
  variant="outline"
  icon={<Edit2 className="w-4 h-4" />}
  onClick={handleEditNote}
>
  {language === 'ar' ? 'تعديل' : 'Edit'}
</Button>
```

**الدالة المرتبطة:**
```javascript
const handleEditNote = () => {
  navigate(`/notes/${noteId}/edit`);
};
```

### 2.5 زر الحذف (Delete Button)

```javascript
<Button
  variant="outline"
  icon={<Trash2 className="w-4 h-4" />}
  onClick={() => setShowDeleteModal(true)}
  className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
>
  {language === 'ar' ? 'حذف' : 'Delete'}
</Button>
```

**الخصائص:**
- **النوع**: Outline مع ألوان حمراء مخصصة
- **الوظيفة**: فتح نافذة تأكيد الحذف
- **الأمان**: لا يحذف مباشرة بل يطلب تأكيد

## 3. أزرار نافذة تأكيد الحذف (Modal Buttons)

### الموقع: داخل مكون Modal في صفحات العرض

### 3.1 مكون Modal الأساسي

```javascript
<Modal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
  size="md"
>
  {/* محتوى النافذة */}
</Modal>
```

### 3.2 زر الإلغاء (Cancel Button)

```javascript
<Button
  variant="outline"
  onClick={() => setShowDeleteModal(false)}
>
  {language === 'ar' ? 'إلغاء' : 'Cancel'}
</Button>
```

### 3.3 زر تأكيد الحذف (Confirm Delete Button)

```javascript
<Button
  variant="danger"
  onClick={handleDeleteNote}
>
  {language === 'ar' ? 'حذف' : 'Delete'}
</Button>
```

**الدالة المرتبطة:**
```javascript
const handleDeleteNote = async () => {
  try {
    await deleteNote(parseInt(noteId));
    toast.success('✓ تم حذف الملاحظة بنجاح');
    setShowDeleteModal(false);
    navigate(-1);
  } catch (error) {
    console.error('Error deleting note:', error);
    toast.error('✕ فشل في حذف الملاحظة');
  }
};
```

## 4. أزرار إضافية

### 4.1 زر الانتقال لصفحة اليوم

```javascript
<Button
  variant="outline"
  onClick={() => navigate(`/phases/${dayInfo.week.phase}/weeks/${dayInfo.week.week}/days/${dayInfo.day.key}`)}
  className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-900/20"
>
  {language === 'ar' ? 'العودة لصفحة اليوم' : 'Go to Day Page'}
</Button>
```

### 4.2 زر "العودة" في حالة عدم العثور على المحتوى

```javascript
<Button variant="primary" onClick={() => navigate(-1)}>
  {language === 'ar' ? 'العودة' : 'Go Back'}
</Button>
```

## 5. المميزات المتقدمة

### 5.1 حالة التحميل (Loading State)

```javascript
<Button loading={true} variant="primary">
  جاري الحفظ...
</Button>
```

### 5.2 حالة التعطيل (Disabled State)

```javascript
<Button disabled={true} variant="primary">
  غير متاح
</Button>
```

### 5.3 الأيقونات المخصصة

```javascript
// أيقونة من Lucide React
<Button icon={<Target className="w-4 h-4" />}>
  هدف
</Button>

// أيقونة مخصصة
<Button icon={<CustomIcon />}>
  مخصص
</Button>
```

## 6. أفضل الممارسات

### 6.1 اختيار النوع المناسب
- **Primary**: للإجراءات الرئيسية (حفظ، تأكيد)
- **Outline**: للإجراءات الثانوية (نسخ، طباعة)
- **Ghost**: للتنقل والروابط

### 6.2 استخدام الأيقونات
- استخدم أيقونات واضحة ومفهومة
- تأكد من تناسق حجم الأيقونات
- استخدم الأيقونات المناسبة للسياق

### 6.3 دعم إمكانية الوصول
- استخدم `aria-label` للأيقونات
- تأكد من تباين الألوان المناسب
- دعم التنقل بالكيبورد

### 6.4 التصميم المتجاوب
- استخدم الأحجام المناسبة للأجهزة المختلفة
- تأكد من سهولة النقر على الأجهزة اللمسية
- اختبار على أحجام شاشات مختلفة

## 7. التطوير المستقبلي

### 7.1 إضافة أنواع جديدة
```javascript
const variantClasses = {
  // الأنواع الحالية
  primary: '...',
  outline: '...',
  ghost: '...',
  
  // أنواع جديدة مقترحة
  danger: 'bg-red-600 text-white hover:bg-red-700',
  success: 'bg-green-600 text-white hover:bg-green-700',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700'
};
```

### 7.2 إضافة أحجام جديدة
```javascript
const sizeClasses = {
  // الأحجام الحالية
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
  
  // أحجام جديدة مقترحة
  xs: 'px-2 py-1 text-xs',
  xl: 'px-6 py-4 text-xl'
};
```

### 7.3 تحسينات الأداء
- استخدام `React.memo` لتحسين الأداء
- تحسين إعادة الرسم
- تحسين حجم الحزمة

## الخلاصة

نظام الأزرار في التطبيق مصمم بعناية لتوفير:
- **التناسق**: تصميم موحد عبر جميع الصفحات
- **المرونة**: خيارات متعددة للأنواع والأحجام
- **إمكانية الوصول**: دعم كامل لمعايير الوصول
- **التجربة**: تفاعلات سلسة ومتجاوبة
- **الصيانة**: كود منظم وقابل للتطوير

هذا النظام يوفر أساساً قوياً لبناء واجهات مستخدم احترافية ومتسقة.