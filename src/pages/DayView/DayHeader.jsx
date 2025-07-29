import React from "react";
import { useApp } from "../../context/AppContext";
import { useTranslation } from "react-i18next";

export default function DayHeader({ day, weekId, phaseId }) {
  const { lang: contextLang } = useApp();
  const lang = contextLang || "ar";
  const { t } = useTranslation();
  if (!day) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-block rounded-full px-3 py-1 bg-blue-100 dark:bg-sky-900 text-blue-700 dark:text-sky-300 font-bold text-xs shadow">{t("phase", "المرحلة")} #{phaseId}</span>
        <span className="inline-block rounded-full px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow">{t("week", "الأسبوع")} #{weekId}</span>
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700 dark:text-sky-400 mb-1">
        {day.day?.[lang] || day.day?.ar || day.day?.en}
      </h1>
      <p className="text-base text-slate-700 dark:text-slate-200 opacity-90 font-medium">
        {day.topic?.[lang] || day.topic?.ar || day.topic?.en}
      </p>
    </div>
  );
}