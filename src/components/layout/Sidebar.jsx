import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FaBook, FaBookOpen, FaMedal, FaHome, FaStickyNote, FaCog } from "react-icons/fa";
import { ShieldCheck, TrendingUp } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { motion } from "framer-motion";

export default function Sidebar() {
  const location = useLocation();
  const { plan } = useApp();
  
  // إذا كانت الخطة undefined أو null أو ليست مصفوفة أو كل عنصر فيها ليس له phase، اعتبرها فارغة
  const isPlanEmpty = !plan || !Array.isArray(plan) || plan.length === 0 || plan.every(w => !w.phase);
  
  if (isPlanEmpty) {
    return (
      <aside className="fixed top-0 right-0 h-full w-64 bg-light-card dark:bg-dark-card border-l border-light-border dark:border-dark-border shadow-lg flex flex-col py-6 px-4 z-40 items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-light-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-slate-400 text-sm">جاري تحميل الخطة...</span>
        </motion.div>
      </aside>
    );
  }

  // استخرج جميع المراحل الفريدة
  const phases = Array.from(new Set(plan.map(w => w.phase)));
  
  const navItems = [
    { to: "/", icon: FaHome, label: "لوحة التحكم", end: true },
    { to: "/phases", icon: FaBookOpen, label: "المراحل" },
    { to: "/notebook", icon: FaStickyNote, label: "الملاحظات" },
    { to: "/journal", icon: FaBook, label: "المدونة" },
    { to: "/achievements", icon: FaMedal, label: "الإنجازات" },
    { to: "/settings", icon: FaCog, label: "الإعدادات" }
  ];

  return (
    <aside className="fixed top-0 right-0 h-full w-64 bg-light-card dark:bg-dark-card border-l border-light-border dark:border-dark-border shadow-lg flex flex-col py-6 px-4 z-40">
      {/* Header */}
      <motion.div 
        className="flex flex-col items-center mb-8 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <ShieldCheck className="w-12 h-12 text-light-accent dark:text-dark-accent mb-2" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-dark-card"></div>
        </div>
        <span className="font-bold text-xl text-light-text dark:text-dark-text">CyberPlan</span>
        <span className="text-xs text-gray-500 mt-1">منصة الأمن السيبراني</span>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 w-full flex flex-col gap-1">
        {navItems.map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <NavLink 
              to={item.to} 
              end={item.end}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent border-r-2 border-light-accent dark:border-dark-accent' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }
              `}
            >
              <item.icon className={`w-5 h-5 transition-colors ${location.pathname === item.to ? 'text-light-accent dark:text-dark-accent' : ''}`} />
              <span className="font-medium">{item.label}</span>
              {location.pathname === item.to && (
                <motion.div 
                  className="absolute left-0 w-1 h-8 bg-light-accent dark:bg-dark-accent rounded-r-full"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Progress Summary */}
      <motion.div 
        className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">التقدم العام</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-blue-700 dark:text-blue-300">المراحل المكتملة</span>
          <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
            {phases.length > 0 ? Math.floor((phases.length / 3) * 100) : 0}%
          </span>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="mt-6 text-xs text-gray-400 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        © {new Date().getFullYear()} CyberPlan
      </div>
    </aside>
  );
}
