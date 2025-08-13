# أمثلة عملية لاستخدام الأزرار في التطبيق

## نظرة عامة

هذا الملف يحتوي على أمثلة عملية وشاملة لاستخدام مكون Button في مختلف السياقات داخل التطبيق.

## 1. أمثلة أساسية

### 1.1 زر أساسي (Primary)

```javascript
import Button from '../components/ui/Button';

// زر أساسي بسيط
<Button onClick={handleSave}>
  حفظ
</Button>

// زر أساسي مع أيقونة
<Button 
  variant="primary" 
  icon={<Save className="w-4 h-4" />}
  onClick={handleSave}
>
  حفظ التغييرات
</Button>
```

### 1.2 زر إطار (Outline)

```javascript
// زر إطار بسيط
<Button variant="outline" onClick={handleCancel}>
  إلغاء
</Button>

// زر إطار مع أيقونة
<Button 
  variant="outline" 
  icon={<Download className="w-4 h-4" />}
  onClick={handleDownload}
>
  تحميل
</Button>
```

### 1.3 زر شبح (Ghost)

```javascript
// زر شبح للتنقل
<Button 
  variant="ghost" 
  icon={<ArrowLeft className="w-4 h-4" />}
  onClick={() => navigate(-1)}
>
  العودة
</Button>
```

## 2. أمثلة متقدمة

### 2.1 أزرار مع حالات مختلفة

```javascript
// زر مع حالة التحميل
<Button 
  variant="primary" 
  loading={isSaving}
  disabled={isSaving}
  onClick={handleSave}
>
  {isSaving ? 'جاري الحفظ...' : 'حفظ'}
</Button>

// زر معقّل
<Button 
  variant="outline" 
  disabled={!hasChanges}
  onClick={handleSave}
>
  حفظ التغييرات
</Button>
```

### 2.2 أزرار مع أحجام مختلفة

```javascript
// زر صغير
<Button size="sm" variant="outline" onClick={handleEdit}>
  تعديل
</Button>

// زر كبير
<Button size="lg" variant="primary" onClick={handleSubmit}>
  إرسال
</Button>
```

### 2.3 أزرار مع أيقونات في مواقع مختلفة

```javascript
// أيقونة على اليسار (افتراضي)
<Button 
  icon={<Plus className="w-4 h-4" />}
  onClick={handleAdd}
>
  إضافة جديد
</Button>

// أيقونة على اليمين
<Button 
  icon={<ArrowRight className="w-4 h-4" />}
  iconPosition="right"
  onClick={handleNext}
>
  التالي
</Button>
```

## 3. أمثلة من التطبيق الفعلي

### 3.1 أزرار التحكم في صفحة عرض الملاحظة

```javascript
// مجموعة أزرار التحكم
<div className="flex items-center gap-2">
  {/* زر النسخ */}
  <Button
    variant="outline"
    icon={<Copy className="w-4 h-4" />}
    onClick={handleCopyContent}
    title="نسخ المحتوى"
  >
    {language === 'ar' ? 'نسخ' : 'Copy'}
  </Button>

  {/* زر الطباعة */}
  <Button
    variant="outline"
    icon={<Printer className="w-4 h-4" />}
    onClick={handlePrint}
    title="طباعة الملاحظة"
  >
    {language === 'ar' ? 'طباعة' : 'Print'}
  </Button>

  {/* زر التعديل */}
  <Button
    variant="outline"
    icon={<Edit2 className="w-4 h-4" />}
    onClick={handleEditNote}
    title="تعديل الملاحظة"
  >
    {language === 'ar' ? 'تعديل' : 'Edit'}
  </Button>

  {/* زر الحذف */}
  <Button
    variant="outline"
    icon={<Trash2 className="w-4 h-4" />}
    onClick={() => setShowDeleteModal(true)}
    className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
    title="حذف الملاحظة"
  >
    {language === 'ar' ? 'حذف' : 'Delete'}
  </Button>
</div>
```

### 3.2 أزرار نافذة تأكيد الحذف

```javascript
// أزرار Modal
<div className="flex justify-center space-x-3">
  {/* زر الإلغاء */}
  <Button
    variant="outline"
    onClick={() => setShowDeleteModal(false)}
  >
    {language === 'ar' ? 'إلغاء' : 'Cancel'}
  </Button>

  {/* زر تأكيد الحذف */}
  <Button
    variant="danger"
    onClick={handleDeleteNote}
  >
    {language === 'ar' ? 'حذف' : 'Delete'}
  </Button>
</div>
```

### 3.3 زر الانتقال لصفحة اليوم

```javascript
// زر في قسم معلومات اليوم
<Button
  variant="outline"
  onClick={() => navigate(`/phases/${dayInfo.week.phase}/weeks/${dayInfo.week.week}/days/${dayInfo.day.key}`)}
  className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-900/20"
>
  {language === 'ar' ? 'العودة لصفحة اليوم' : 'Go to Day Page'}
</Button>
```

## 4. أمثلة للتفاعلات

### 4.1 معالجة النقر

```javascript
// دالة بسيطة
const handleClick = () => {
  console.log('تم النقر على الزر');
};

<Button onClick={handleClick}>
  انقر هنا
</Button>

// دالة مع معاملات
const handleSave = (data) => {
  console.log('حفظ البيانات:', data);
};

<Button onClick={() => handleSave(formData)}>
  حفظ
</Button>

// دالة غير متزامنة
const handleAsyncAction = async () => {
  try {
    setLoading(true);
    await apiCall();
    toast.success('تم بنجاح');
  } catch (error) {
    toast.error('حدث خطأ');
  } finally {
    setLoading(false);
  }
};

<Button 
  loading={loading}
  disabled={loading}
  onClick={handleAsyncAction}
>
  تنفيذ العملية
</Button>
```

