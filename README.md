# 🚀 CyberPlan - تطبيق تعلم الأمن السيبراني

تطبيق React متقدم لتعلم الأمن السيبراني مع نظام إدارة المهام واليوميات والتقدم. يوفر تجربة تعليمية شاملة مع واجهة مستخدم حديثة وميزات متقدمة.

## 🎯 المميزات الرئيسية

### 📚 **خطة تعليمية شاملة**
- **50 أسبوع من التعلم**: خطة منظمة ومتدرجة
- **3 مراحل رئيسية**: أساسيات، متقدم، متخصص
- **مهام يومية**: أنشطة تفاعلية وممارسة عملية
- **مراجع مقترحة**: مصادر تعليمية متنوعة

### 📝 **إدارة المحتوى**
- **الملاحظات**: نظام متقدم لكتابة وتنظيم الملاحظات
- **اليوميات**: تدوين يومي للتقدم والخبرات
- **المراجع**: إضافة وإدارة المصادر التعليمية
- **التصنيفات**: تنظيم المحتوى بالعلامات

### 📊 **تتبع التقدم**
- **إحصائيات مفصلة**: عرض التقدم والإنجازات
- **مؤشرات بصرية**: رسوم بيانية وتقدم مرئي
- **الإنجازات**: نظام مكافآت وتحفيز
- **التقارير**: تصدير البيانات والتقارير

### 🎨 **واجهة مستخدم حديثة**
- **تصميم متجاوب**: يعمل على جميع الأجهزة
- **الوضع المظلم**: تجربة مريحة للعين
- **حركات سلسة**: انتقالات وحركات احترافية
- **دعم متعدد اللغات**: العربية والإنجليزية

### 💾 **تخزين محلي**
- **IndexedDB**: قاعدة بيانات محلية متقدمة
- **لا حاجة لخادم**: يعمل بدون إنترنت
- **مزامنة تلقائية**: حفظ فوري للبيانات
- **تصدير واستيراد**: نسخ احتياطية للبيانات

### ⚡ **PWA (Progressive Web App)**
- **قابل للتثبيت**: تثبيت كتطبيق على الأجهزة
- **يعمل بدون إنترنت**: استخدام محلي كامل
- **إشعارات**: تنبيهات وإشعارات محلية
- **تحديثات تلقائية**: تحسينات مستمرة

## 🏗️ البنية التقنية

### **Frontend (React.js)**
- **React 19** مع Hooks و Context API
- **Vite** للبناء السريع
- **Tailwind CSS** للتصميم
- **Framer Motion** للحركات
- **Dexie.js** لقاعدة البيانات المحلية
- **TipTap** لتحرير النصوص المتقدم

### **التخزين المحلي**
- **IndexedDB**: قاعدة بيانات محلية متقدمة
- **LocalStorage**: إعدادات المستخدم
- **Dexie.js**: واجهة سهلة لقاعدة البيانات

## 🚀 التثبيت والتشغيل

### **المتطلبات**
- Node.js (v16 أو أحدث)
- npm أو yarn

### **التثبيت السريع**

```bash
# استنساخ المشروع
git clone <repository-url>
cd cyberplan

# تثبيت dependencies
npm install

# تشغيل التطبيق
npm run dev
```
npm run dev
```

### **التشغيل مع Docker**

```bash
# تشغيل جميع الخدمات
docker-compose up -d

# الوصول للتطبيق
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# API Docs: http://localhost:5000/api/docs
```

## 📚 API Documentation

### **الوصول للتوثيق**
- **Swagger UI**: http://localhost:5000/api/docs
- **OpenAPI Spec**: http://localhost:5000/api/docs/swagger.json

### **Endpoints الرئيسية**

#### **Authentication**
```http
POST /api/auth/register    # تسجيل مستخدم جديد
POST /api/auth/login       # تسجيل الدخول
GET  /api/auth/profile     # معلومات المستخدم
POST /api/auth/refresh     # تجديد التوكن
```

#### **Notes**
```http
GET    /api/notes          # جلب الملاحظات
POST   /api/notes          # إنشاء ملاحظة
PUT    /api/notes/:id      # تحديث ملاحظة
DELETE /api/notes/:id      # حذف ملاحظة
```

#### **Journal**
```http
GET    /api/journal        # جلب المدونات
POST   /api/journal        # إنشاء مدونة
PUT    /api/journal/:id    # تحديث مدونة
DELETE /api/journal/:id    # حذف مدونة
```

#### **Progress**
```http
GET    /api/progress       # جلب التقدم
POST   /api/progress       # تحديث التقدم
```

## 🔧 الإعدادات المتقدمة

### **Environment Variables**

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DB_PATH=./data/cyberplan.db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### **WebSocket Events**

#### **Client to Server**
```javascript
// إرسال نشاط المستخدم
socket.emit('user_activity', { type: 'note_edit', data: {} });

