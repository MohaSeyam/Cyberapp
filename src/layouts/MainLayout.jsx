import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import BottomNavigation from "../components/layout/BottomNavigation";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function MainLayout() {
  console.log("MainLayout rendering");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  console.log("MainLayout state:", { sidebarOpen });
  
  return (
    <div className="min-h-screen flex bg-white dark:bg-dark-background relative">
      {/* زر إظهار السايدبار */}
      <button
        className="hidden md:block fixed top-4 right-4 z-50 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border shadow p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        onClick={() => setSidebarOpen(true)}
        aria-label="إظهار القائمة الجانبية"
        style={{display: sidebarOpen ? 'none' : undefined}}
      >
        <Menu className="w-6 h-6" />
      </button>
      {/* خلفية شفافة عند فتح السايدبار */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* السايدبار مع حركة انزلاقية */}
      <div
        className={`hidden md:block fixed top-0 right-0 h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{width: 260}}
      >
        <Sidebar />
        {/* زر إغلاق */}
        <button
          className="absolute top-4 left-4 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border shadow p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition ms-20"
          onClick={() => setSidebarOpen(false)}
          aria-label="إخفاء القائمة الجانبية"
        >
          <Menu className="w-6 h-6 rotate-180" />
        </button>
      </div>
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-4 pb-20 md:pb-4 min-h-screen">
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
}
