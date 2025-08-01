/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  safelist: [
    // ألوان الخلفية والنصوص المستخدمة في البطاقات والإحصائيات
    "bg-cyan-500", "bg-violet-500", "bg-amber-500", "bg-emerald-500",
    "bg-cyan-100", "bg-violet-100", "bg-amber-100",
    "text-cyan-600", "text-violet-600", "text-amber-600", "text-emerald-700",
    "text-cyan-700", "text-violet-700", "text-amber-700", "text-gray-700", "text-gray-200", "text-gray-500", "text-gray-800", "text-gray-100",
    "bg-white", "dark:bg-zinc-900", "dark:bg-zinc-800", "dark:bg-gray-700",
    // صناديق وبطاقات
    "rounded-lg", "rounded-xl", "rounded-full", "border", "shadow", "shadow-lg",
    // تخطيط
    "grid", "grid-cols-2", "md:grid-cols-3", "md:grid-cols-2", "gap-4", "mb-2", "mb-4", "mb-6", "mb-8", "p-4", "p-3", "px-2", "px-3", "px-4", "py-1", "py-2", "py-0.5", "mt-1", "mt-2", "mt-4", "mx-auto", "max-w-4xl", "max-w-5xl", "min-h-screen",
    // نصوص
    "text-xs", "text-sm", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl", "font-bold", "font-semibold", "font-medium", "italic", "line-through",
    // أزرار
    "hover:underline", "hover:bg-cyan-100", "hover:bg-cyan-900", "hover:bg-emerald-700", "hover:bg-violet-700", "hover:bg-amber-700", "hover:bg-gray-700",
    // داكن
    "dark:text-gray-200", "dark:text-gray-300", "dark:text-gray-100", "dark:text-cyan-300",
    // أخرى
    "ring-2", "ring-cyan-400", "ring-violet-400", "ring-amber-400", "border-e", "border-b", "text-center", "text-right", "text-left", "flex", "items-center", "justify-between", "justify-center", "flex-col", "flex-1", "cursor-pointer", "transition", "hidden", "block", "w-full", "min-h-[60vh]", "min-h-[100px]", "prose", "prose-sm", "max-w-none"
  ],
  theme: {
    extend: {
      fontFamily: {
        tajawal: ["Tajawal", "sans-serif"],
      },
      colors: {
        // Light mode
        light: {
          background: '#F8FAFC', // خلفية فاتحة أكثر
          card: '#FFFFFF', // بطاقات بيضاء نقية
          text: '#1E293B', // نص داكن
          textSecondary: '#64748B', // رمادي للنصوص الثانوية
          border: '#E2E8F0', // حدود رمادية فاتحة
          accent: '#FFD700', // ذهبي أساسي
          danger: '#EF4444',
          success: '#10B981',
          info: '#3B82F6',
          warning: '#F59E0B',
          soft: '#FEF3C7',
          policy: '#8B5CF6',
          blue: '#1E40AF',
        },
        // Dark mode
        dark: {
          background: '#000000', // خلفية سوداء نقية
          card: '#111111', // بطاقات سوداء داكنة جداً
          text: '#FFFFFF', // نص أبيض نقي
          textSecondary: '#CCCCCC', // رمادي فاتح جداً
          border: '#222222', // حدود سوداء داكنة
          accent: '#FFD700', // ذهبي أساسي
          danger: '#FF4444',
          success: '#00D4AA',
          info: '#3B82F6',
          warning: '#F59E0B',
          soft: '#111111',
          policy: '#8B5CF6',
          blue: '#1E40AF',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}