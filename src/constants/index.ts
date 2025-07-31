// Application constants

export const RESOURCE_TYPES = [
  { value: "video", label: "فيديو", icon: "🎥" },
  { value: "article", label: "مقالة", icon: "📄" },
  { value: "book", label: "كتاب", icon: "📚" },
  { value: "tool", label: "أداة", icon: "🔧" },
  { value: "podcast", label: "بودكاست", icon: "🎧" },
  { value: "course", label: "دورة", icon: "🎓" },
  { value: "quiz", label: "اختبار", icon: "❓" },
  { value: "project", label: "مشروع", icon: "🚀" },
  { value: "community", label: "مجتمع", icon: "👥" },
  { value: "news", label: "خبر", icon: "📰" },
  { value: "link", label: "رابط آخر", icon: "🔗" },
] as const;

export const NOTE_TAGS = [
  "مهم", "مراجعة", "معلومة", "تجربة", "تحذير", "مصطلح", 
  "سؤال", "ملخص", "تطبيق عملي", "ملاحظة شخصية", "أمان", 
  "اختراق", "دفاع", "هجوم", "شبكات", "برمجة", "أدوات", 
  "تقنيات", "أفضل الممارسات", "نصائح"
] as const;

export const TASK_TYPES = {
  "Blue Team": { color: "blue", icon: "🛡️" },
  "Red Team": { color: "red", icon: "🔥" },
  "Soft Skills": { color: "yellow", icon: "💡" },
  "Practical": { color: "green", icon: "⚡" },
} as const;

export const DEFAULT_SETTINGS = {
  notifications: true,
  sound: true,
  autoSave: true,
  theme: "light" as const,
  fontSize: "medium" as const,
  compactMode: false,
};

export const STORAGE_KEYS = {
  LANGUAGE: 'app_language',
  SETTINGS: 'app_settings',
  THEME: 'app_theme',
} as const;

export const API_ENDPOINTS = {
  PLAN_DATA: '/PlanData.json',
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;