import React from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { useState, useEffect } from "react";
import { addNote, updateNote, getNotesByTask } from "../../services/dbService";
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/Dialog";
import { ShieldCheck, Flame, User, Cpu, List, Check, Clock, Edit3, X, Save } from "lucide-react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

// Utility to join class names
function cn(...args) {
  return args.filter(Boolean).join(" ");
}

const typeIcons = {
  "Blue Team": <ShieldCheck className="w-5 h-5 text-blue-500" />,
  "Red Team": <Flame className="w-5 h-5 text-rose-500" />,
  "Soft Skills": <User className="w-5 h-5 text-amber-500" />,
  "Practical": <Cpu className="w-5 h-5 text-emerald-500" />,
  "Default": <List className="w-5 h-5 text-slate-400" />
};

const typeColors = {
  "Blue Team": "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",
  "Red Team": "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20",
  "Soft Skills": "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20",
  "Practical": "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20",
  "Default": "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/20"
};

export default function TaskItem({ task, weekId, dayKey, checked, onToggle }) {
  const { lang } = useApp();
  const { t } = useTranslation();
  
  // Defensive check for lang
  if (!lang) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card shadow">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span>جاري التحميل...</span>
      </div>
    );
  }
  const fallbackT = {
    markComplete: "تم الإنجاز",
    min: "دقيقة",
    editNote: "تحرير ملاحظة المهمة",
    taskNote: "ملاحظة المهمة",
    writeTaskNote: "اكتب ملاحظتك حول هذه المهمة...",
    cancel: "إلغاء",
    save: "حفظ",
    noteTitle: "عنوان الملاحظة",
    enterNoteTitle: "أدخل عنوان الملاحظة"
  };

  const icon = typeIcons[task.type] || typeIcons["Default"];
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteId, setNoteId] = useState(null);
  const [hasNote, setHasNote] = useState(false);

  // Fetch note for this task
  useEffect(() => {
    async function fetchNote() {
      try {
        const found = await getNotesByTask(weekId, dayKey, task.id);
        if (found && found.length > 0) {
          const noteData = found[0]; // Get the first note for this task
          setNote(noteData.content || "");
          setNoteTitle(noteData.title || "");
          setNoteId(noteData.id);
          setHasNote(true);
        } else {
          setNote("");
          setNoteTitle("");
          setNoteId(null);
          setHasNote(false);
        }
      } catch (error) {
        console.error("Error fetching note:", error);
        toast.error("خطأ في تحميل الملاحظة");
      }
    }
    fetchNote();
  }, [task.id, weekId, dayKey]); // Removed noteOpen dependency

  async function handleSaveNote() {
    try {
      if (!noteTitle.trim()) {
        toast.error("يرجى إدخال عنوان للملاحظة");
        return;
      }

      if (!note.trim()) {
        toast.error("يرجى إدخال محتوى الملاحظة");
        return;
      }

      if (noteId) {
        await updateNote(noteId, { 
          content: note, 
          title: noteTitle, 
          weekId, 
          dayKey, 
          taskId: task.id 
        });
        toast.success("تم تحديث الملاحظة بنجاح");
      } else {
        await addNote({ 
          content: note, 
          title: noteTitle, 
          weekId, 
          dayKey, 
          taskId: task.id 
        });
        toast.success("تم إضافة الملاحظة بنجاح");
      }
      setNoteOpen(false);
      setHasNote(true);
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("خطأ في حفظ الملاحظة");
    }
  }

  const taskColor = typeColors[task.type] || typeColors["Default"];
  
  return (
    <motion.div
      className={cn(
        "relative group cursor-pointer",
        "p-4 rounded-xl border-2 transition-all duration-300",
        checked 
          ? "border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20 shadow-lg" 
          : taskColor + " hover:shadow-md hover:scale-[1.02]",
        "hover:border-opacity-80"
      )}
      tabIndex={0}
      role="listitem"
      aria-label={task.description?.[lang] || task.description?.ar || task.description?.en || JSON.stringify(task.description)}
      onClick={onToggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Check Animation */}
      <AnimatePresence>
        {checked && (
          <motion.div
            key="check-anim"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="absolute -top-2 -right-2 z-20"
          >
            <div className="bg-green-500 text-white rounded-full p-1 shadow-lg">
              <Check className="w-4 h-4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <AnimatePresence>
        {checked && (
          <motion.div
            key="progress-bar"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            exit={{ width: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute bottom-0 left-0 h-1 bg-green-400 rounded-b-xl"
          />
        )}
      </AnimatePresence>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-medium mb-2 transition-colors duration-300",
            checked 
              ? "text-green-800 dark:text-green-200 line-through" 
              : "text-gray-800 dark:text-gray-200"
          )}>
            {task.description?.[lang] || task.description?.ar || task.description?.en || JSON.stringify(task.description)}
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              checked 
                ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200" 
                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            )}>
              {t(task.type, task.type)}
            </span>
            
            <span className={cn(
              "inline-flex items-center gap-1 text-xs",
              checked 
                ? "text-green-600 dark:text-green-400" 
                : "text-gray-500 dark:text-gray-400"
            )}>
              <Clock className="w-3 h-3" />
              {task.duration} {t("min", fallbackT.min)}
            </span>
          </div>
        </div>

        {/* Note Button */}
        <motion.button
          className={cn(
            "flex-shrink-0 p-2 rounded-lg transition-all duration-200",
            hasNote 
              ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400" 
              : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900 dark:hover:text-purple-400"
          )}
          title={t("editNote", fallbackT.editNote)}
          onClick={(e) => {
            e.stopPropagation();
            setNoteOpen(true);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Edit3 className="w-4 h-4" />
        </motion.button>
      </div>
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="max-w-lg">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-purple-600" />
            {t("taskNote", fallbackT.taskNote)}
          </DialogTitle>
          
          <div className="space-y-4">
            {/* Task Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t(task.type, task.type)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {task.duration} {t("min", fallbackT.min)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {task.description?.[lang] || task.description?.ar || task.description?.en || JSON.stringify(task.description)}
              </p>
            </div>

            {/* Note Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("noteTitle", fallbackT.noteTitle)} *
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
                placeholder={t("enterNoteTitle", fallbackT.enterNoteTitle)}
                dir={lang === "ar" ? "rtl" : "ltr"}
              />
            </div>

            {/* Note Content */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                محتوى الملاحظة *
              </label>
              <textarea
                className="w-full min-h-[150px] rounded-lg border-2 border-gray-300 dark:border-gray-600 p-4 text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-gray-100 transition-all duration-200"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={t("writeTaskNote", fallbackT.writeTaskNote)}
                dir={lang === "ar" ? "rtl" : "ltr"}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <motion.button 
              className="px-6 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
              onClick={() => setNoteOpen(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <X className="w-4 h-4" />
              {t("cancel", fallbackT.cancel)}
            </motion.button>
            <motion.button 
              className="px-6 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              onClick={handleSaveNote}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-4 h-4" />
              {t("save", fallbackT.save)}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}