### 4.2 التنقل

```javascript
// العودة للصفحة السابقة
<Button onClick={() => navigate(-1)}>
  العودة
</Button>

// الانتقال لصفحة محددة
<Button onClick={() => navigate('/dashboard')}>
  لوحة التحكم
</Button>

// الانتقال مع معاملات
<Button onClick={() => navigate(`/edit/${id}`)}>
  تعديل
</Button>
```

## 5. أمثلة للتصميم المتجاوب

### 5.1 أزرار متجاوبة

```javascript
// أزرار تتكيف مع حجم الشاشة
<div className="flex flex-col sm:flex-row gap-2">
  <Button variant="primary" className="w-full sm:w-auto">
    إجراء رئيسي
  </Button>
  <Button variant="outline" className="w-full sm:w-auto">
    إجراء ثانوي
  </Button>
</div>
```

### 5.2 أزرار مع تخطيط مرن

```javascript
// تخطيط مرن للأزرار
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Button variant="outline" icon={<FileText className="w-4 h-4" />}>
    عرض التفاصيل
  </Button>
  <Button variant="outline" icon={<Edit2 className="w-4 h-4" />}>
    تعديل
  </Button>
  <Button variant="outline" icon={<Trash2 className="w-4 h-4" />}>
    حذف
  </Button>
</div>
```

## 6. أمثلة للاختبار

### 6.1 اختبار الأزرار

```javascript
// اختبار بسيط
test('يجب أن ينفذ الزر الدالة عند النقر', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>انقر هنا</Button>);
  
  fireEvent.click(screen.getByText('انقر هنا'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

// اختبار حالة التعطيل
test('يجب أن يكون الزر معقلاً عندما يكون disabled', () => {
  render(<Button disabled>زر معقّل</Button>);
  
  const button = screen.getByText('زر معقّل');
  expect(button).toBeDisabled();
});

// اختبار حالة التحميل
test('يجب أن يعرض الزر حالة التحميل', () => {
  render(<Button loading>جاري التحميل</Button>);
  
  expect(screen.getByText('جاري التحميل')).toBeInTheDocument();
  // يمكن أيضاً اختبار وجود LoadingSpinner
});
```

## 7. أفضل الممارسات

### 7.1 اختيار النوع المناسب

```javascript
// ✅ صحيح - استخدام primary للإجراءات الرئيسية
<Button variant="primary" onClick={handleSubmit}>
  إرسال النموذج
</Button>

// ✅ صحيح - استخدام outline للإجراءات الثانوية
<Button variant="outline" onClick={handleCancel}>
  إلغاء
</Button>

// ✅ صحيح - استخدام ghost للتنقل
<Button variant="ghost" onClick={() => navigate(-1)}>
  العودة
</Button>

// ✅ صحيح - استخدام danger للإجراءات الخطيرة
<Button variant="danger" onClick={handleDelete}>
  حذف
</Button>
```

### 7.2 استخدام الأيقونات بشكل صحيح

```javascript
// ✅ صحيح - أيقونة واضحة ومفهومة
<Button icon={<Save className="w-4 h-4" />}>
  حفظ
</Button>

// ✅ صحيح - أيقونة مع نص توضيحي
<Button icon={<Download className="w-4 h-4" />}>
  تحميل الملف
</Button>

// ❌ خطأ - أيقونة بدون نص (غير واضح)
<Button icon={<Settings className="w-4 h-4" />} />
```

### 7.3 معالجة الحالات المختلفة

```javascript
// ✅ صحيح - معالجة حالة التحميل
<Button 
  loading={isLoading}
  disabled={isLoading}
  onClick={handleSubmit}
>
  {isLoading ? 'جاري الإرسال...' : 'إرسال'}
</Button>

// ✅ صحيح - معالجة حالة التعطيل
<Button 
  disabled={!isValid}
  onClick={handleSubmit}
>
  إرسال
</Button>
```

## 8. أمثلة للتحسين

### 8.1 تحسين الأداء

```javascript
// استخدام React.memo للتحسين
const MemoizedButton = React.memo(Button);

// استخدام useCallback للدوال
const handleClick = useCallback(() => {
  // منطق الزر
}, [dependencies]);

<Button onClick={handleClick}>
  انقر هنا
</Button>
```

### 8.2 تحسين إمكانية الوصول

```javascript
// إضافة aria-label للأيقونات
<Button 
  icon={<Settings className="w-4 h-4" />}
  aria-label="إعدادات"
  onClick={handleSettings}
>
  الإعدادات
</Button>

// إضافة title للتوضيح
<Button 
  title="حذف هذا العنصر نهائياً"
  variant="danger"
  onClick={handleDelete}
>
  حذف
</Button>
```

## الخلاصة

هذه الأمثلة توضح كيفية استخدام مكون Button بشكل فعال في مختلف السياقات. المفتاح هو:

1. **اختيار النوع المناسب** للسياق
2. **استخدام الأيقونات** بشكل واضح ومفهوم
3. **معالجة الحالات المختلفة** (تحميل، تعطيل)
4. **تحسين إمكانية الوصول** للمستخدمين
5. **اتباع أفضل الممارسات** للتصميم والتطوير

هذه الأمثلة تساعد في بناء واجهات مستخدم متسقة ومتجاوبة وسهلة الاستخدام.