// بدء الكتابة
socket.emit('typing_start', { noteId: 123 });

// إيقاف الكتابة
socket.emit('typing_stop', { noteId: 123 });
```

#### **Server to Client**
```javascript
// إشعارات
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

// تحديثات التقدم
socket.on('progress_update', (data) => {
  console.log('Progress updated:', data);
});

// إنجازات
socket.on('achievement', (data) => {
  console.log('New achievement:', data);
});
```

## 📊 الميزات المتقدمة

### **1. نظام الإنجازات**
- **Completion Milestones**: إنجازات عند إكمال نسب معينة
- **Consistency Awards**: مكافآت الاستمرارية
- **Speed Achievements**: إنجازات السرعة
- **Quality Badges**: شارات الجودة

### **2. تحليلات متقدمة**
- **Learning Analytics**: تحليلات التعلم
- **Progress Tracking**: تتبع التقدم
- **Performance Metrics**: مقاييس الأداء
- **User Behavior Analysis**: تحليل سلوك المستخدم

### **3. نظام التذكيرات**
- **Daily Reminders**: تذكيرات يومية
- **Weekly Summaries**: ملخصات أسبوعية
- **Achievement Notifications**: إشعارات الإنجازات
- **Custom Alerts**: تنبيهات مخصصة

### **4. التعاون المباشر**
- **Real-time Editing**: تحرير مباشر
- **Typing Indicators**: مؤشرات الكتابة
- **Live Notifications**: إشعارات مباشرة
- **Shared Workspaces**: مساحات عمل مشتركة

## 🛠️ التطوير

### **Scripts المتاحة**

```bash
# Frontend
npm run dev          # تشغيل في وضع التطوير
npm run build        # بناء للإنتاج
npm run preview      # معاينة البناء

# Backend
cd backend
npm run dev          # تشغيل مع nodemon
npm run init-db      # تهيئة قاعدة البيانات
npm run migrate      # ترحيل البيانات
npm run seed         # إضافة بيانات تجريبية
npm test             # تشغيل الاختبارات
npm run lint         # فحص الكود
```

### **هيكل المشروع**

```
cyberplan/
├── src/                    # Frontend React
│   ├── components/         # المكونات
│   ├── pages/             # الصفحات
│   ├── context/           # Context API
│   ├── services/          # خدمات Frontend
│   └── styles/            # الأنماط
├── backend/               # Backend Node.js
│   ├── routes/            # مسارات API
│   ├── services/          # خدمات Backend
│   ├── middleware/        # Middleware
│   ├── config/            # الإعدادات
│   ├── templates/         # قوالب البريد
│   └── scripts/           # سكريبتات
├── public/                # الملفات العامة
└── docker-compose.yml     # تكوين Docker
```

## 🚀 النشر

### **Production Deployment**

```bash
# بناء Frontend
npm run build

# تشغيل Backend
cd backend
npm start

# أو استخدام Docker
docker-compose -f docker-compose.prod.yml up -d
```

### **Environment Variables للإنتاج**

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-production-secret
SMTP_HOST=your-smtp-host
REDIS_URL=your-redis-url
FRONTEND_URL=https://your-domain.com
```

## 📈 المراقبة والصيانة

### **Health Checks**
- **API Health**: `GET /health`
- **Database Status**: فحص حالة قاعدة البيانات
- **Service Status**: حالة الخدمات
- **Performance Metrics**: مقاييس الأداء

### **Logging**
- **Application Logs**: سجلات التطبيق
- **Error Tracking**: تتبع الأخطاء
- **Performance Monitoring**: مراقبة الأداء
- **User Activity Logs**: سجلات نشاط المستخدمين

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء branch للميزة الجديدة
3. Commit التغييرات
4. Push إلى Branch
5. إنشاء Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 🆘 الدعم

- **Documentation**: [API Docs](http://localhost:5000/api/docs)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Email**: support@cyberplan.com

## 🔮 التطويرات المستقبلية

- [ ] **Mobile App**: تطبيق جوال
- [ ] **AI Integration**: تكامل الذكاء الاصطناعي
- [ ] **Advanced Analytics**: تحليلات متقدمة
- [ ] **Social Features**: ميزات اجتماعية
- [ ] **Gamification**: نظام الألعاب
- [ ] **Certification System**: نظام الشهادات

---

**CyberPlan** - منصة تعلم الأمن السيبراني المتقدمة 🚀