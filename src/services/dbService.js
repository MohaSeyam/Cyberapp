// dbService.js
// العمود الفقري للتطبيق: جميع عمليات Dexie.js (IndexedDB) تتم من هنا فقط
import Dexie from "dexie";

// تعريف قاعدة البيانات والجداول
export const db = new Dexie("cyberPlanDB");
db.version(3).stores({
  plan: "++id, week, phase", // بيانات الخطة (مراحل، أسابيع)
  notes: "++id, weekId, dayKey, taskId, title, tags, createdAt, updatedAt",
  journal: "++id, weekId, dayKey, title, content, tags, createdAt, updatedAt",
  resources: "++id, weekId, dayIndex, title, url, type, createdAt, updatedAt",
  settings: "key, value",
  progress: "++id, weekId, dayKey, taskId, done"
});

// --- دوال CRUD للخطة ---
export async function getPlan() {
  console.log("dbService: getPlan called");
  const plan = await db.plan.toArray();
  console.log("dbService: getPlan result:", plan.length, "items");
  return plan;
}
export async function savePlan(planArr) {
  console.log("dbService: savePlan called with", planArr.length, "items");
  await db.plan.clear();
  const result = await db.plan.bulkAdd(planArr);
  console.log("dbService: savePlan result:", result);
  return result;
}

// --- دوال CRUD للملاحظات ---
export async function getNotes() {
  return await db.notes.orderBy('updatedAt').reverse().toArray();
}
export async function getNotesByDay(weekId, dayKey) {
  return await db.notes.where({ weekId, dayKey }).toArray();
}
export async function getNotesByTask(weekId, dayKey, taskId) {
  return await db.notes.where({ weekId, dayKey, taskId }).toArray();
}
export async function addNote(note) {
  return await db.notes.add({ 
    ...note, 
    createdAt: Date.now(), 
    updatedAt: Date.now() 
  });
}
export async function updateNote(id, updates) {
  return await db.notes.update(id, { 
    ...updates, 
    updatedAt: Date.now() 
  });
}
export async function deleteNote(id) {
  return await db.notes.delete(id);
}

// --- دوال CRUD لليوميات ---
export async function getJournalEntries() {
  return await db.journal.orderBy('updatedAt').reverse().toArray();
}
export async function getJournalByDay(weekId, dayKey) {
  return await db.journal.where({ weekId, dayKey }).first();
}
export async function addJournalEntry(entry) {
  return await db.journal.add({ 
    ...entry, 
    createdAt: Date.now(), 
    updatedAt: Date.now() 
  });
}
export async function updateJournalEntry(id, updates) {
  return await db.journal.update(id, { 
    ...updates, 
    updatedAt: Date.now() 
  });
}
export async function deleteJournalEntry(id) {
  return await db.journal.delete(id);
}

// --- دوال CRUD للمراجع ---
export async function getResources() {
  try {
    return await db.resources.orderBy('updatedAt').reverse().toArray();
  } catch (error) {
    console.error("Error getting resources:", error);
    return [];
  }
}
export async function getResourcesByDay(weekId, dayIndex) {
  try {
    console.log("getResourcesByDay called with:", { weekId, dayIndex });
    const resources = await db.resources.where({ weekId, dayIndex }).toArray();
    console.log("getResourcesByDay result:", resources);
    return resources;
  } catch (error) {
    console.error("Error getting resources by day:", error);
    return [];
  }
}
export async function addResource(resource) {
  try {
    console.log("addResource called with:", resource);
    const result = await db.resources.add({ 
      ...resource, 
      createdAt: Date.now(), 
      updatedAt: Date.now() 
    });
    console.log("addResource result:", result);
    return result;
  } catch (error) {
    console.error("Error adding resource:", error);
    throw error;
  }
}
export async function updateResource(id, updates) {
  try {
    console.log("updateResource called with:", { id, updates });
    const result = await db.resources.update(id, { 
      ...updates, 
      updatedAt: Date.now() 
    });
    console.log("updateResource result:", result);
    return result;
  } catch (error) {
    console.error("Error updating resource:", error);
    throw error;
  }
}
export async function deleteResource(id) {
  try {
    console.log("deleteResource called with:", id);
    const result = await db.resources.delete(id);
    console.log("deleteResource result:", result);
    return result;
  } catch (error) {
    console.error("Error deleting resource:", error);
    throw error;
  }
}

// --- دوال CRUD للتقدم ---
export async function getProgress() {
  return await db.progress.toArray();
}
export async function getTaskProgress(weekId, dayKey, taskId) {
  return await db.progress.where({ weekId, dayKey, taskId }).first();
}
export async function setTaskProgress(weekId, dayKey, taskId, done) {
  const existing = await db.progress.where({ weekId, dayKey, taskId }).first();
  if (existing) {
    await db.progress.update(existing.id, { done });
  } else {
    await db.progress.add({ weekId, dayKey, taskId, done });
  }
}
export async function clearProgress() {
  await db.progress.clear();
}

// --- إعدادات المستخدم ---
export async function getSetting(key) {
  return await db.settings.get(key);
}
export async function setSetting(key, value) {
  return await db.settings.put({ key, value });
}

// --- تصدير واستيراد البيانات (ملكية المستخدم) ---
export async function exportAllData() {
  const plan = await getPlan();
  const notes = await getNotes();
  const journal = await getJournalEntries();
  const resources = await getResources();
  const settings = await db.settings.toArray();
  return { plan, notes, journal, resources, settings };
}
export async function importAllData({ plan, notes, journal, resources, settings }) {
  await db.transaction('rw', db.plan, db.notes, db.journal, db.resources, db.settings, async () => {
    await db.plan.clear();
    await db.notes.clear();
    await db.journal.clear();
    await db.resources.clear();
    await db.settings.clear();
    if (plan) await db.plan.bulkAdd(plan);
    if (notes) await db.notes.bulkAdd(notes);
    if (journal) await db.journal.bulkAdd(journal);
    if (resources) await db.resources.bulkAdd(resources);
    if (settings) await db.settings.bulkAdd(settings);
  });
}

// Clear all data function
export async function clearAllData() {
  await db.transaction('rw', db.plan, db.notes, db.journal, db.resources, db.settings, db.progress, async () => {
    await db.plan.clear();
    await db.notes.clear();
    await db.journal.clear();
    await db.resources.clear();
    await db.settings.clear();
    await db.progress.clear();
  });
}

// --- دوال متقدمة للملاحظات ---
export async function getNotesByWeek(weekId) {
  return await db.notes.where({ weekId }).toArray();
}
export async function addOrUpdateNote(note) {
  // إذا كان هناك id استخدم update، وإلا أضف جديد
  if (note.id) {
    return await updateNote(note.id, note);
  } else {
    return await addNote(note);
  }
}

// --- دوال متقدمة للمدونة اليومية ---
export async function addOrUpdateJournalEntry(entry) {
  // إذا كان هناك id استخدم update، وإلا أضف جديد
  if (entry.id) {
    return await updateJournalEntry(entry.id, entry);
  } else {
    return await addJournalEntry(entry);
  }
}

// --- دوال متقدمة للمراجع ---
export async function addOrUpdateResource(resource) {
  // إذا كان هناك id استخدم update، وإلا أضف جديد
  if (resource.id) {
    return await updateResource(resource.id, resource);
  } else {
    return await addResource(resource);
  }
}
