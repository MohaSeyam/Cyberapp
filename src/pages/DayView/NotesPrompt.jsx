import React from "react";
import { useApp } from "../../context/AppContext";

export default function NotesPrompt({ prompt }) {
  const { lang } = useApp();
  
  // Defensive check for lang
  if (!lang) {
    return (
      <div className="rounded-2xl bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 shadow p-4 mb-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <span>جاري تحميل التلميحات...</span>
      </div>
    );
  }
  
  if (!prompt) return null;
  return (
    <div className="rounded-2xl bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 shadow p-4 mb-4">
      <div className="font-bold text-lg text-violet-700 dark:text-violet-400 mb-2">{prompt.title?.[lang] || prompt.title?.ar || prompt.title?.en}</div>
      <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-100">
        {(prompt.points || []).map((pt, i) => (
          <li key={i}>{pt[lang] || pt.ar || pt.en}</li>
        ))}
      </ul>
    </div>
  );
}