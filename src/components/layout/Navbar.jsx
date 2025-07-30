// Navbar.jsx
// شريط التنقل العلوي

import { useTheme } from "../../context/ThemeProvider";
import { useApp } from "../../context/AppContext";
import { Sun, Moon, ShieldCheck, Settings, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  console.log("Navbar rendering");
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userName = "مستخدم افتراضي";

  console.log("Navbar state:", { theme, lang });

  // Defensive check for lang
  if (!lang) {
    return (
      <header className="w-full bg-white/80 dark:bg-dark-background backdrop-blur-sm border-b border-light-border dark:border-dark-border shadow-sm text-light-text dark:text-dark-text px-4 h-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </header>
    );
  }

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const toggleLang = () => setLang(lang === "ar" ? "en" : "ar");

  return (
    <header className="w-full bg-white/80 dark:bg-dark-background backdrop-blur-sm border-b border-light-border dark:border-dark-border shadow-sm text-light-text dark:text-dark-text px-4 h-16 flex items-center justify-between">
      {/* Logo/Home */}
      <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 group focus:outline-none" tabIndex={0} aria-label="العودة للصفحة الرئيسية">
        <ShieldCheck className="w-7 h-7 text-yellow-500 dark:text-yellow-400 group-hover:scale-110 transition" />
        <span className="font-bold text-lg hidden sm:inline">CyberPlan</span>
      </button>
      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <User className="w-4 h-4" />
          <span>{userName}</span>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition" aria-label={t("theme", "تغيير الثيم")}>{theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
        <button onClick={toggleLang} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition" aria-label={t("lang", "تغيير اللغة")}>{lang === "ar" ? "EN" : "AR"}</button>
        <button onClick={() => navigate('/settings')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition" aria-label="الإعدادات">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
