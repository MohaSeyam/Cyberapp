import React from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { useState, useEffect } from "react";
import { addNote, updateNote, getNotes } from "../../services/dbService";
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/Dialog";
import { ShieldCheck, Flame, User, Cpu, List } from "lucide-react";

// Utility to join class names
function cn(...args) {
  return args.filter(Boolean).join(" ");
}

const typeIcons = {
  "Blue Team": <ShieldCheck className="w-6 h-6 text-blue-500" />,
  "Red Team": <Flame className="w-6 h-6 text-rose-500" />,
  "Soft Skills": <User className="w-6 h-6 text-amber-500" />,
  "Practical": <Cpu className="w-6 h-6 text-emerald-500" />,
  "Default": <List className="w-6 h-6 text-slate-400" />
};

export default function TaskItem({ task, weekId, dayKey, checked, onToggle }) {
  const { lang } = useApp();
  const { t } = useTranslation();
  const fallbackT = {
    markComplete: "تم الإنجاز",
    min: "دقيقة",
    editNote: "تحرير ملاحظة المهمة",
    taskNote: "ملاحظة المهمة",
    writeTaskNote: "اكتب ملاحظتك حول هذه المهمة...",
    cancel: "إلغاء",
    save: "حفظ"
  };
  console.log('TaskItem props:', task);
  const icon = typeIcons[task.type] || typeIcons["Default"];
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [noteId, setNoteId] = useState(null);
  const [hasNote, setHasNote] = useState(false);

  // Fetch note for this task
  useEffect(() => {
    async function fetchNote() {
      const notes = await getNotes();
      const found = notes.find(n => n.taskId === task.id && n.weekId === weekId && n.dayKey === dayKey);
      if (found) {
        setNote(found.content || "");
        setNoteId(found.id);
        setHasNote(true);
      } else {
        setNote("");
        setNoteId(null);
        setHasNote(false);
      }
    }
    fetchNote();
  }, [task.id, weekId, dayKey, noteOpen]);

  async function handleSaveNote() {
    if (noteId) {
      await updateNote(noteId, { content: note });
    } else {
      await addNote({ content: note, taskId: task.id, weekId, dayKey });
    }
    setNoteOpen(false);
    setHasNote(!!note);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card shadow hover:shadow-lg transition group"
      )}
      tabIndex={0}
      role="listitem"
      aria-label={task.description?.[lang] || task.description?.ar || task.description?.en || JSON.stringify(task.description)}
    >
      <span className="text-xl">{icon}</span>
      <input
        type="checkbox"
        className="accent-blue-500 w-5 h-5"
        aria-label={t("markComplete", fallbackT.markComplete)}
        checked={checked}
        onChange={onToggle}
      />
      <div className="flex-1">
        <div className="font-semibold text-slate-800 dark:text-slate-100 mb-0.5">
          {task.description?.[lang] || task.description?.ar || task.description?.en || JSON.stringify(task.description)}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 flex gap-2 items-center">
          <span className="rounded px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-slate-200">{t(task.type, task.type)}</span>
          <span className="ml-2">⏱ {task.duration} {t("min", fallbackT.min)}</span>
          <span className="ml-2">id: {task.id}</span>
        </div>
      </div>
      <button
        className={cn("ml-2 p-1 rounded hover:bg-violet-100 dark:hover:bg-violet-900 transition", hasNote ? "text-violet-600" : "text-slate-400")}
        title={t("editNote", fallbackT.editNote)}
        onClick={() => setNoteOpen(true)}
      >
        {hasNote ? "📝" : "📄"}
      </button>
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogTitle>{t("taskNote", fallbackT.taskNote)}</DialogTitle>
          <textarea
            className="w-full min-h-[100px] rounded border p-2 mt-2"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={t("writeTaskNote", fallbackT.writeTaskNote)}
            dir={lang === "ar" ? "rtl" : "ltr"}
          />
          <div className="flex justify-end gap-2 mt-3">
            <button className="px-4 py-1 rounded bg-slate-200 dark:bg-zinc-700" onClick={() => setNoteOpen(false)}>{t("cancel", fallbackT.cancel)}</button>
            <button className="px-4 py-1 rounded bg-violet-600 text-white" onClick={handleSaveNote}>{t("save", fallbackT.save)}</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}