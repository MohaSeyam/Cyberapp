import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, 
  Moon, 
  User, 
  Download, 
  Trash2, 
  Info,
  Settings as SettingsIcon,
  Bell,
  Volume2,
  VolumeX,
  Palette,
  Type,
  Monitor,
  Smartphone,
  Globe,
  Shield,
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeProvider";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { exportAllData, importAllData, clearAllData } from "../services/dbService";
import toast from "react-hot-toast";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { 
    lang, 
    setLang, 
    settings, 
    updateSettings, 
    addNotification 
  } = useApp();
  const { theme, setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState("general");
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmImport, setShowConfirmImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  // تطبيق الإعدادات فورياً عند التغيير
  const handleSettingChange = async (newSettings) => {
    try {
      await updateSettings(newSettings);
      
      // تطبيق الإعدادات فورياً
      if (newSettings.fontSize) {
        document.documentElement.className = document.documentElement.className
          .replace(/font-size-\w+/g, `font-size-${newSettings.fontSize}`);
        document.documentElement.classList.add(`font-size-${newSettings.fontSize}`);
      }
      
      if (newSettings.compactMode !== undefined) {
        if (newSettings.compactMode) {
          document.body.classList.add('compact-mode');
        } else {
          document.body.classList.remove('compact-mode');
        }
      }
      
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error("خطأ في حفظ الإعدادات");
    }
  };

  // تطبيق الإعدادات عند تحميل الصفحة
  useEffect(() => {
    if (settings.fontSize) {
      document.documentElement.className = document.documentElement.className
        .replace(/font-size-\w+/g, `font-size-${settings.fontSize}`);
      document.documentElement.classList.add(`font-size-${settings.fontSize}`);
    }
    
    if (settings.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  }, [settings]);

  const tabs = [
    { id: "general", label: t("general", "عام"), icon: SettingsIcon },
    { id: "appearance", label: t("appearance", "المظهر"), icon: Palette },
    { id: "notifications", label: t("notifications", "الإشعارات"), icon: Bell },
    { id: "data", label: t("data", "البيانات"), icon: Database },
    { id: "privacy", label: t("privacy", "الخصوصية"), icon: Shield }
  ];

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportAllData();
      addNotification('success', 'تم تصدير البيانات', 'تم تصدير البيانات بنجاح');
      toast.success("تم تصدير البيانات بنجاح");
    } catch (error) {
      console.error('Export error:', error);
      addNotification('error', 'خطأ في تصدير البيانات', 'فشل في تصدير البيانات');
      toast.error("خطأ في تصدير البيانات");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    
    try {
      setImporting(true);
      await importAllData(importFile);
      setShowConfirmImport(false);
      setImportFile(null);
      addNotification('success', 'تم استيراد البيانات', 'تم استيراد البيانات بنجاح');
      toast.success("تم استيراد البيانات بنجاح");
    } catch (error) {
      console.error('Import error:', error);
      addNotification('error', 'خطأ في استيراد البيانات', 'فشل في استيراد البيانات');
      toast.error("خطأ في استيراد البيانات");
    } finally {
      setImporting(false);
    }
  };

  const handleClearData = async () => {
    try {
      await clearAllData();
      setShowConfirmClear(false);
      addNotification('success', 'تم مسح البيانات', 'تم مسح جميع البيانات بنجاح');
      toast.success("تم مسح جميع البيانات بنجاح");
    } catch (error) {
      console.error('Clear data error:', error);
      addNotification('error', 'خطأ في مسح البيانات', 'فشل في مسح البيانات');
      toast.error("خطأ في مسح البيانات");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      setImportFile(file);
      toast.success("تم اختيار الملف بنجاح");
    } else {
      addNotification('error', 'ملف غير صالح', 'يرجى اختيار ملف JSON صالح');
      toast.error("يرجى اختيار ملف JSON صالح");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className="max-w-6xl mx-auto py-8 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <h1 className="text-3xl md:text-4xl font-bold text-light-accent dark:text-dark-accent mb-2 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8" />
          {t("settings", "الإعدادات")}
        </h1>
        <p className="text-light-textSecondary dark:text-dark-textSecondary">
          {t("settingsDescription", "خصص تجربتك وحدد تفضيلاتك")}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div className="lg:col-span-1" variants={itemVariants}>
          <Card>
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-light-accent dark:bg-dark-accent text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div className="lg:col-span-3" variants={itemVariants}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* General Settings */}
              {activeTab === "general" && (
                <Card>
                  <h2 className="text-xl font-semibold mb-6">{t("generalSettings", "الإعدادات العامة")}</h2>
                  
                  <div className="space-y-6">
                    {/* Language */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {t("language", "اللغة")}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant={lang === "ar" ? "primary" : "outline"}
                          onClick={() => setLang("ar")}
                          className="flex items-center gap-2"
                        >
                          العربية
                        </Button>
                        <Button
                          variant={lang === "en" ? "primary" : "outline"}
                          onClick={() => setLang("en")}
                          className="flex items-center gap-2"
                        >
                          English
                        </Button>
                      </div>
                    </div>

                    {/* Theme */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        {t("theme", "المظهر")}
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          variant={theme === "light" ? "primary" : "outline"}
                          onClick={() => setTheme("light")}
                          className="flex items-center gap-2"
                        >
                          <Sun className="w-4 h-4" />
                          {t("light", "فاتح")}
                        </Button>
                        <Button
                          variant={theme === "dark" ? "primary" : "outline"}
                          onClick={() => setTheme("dark")}
                          className="flex items-center gap-2"
                        >
                          <Moon className="w-4 h-4" />
                          {t("dark", "داكن")}
                        </Button>
                        <Button
                          variant={theme === "auto" ? "primary" : "outline"}
                          onClick={() => setTheme("auto")}
                          className="flex items-center gap-2"
                        >
                          <Monitor className="w-4 h-4" />
                          {t("auto", "تلقائي")}
                        </Button>
                      </div>
                    </div>

                    {/* Font Size */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        {t("fontSize", "حجم الخط")}
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: "small", label: "صغير" },
                          { value: "medium", label: "متوسط" },
                          { value: "large", label: "كبير" }
                        ].map((size) => (
                          <Button
                            key={size.value}
                            variant={settings.fontSize === size.value ? "primary" : "outline"}
                            onClick={() => handleSettingChange({ fontSize: size.value })}
                          >
                            {size.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Compact Mode */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        {t("compactMode", "الوضع المضغوط")}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="compactMode"
                          checked={settings.compactMode || false}
                          onChange={(e) => handleSettingChange({ compactMode: e.target.checked })}
                          className="w-4 h-4 text-light-accent dark:text-dark-accent"
                        />
                        <label htmlFor="compactMode" className="text-sm">
                          {t("compactModeDescription", "تقليل المساحات والهوامش")}
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Appearance Settings */}
              {activeTab === "appearance" && (
                <Card>
                  <h2 className="text-xl font-semibold mb-6">{t("appearanceSettings", "إعدادات المظهر")}</h2>
                  
                  <div className="space-y-6">
                    {/* Color Scheme */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("colorScheme", "نظام الألوان")}
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { value: "blue", label: "أزرق", color: "bg-blue-500" },
                          { value: "green", label: "أخضر", color: "bg-green-500" },
                          { value: "purple", label: "بنفسجي", color: "bg-purple-500" },
                          { value: "orange", label: "برتقالي", color: "bg-orange-500" }
                        ].map((color) => (
                          <Button
                            key={color.value}
                            variant="outline"
                            onClick={() => handleSettingChange({ colorScheme: color.value })}
                            className={`border-2 ${
                              settings.colorScheme === color.value ? 'border-current' : ''
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full ${color.color}`} />
                            {color.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Animation */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("animations", "الحركات")}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="animations"
                          checked={settings.animations || false}
                          onChange={(e) => handleSettingChange({ animations: e.target.checked })}
                          className="w-4 h-4 text-light-accent dark:text-dark-accent"
                        />
                        <label htmlFor="animations" className="text-sm">
                          {t("enableAnimations", "تفعيل الحركات والانتقالات")}
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Notifications Settings */}
              {activeTab === "notifications" && (
                <Card>
                  <h2 className="text-xl font-semibold mb-6">{t("notificationSettings", "إعدادات الإشعارات")}</h2>
                  
                  <div className="space-y-6">
                    {/* Enable Notifications */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        {t("notifications", "الإشعارات")}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="notifications"
                          checked={settings.notifications || false}
                          onChange={(e) => handleSettingChange({ notifications: e.target.checked })}
                          className="w-4 h-4 text-light-accent dark:text-dark-accent"
                        />
                        <label htmlFor="notifications" className="text-sm">
                          {t("enableNotifications", "تفعيل الإشعارات")}
                        </label>
                      </div>
                    </div>

                    {/* Sound */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        {settings.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        {t("sound", "الصوت")}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="sound"
                          checked={settings.sound || false}
                          onChange={(e) => handleSettingChange({ sound: e.target.checked })}
                          className="w-4 h-4 text-light-accent dark:text-dark-accent"
                        />
                        <label htmlFor="sound" className="text-sm">
                          {t("enableSound", "تفعيل الأصوات")}
                        </label>
                      </div>
                    </div>

                    {/* Auto Save */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("autoSave", "الحفظ التلقائي")}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="autoSave"
                          checked={settings.autoSave || false}
                          onChange={(e) => handleSettingChange({ autoSave: e.target.checked })}
                          className="w-4 h-4 text-light-accent dark:text-dark-accent"
                        />
                        <label htmlFor="autoSave" className="text-sm">
                          {t("autoSaveDescription", "حفظ التغييرات تلقائياً")}
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Data Settings */}
              {activeTab === "data" && (
                <Card>
                  <h2 className="text-xl font-semibold mb-6">{t("dataSettings", "إعدادات البيانات")}</h2>
                  
                  <div className="space-y-6">
                    {/* Export Data */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        {t("exportData", "تصدير البيانات")}
                      </label>
                      <Button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2"
                      >
                        {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {exporting ? t("exporting", "جاري التصدير...") : t("exportBackup", "تصدير نسخة احتياطية")}
                      </Button>
                    </div>

                    {/* Import Data */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        {t("importData", "استيراد البيانات")}
                      </label>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-light-accent dark:file:bg-dark-accent file:text-white hover:file:bg-opacity-80"
                      />
                      {importFile && (
                        <Button
                          onClick={() => setShowConfirmImport(true)}
                          className="mt-2 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {t("importSelected", "استيراد الملف المحدد")}
                        </Button>
                      )}
                    </div>

                    {/* Clear Data */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-red-500" />
                        {t("clearData", "مسح البيانات")}
                      </label>
                      <Button
                        onClick={() => setShowConfirmClear(true)}
                        variant="outline"
                        className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t("clearAllData", "مسح جميع البيانات")}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Privacy Settings */}
              {activeTab === "privacy" && (
                <Card>
                  <h2 className="text-xl font-semibold mb-6">{t("privacySettings", "إعدادات الخصوصية")}</h2>
                  
                  <div className="space-y-6">
                    {/* Data Collection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("dataCollection", "جمع البيانات")}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="dataCollection"
                          checked={settings.dataCollection || false}
                          onChange={(e) => handleSettingChange({ dataCollection: e.target.checked })}
                          className="w-4 h-4 text-light-accent dark:text-dark-accent"
                        />
                        <label htmlFor="dataCollection" className="text-sm">
                          {t("allowDataCollection", "السماح بجمع البيانات لتحسين التجربة")}
                        </label>
                      </div>
                    </div>

                    {/* Analytics */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t("analytics", "التحليلات")}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="analytics"
                          checked={settings.analytics || false}
                          onChange={(e) => handleSettingChange({ analytics: e.target.checked })}
                          className="w-4 h-4 text-light-accent dark:text-dark-accent"
                        />
                        <label htmlFor="analytics" className="text-sm">
                          {t("enableAnalytics", "تفعيل التحليلات")}
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Confirm Import Modal */}
      <AnimatePresence>
        {showConfirmImport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmImport(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold">{t("confirmImport", "تأكيد استيراد البيانات")}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t("importDataWarning", "سيتم استبدال البيانات الحالية بالبيانات المستوردة. هل تريد المتابعة؟")}
              </p>
              <div className="flex gap-3">
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {importing ? t("importing", "جاري الاستيراد...") : t("confirm", "تأكيد")}
                </Button>
                <Button variant="outline" onClick={() => setShowConfirmImport(false)}>
                  {t("cancel", "إلغاء")}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Clear Data Modal */}
      <AnimatePresence>
        {showConfirmClear && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmClear(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold">{t("confirmClearData", "تأكيد مسح البيانات")}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t("clearDataWarning", "سيتم مسح جميع البيانات نهائياً. هذا الإجراء لا يمكن التراجع عنه. هل تريد المتابعة؟")}
              </p>
              <div className="flex gap-3">
                <Button onClick={handleClearData} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                  {t("confirm", "تأكيد")}
                </Button>
                <Button onClick={() => setShowConfirmClear(false)}>
                  {t("cancel", "إلغاء")}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
