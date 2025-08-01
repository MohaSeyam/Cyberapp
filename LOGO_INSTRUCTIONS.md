# تعليمات رفع اللوقو

## مكان رفع اللوقو

### الخيار الأول (مفضل): `src/assets/images/`
```
src/assets/images/logo.png
src/assets/images/logo.svg
src/assets/images/logo.webp
```

### الخيار الثاني: `public/`
```
public/logo.png
public/logo.svg
public/logo.webp
```

## تنسيقات مدعومة
- PNG (مفضل للصور المعقدة)
- SVG (مفضل للشعارات البسيطة - قابل للتكبير بدون فقدان الجودة)
- WebP (مفضل للأداء - حجم أصغر)

## أحجام مقترحة
- **SVG**: أي حجم (قابل للتكبير)
- **PNG/WebP**: 32x32px أو 64x64px أو 128x128px

## كيفية استخدام اللوقو في الكود

### إذا رفعت اللوقو في `src/assets/images/`:
```tsx
import logo from '../../assets/images/logo.png';

// في مكون Navbar
<img src={logo} alt="CyberPlan Logo" className="w-8 h-8" />
```

### إذا رفعت اللوقو في `public/`:
```tsx
// في مكون Navbar
<img src="/logo.png" alt="CyberPlan Logo" className="w-8 h-8" />
```

## ملاحظات مهمة
1. تأكد من أن اللوقو يعمل بشكل جيد في الوضعين الفاتح والمظلم
2. يفضل استخدام SVG للشعارات البسيطة
3. تأكد من أن اللوقو واضح حتى في الأحجام الصغيرة
4. يمكنك رفع عدة أحجام للوقو نفسه

## الملفات المطلوبة تعديلها بعد رفع اللوقو
- `src/components/layout/Navbar.tsx` - استبدال اللوقو المؤقت باللوقو الحقيقي