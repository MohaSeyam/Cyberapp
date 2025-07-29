// useCyberPlan.js
// الخطاف الرئيسي لجلب وإدارة بيانات الخطة والتقدم وحفظها
import { useEffect, useState, useCallback } from "react";
import * as db from "../services/dbService";

async function importPlanDataIfEmpty() {
  console.log("importPlanDataIfEmpty called");
  const plan = await db.getPlan();
  console.log("Current plan from DB:", plan);
  if (!plan || plan.length === 0) {
    console.log("Plan is empty, importing from PlanData.json");
    // استورد البيانات من PlanData.json
    try {
      const res = await fetch("/PlanData.json");
      console.log("Fetch response:", res);
      if (res.ok) {
        const data = await res.json();
        console.log("PlanData.json loaded:", data.length, "items");
        if (Array.isArray(data) && data.length > 0) {
          await db.savePlan(data);
          console.log("Plan data saved to DB");
        }
      } else {
        console.error("Failed to fetch PlanData.json:", res.status, res.statusText);
      }
    } catch (error) {
      console.error("Error importing plan data:", error);
    }
  } else {
    console.log("Plan already exists in DB");
  }
}

export function useCyberPlan() {
  console.log("useCyberPlan hook called");
  const [plan, setPlan] = useState([]);
  const [notes, setNotes] = useState([]);
  const [journal, setJournal] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("useCyberPlan state:", { plan, progress, loading });

  // جلب كل البيانات من القاعدة
  const fetchAll = useCallback(async () => {
    console.log("useCyberPlan fetchAll called");
    setLoading(true);
    try {
      await importPlanDataIfEmpty();
      const [planData, notesData, journalData, progressData] = await Promise.all([
        db.getPlan(),
        db.getNotes(),
        db.getJournalEntries(),
        db.getProgress()
      ]);
      console.log("useCyberPlan data fetched:", { planData, progressData });
      // تهيئة كل مهمة بـ done: false إذا لم تكن موجودة (للتوافق فقط)
      const normalizedPlan = planData.map(week => ({
        ...week,
        days: (week.days || []).map(day => ({
          ...day,
          tasks: (day.tasks || []).map(task => {
            const t = { ...task, done: typeof task.done === 'boolean' ? task.done : false };
            if (typeof task.done !== 'boolean') console.log('Initialized done for task:', t);
            return t;
          })
        }))
      }));
      setPlan(normalizedPlan);
      setProgress(progressData);
      console.log('fetchAll: setPlan', normalizedPlan);
      setNotes(notesData);
      setJournal(journalData);
    } catch (error) {
      console.error("useCyberPlan fetchAll error:", error);
    } finally {
      setLoading(false);
      console.log("useCyberPlan loading set to false");
    }
  }, []);

  useEffect(() => {
    console.log("useCyberPlan useEffect running");
    fetchAll();
  }, [fetchAll]);

  // تحديث الخطة
  const savePlan = async (planArr) => {
    console.log('savePlan: planArr before save', planArr);
    await db.savePlan(planArr);
    const newPlan = await db.getPlan();
    console.log('savePlan: plan after save', newPlan);
    setPlan(newPlan);
  };

  // تحديث حالة مهمة واحدة في progress
  const setTaskProgress = async (weekId, dayKey, taskId, done) => {
    await db.setTaskProgress(weekId, dayKey, taskId, done);
    setProgress(await db.getProgress());
  };

  // إدارة الملاحظات
  const addNote = async (note) => {
    await db.addNote(note);
    setNotes(await db.getNotes());
  };
  const updateNote = async (id, updates) => {
    await db.updateNote(id, updates);
    setNotes(await db.getNotes());
  };
  const deleteNote = async (id) => {
    await db.deleteNote(id);
    setNotes(await db.getNotes());
  };

  // إدارة اليوميات
  const addJournalEntry = async (entry) => {
    await db.addJournalEntry(entry);
    setJournal(await db.getJournalEntries());
  };
  const updateJournalEntry = async (id, updates) => {
    await db.updateJournalEntry(id, updates);
    setJournal(await db.getJournalEntries());
  };
  const deleteJournalEntry = async (id) => {
    await db.deleteJournalEntry(id);
    setJournal(await db.getJournalEntries());
  };

  return {
    plan, notes, journal, loading, progress,
    savePlan,
    setTaskProgress,
    addNote, updateNote, deleteNote,
    addJournalEntry, updateJournalEntry, deleteJournalEntry,
    refresh: fetchAll
  };
}
