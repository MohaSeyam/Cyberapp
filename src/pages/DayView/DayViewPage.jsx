import React, { useState } from "react";
import { useParams } from "react-router-dom";
import TaskItem from "./TaskItem";
import NotesPrompt from "./NotesPrompt";
import TiptapJournalEditor from "./TiptapJournalEditor";
import { useApp } from "../../context/AppContext";
import toast from "react-hot-toast";
import { FaVideo, FaRegFileAlt, FaBook, FaWrench, FaPodcast, FaChalkboardTeacher, FaQuestionCircle, FaProjectDiagram, FaUsers, FaNewspaper, FaLink, FaRegStickyNote, FaEdit } from "react-icons/fa";

// NoteEditor component
function NoteEditor({ note, taskDescription, onSave, onDelete }) {
    const { lang, translations, setModal, ReactQuill, setAppState, appState } = useApp();
    const t = translations[lang];
    const [title, setTitle] = useState(note.title || '');
    const [content, setContent] = useState(note.content || '');
    const [keywords, setKeywords] = useState(note.keywords || '');
    const [tags, setTags] = useState(note.tags || []);
    const [error, setError] = useState("");
    const quillModules = {
      toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline','strike', 'code-block'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        ['link'],
        ['clean']
      ],
    };
    // حفظ الملاحظة فعليًا
    const handleSave = () => {
        if (!title.trim()) { setError("يجب إدخال عنوان للملاحظة"); return; }
        onSave({ title, content, keywords, tags });
        setModal({ isOpen: false, content: null });
    };
    // حذف الملاحظة فعليًا
    const handleDelete = () => {
        onDelete();
        setModal({ isOpen: false, content: null });
    };
    // اختيار التاجات
    const toggleTag = (tag) => {
      setTags(tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]);
    };
    return (
        <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-black dark:text-white">{t.editNote}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.noteOnTask} "{taskDescription}"</p>
            </div>
            <div className="p-6 flex-grow overflow-y-auto space-y-4">
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                <div>
                    <label htmlFor="note-title-editor" className="block text-sm font-medium text-black dark:text-white">{t.noteTitle}</label>
                    <input id="note-title-editor" type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-black dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-black dark:text-white">التاجات</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {NOTE_TAGS.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full border text-xs font-medium transition focus:outline-none
                            ${tags.includes(tag) ? 'bg-blue-600 text-white border-blue-700 shadow' : 'bg-gray-50 text-black dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/40'}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-black dark:text-white">{t.noteContent}</label>
                    <div className="quill-container bg-white dark:bg-[#111] text-black dark:text-white">
                        { ReactQuill ? (
                            <ReactQuill 
                                theme="snow" 
                                value={content} 
                                onChange={setContent}
                                modules={quillModules}
                            />
                          ) : (
                            <textarea
                                className="w-full h-48 p-2 border rounded bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Loading editor..."
                            />
                          )
                        }
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800/50 rounded-b-lg">
                <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md">{t.deleteNote}</button>
                <div className="flex gap-2">
                    <button onClick={() => setModal({isOpen: false, content: null})} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white">{t.cancel}</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">{t.saveNote}</button>
                </div>
            </div>
        </>
    );
}

// ResourcesSection component
function ResourcesSection({ weekId, dayIndex }) {
    const { lang, appState, setAppState, setModal, translations, Icons, plan } = useApp();
    const t = translations[lang];
    // جلب المراجع من الخطة الأصلية (plan)
    let planResources = [];
    if (plan && plan.find) {
      const week = plan.find(w => String(w.week) === String(weekId));
      if (week && week.days && week.days[dayIndex]) {
        planResources = week.days[dayIndex].resources || [];
      }
    }
    // جلب المراجع المضافة من appState
    const userResources = appState.resources[weekId]?.days[dayIndex] || [];
    // دالة لفتح نافذة تعديل أو إضافة مرجع
    const openResourceModal = (resource, index, isPlanResource) => {
        setModal({
            isOpen: true,
            content: <ResourceEditorModal resource={resource} index={isPlanResource ? null : index} weekId={weekId} dayIndex={dayIndex} isPlanResource={isPlanResource} />
        });
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-semibold">{t.suggestedResources}</h4>
                <button onClick={() => openResourceModal(null, null, false)} className="text-sm font-medium text-blue-600 hover:underline">{t.addResource}</button>
            </div>
            <div className="space-y-2">
                {/* مراجع الخطة الأصلية */}
                {planResources.map((res, index) => (
                    <div key={index} className="flex items-center group opacity-80">
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors flex-grow min-w-0">
                            <span className="w-6 h-6 me-3 text-gray-500 dark:text-gray-400">{RESOURCE_TYPES.find(rt => rt.value === res.type)?.icon || <FaLink />}</span>
                            <span className="text-blue-600 dark:text-blue-400 hover:underline truncate">{res.title}</span>
                        </a>
                        <button onClick={() => openResourceModal(res, index, true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ml-2" title="تعديل المرجع">
                          <FaEdit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                ))}
                {/* مراجع المستخدم */}
                {userResources.map((res, index) => (
                    <div key={"user-"+index} className="flex items-center group">
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors flex-grow min-w-0">
                            <span className="w-6 h-6 me-3 text-gray-500 dark:text-gray-400">{RESOURCE_TYPES.find(rt => rt.value === res.type)?.icon || <FaLink />}</span>
                            <span className="text-blue-600 dark:text-blue-400 hover:underline truncate">{res.title}</span>
                        </a>
                        <button onClick={() => openResourceModal(res, index, false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" title="تعديل المرجع">
                            <Icons.edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

const RESOURCE_TYPES = [
  { value: "video", label: "فيديو", icon: <FaVideo className="inline mr-1 text-blue-500" /> },
  { value: "article", label: "مقالة", icon: <FaRegFileAlt className="inline mr-1 text-emerald-500" /> },
  { value: "book", label: "كتاب", icon: <FaBook className="inline mr-1 text-violet-500" /> },
  { value: "tool", label: "أداة", icon: <FaWrench className="inline mr-1 text-orange-500" /> },
  { value: "podcast", label: "بودكاست", icon: <FaPodcast className="inline mr-1 text-pink-500" /> },
  { value: "course", label: "دورة", icon: <FaChalkboardTeacher className="inline mr-1 text-cyan-500" /> },
  { value: "quiz", label: "اختبار", icon: <FaQuestionCircle className="inline mr-1 text-yellow-500" /> },
  { value: "project", label: "مشروع", icon: <FaProjectDiagram className="inline mr-1 text-indigo-500" /> },
  { value: "community", label: "مجتمع", icon: <FaUsers className="inline mr-1 text-green-500" /> },
  { value: "news", label: "خبر", icon: <FaNewspaper className="inline mr-1 text-gray-500" /> },
  { value: "link", label: "رابط آخر", icon: <FaLink className="inline mr-1 text-slate-500" /> },
];

// ResourceEditorModal component (placeholder for actual ResourceEditor UI)
function ResourceEditorModal({ resource, index, weekId, dayIndex, isPlanResource }) {
    const { lang, setAppState, appState, setModal, translations } = useApp();
    const t = translations[lang];
    const [title, setTitle] = useState(resource?.title || '');
    const [url, setUrl] = useState(resource?.url || '');
    const [type, setType] = useState(resource?.type || 'link');
    const [error, setError] = useState("");
    function isValidUrl(str) {
      try { new URL(str); return true; } catch { return false; }
    }
    const handleSave = () => {
        if (!title.trim()) { setError("يجب إدخال عنوان المرجع"); return; }
        if (!isValidUrl(url)) { setError("يجب إدخال رابط صحيح يبدأ بـ https:// أو http://"); return; }
        setAppState(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            const arr = newState.resources[weekId]?.days[dayIndex] || [];
            if (isPlanResource) {
              // إذا كان المرجع من الخطة الأصلية، أضف نسخة معدلة في appState
              arr.push({ title, url, type });
            } else if (index === null || index === undefined) {
                arr.push({ title, url, type });
            } else {
                arr[index] = { title, url, type };
            }
            if (!newState.resources[weekId]) newState.resources[weekId] = { days: [] };
            newState.resources[weekId].days[dayIndex] = arr;
            return newState;
        });
        setModal({ isOpen: false, content: null });
    };
    const handleDelete = () => {
        setAppState(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            const arr = newState.resources[weekId]?.days[dayIndex] || [];
            if (index !== null && index !== undefined) arr.splice(index, 1);
            newState.resources[weekId].days[dayIndex] = arr;
            return newState;
        });
        setModal({ isOpen: false, content: null });
    };
    return (
        <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">{t.editResource}</h3>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <div>
                <label className="block text-sm font-medium mb-1 text-black dark:text-white">{t.resourceTitle}</label>
                <input className="w-full p-2 rounded border text-black dark:text-white bg-white dark:bg-gray-900" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-black dark:text-white">{t.resourceUrl}</label>
                <input className="w-full p-2 rounded border text-black dark:text-white bg-white dark:bg-gray-900" value={url} onChange={e => setUrl(e.target.value)} />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-black dark:text-white">{t.resourceType}</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {RESOURCE_TYPES.map(rt => (
                    <button
                      key={rt.value}
                      type="button"
                      onClick={() => setType(rt.value)}
                      className={`inline-flex items-center gap-1 px-3 py-2 rounded text-sm border transition font-medium focus:outline-none
                        ${type === rt.value
                          ? 'bg-blue-600 text-white border-blue-700 shadow'
                          : 'bg-gray-50 text-black dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/40'}
                      `}
                    >
                      {rt.icon}{rt.label}
                    </button>
                  ))}
                </div>
            </div>
            <div className="flex gap-2 mt-4">
                <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md">{t.deleteResource}</button>
                <button onClick={() => setModal({ isOpen: false, content: null })} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white">{t.cancel}</button>
                <button onClick={handleSave} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">{t.saveResource}</button>
            </div>
        </div>
    );
}

const NOTE_TAGS = [
  "مهم", "مراجعة", "معلومة", "تجربة", "تحذير", "مصطلح", "سؤال", "ملخص", "تطبيق عملي", "ملاحظة شخصية"
];

// DayView main component
export default function DayViewPage(props) {
    const { plan, progress, updateProgress, lang, appState, setAppState, translations, Icons, setModal } = useApp();
    const params = useParams();
    const weekId = props.weekId || params.weekId;
    const dayKey = props.dayKey || params.dayKey;
    if (!plan) return <div className="text-center text-red-500 py-12">الخطة غير محملة (plan not loaded)</div>;
    if (!weekId || !dayKey) return <div className="text-center text-red-500 py-12">weekId أو dayKey مفقود</div>;
    if (!props.day) return <div className="text-center text-red-500 py-12">اليوم غير موجود (day prop مفقود)</div>;
    if (!appState) return <div>appState not loaded</div>;
    if (!Icons) return <div>Icons not loaded</div>;
    if (!translations) return <div>translations not loaded</div>;
    if (!setModal) return <div>setModal not loaded</div>;
    if (!setAppState) return <div>setAppState not loaded</div>;
    const t = translations?.[lang] || {
      activeTasks: "المهام النشطة",
      suggestedResources: "المراجع المقترحة",
      addResource: "إضافة مرجع",
      editNote: "تعديل الملاحظة",
      noteOnTask: "ملاحظة على المهمة",
      noteTitle: "عنوان الملاحظة",
      noteContent: "محتوى الملاحظة",
      deleteNote: "حذف الملاحظة",
      cancel: "إلغاء",
      saveNote: "حفظ الملاحظة",
      editResource: "تعديل المرجع",
      resourceTitle: "عنوان المرجع",
      resourceUrl: "رابط المرجع",
      resourceType: "نوع المرجع",
      deleteResource: "حذف المرجع",
      saveResource: "حفظ المرجع"
    };
    const weekData = plan.find(w => String(w.week) === String(weekId));
    if (!weekData) return <div>Week not found: {weekId}</div>;

    const dayData = weekData.days?.find(d => String(d.key).toLowerCase() === String(dayKey).toLowerCase());
    const dayIndex = weekData.days?.findIndex(d => String(d.key).toLowerCase() === String(dayKey).toLowerCase());
    if (!dayData || dayIndex === -1) return <div>Day not found: {dayKey}</div>;

    // دالة لتغيير حالة المهمة بين مكتملة وغير مكتملة
    const handleTaskToggle = (taskIndex) => {
      const task = dayData.tasks[taskIndex];
      const wasDone = !!(progress || []).find(p => p.weekId == weekId && p.dayKey == dayKey && p.taskId == task.id)?.done;
      updateProgress(weekId, dayKey, task.id, !wasDone);
      if (!wasDone) {
        toast.success("تم إنجاز المهمة!");
        // تحقق إذا كل المهام في الأسبوع أو المرحلة منجزة
        const week = plan.find(w => String(w.week) === String(weekId));
        const allWeekDone = week && week.days.every(day => day.tasks.every(t => (progress || []).find(p => p.taskId === t.id && p.done) || (t.id === task.id)));
        if (allWeekDone) toast.success("مبروك! أنجزت أسبوعًا كاملًا!");
      }
    };
    // دالة لفتح نافذة تعديل الملاحظات
    const openNoteModal = (taskId, taskDescription) => {
        const note = appState.notes[weekId]?.days[dayIndex]?.[taskId] || { title: '', content: '', keywords: '', tags: [] };
        setModal({
            isOpen: true,
            content: <NoteEditor 
                        note={note} 
                        taskDescription={taskDescription}
                        onSave={(newNoteData) => {
                            setAppState(prev => {
                                const newState = JSON.parse(JSON.stringify(prev));
                                if (!newState.notes[weekId]) newState.notes[weekId] = { days: [] };
                                if (!newState.notes[weekId].days[dayIndex]) newState.notes[weekId].days[dayIndex] = {};
                                newState.notes[weekId].days[dayIndex][taskId] = newNoteData;
                                return newState;
                            });
                        }}
                        onDelete={() => {
                            setAppState(prev => {
                                const newState = JSON.parse(JSON.stringify(prev));
                                if (newState.notes[weekId]?.days[dayIndex]?.[taskId]) {
                                    delete newState.notes[weekId].days[dayIndex][taskId];
                                }
                                return newState;
                            });
                        }}
                    />
        });
    };
    return (
        <div className="bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text font-tajawal rounded-xl shadow-lg p-6 border border-light-border dark:border-dark-border animate-fade-in">
            <h1 className="text-3xl font-bold text-light-accent dark:text-dark-accent">{dayData.day[lang]}: {dayData.topic[lang]}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                <div className="lg:col-span-2 space-y-8">
                    {/* قسم المهام */}
                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-light-text dark:text-dark-text">{t.activeTasks}</h4>
                        <div className="space-y-3">
                            {(dayData.tasks || []).map((task, i) => {
                              const isChecked = !!(progress || []).find(p => 
                                p.weekId == weekId && 
                                p.dayKey == dayKey && 
                                p.taskId == task.id
                              )?.done;
                              
                              return (
                                <TaskItem
                                  key={task.id || i}
                                  task={task}
                                  weekId={weekId}
                                  dayKey={dayKey}
                                  checked={isChecked}
                                  onToggle={() => handleTaskToggle(i)}
                                />
                              );
                            })}
                        </div>
                    </div>
                    {/* قسم المراجع */}
                    <ResourcesSection weekId={weekId} dayIndex={dayIndex} />
                </div>
                {/* قسم مهمة التدوين المسائية */}
                {dayData.notes_prompt && dayData.notes_prompt.points.length > 0 && (
                  <div className="lg:col-span-1 flex flex-col gap-4 sticky top-8">
                    <NotesPrompt prompt={dayData.notes_prompt} />
                    <TiptapJournalEditor
                      onSave={content => {
                        setAppState(prev => {
                          const newState = JSON.parse(JSON.stringify(prev));
                          if (!newState.journal) newState.journal = {};
                          if (!newState.journal[weekId]) newState.journal[weekId] = {};
                          newState.journal[weekId][dayKey] = content;
                          return newState;
                        });
                      }}
                      dateKey={`${weekId}-${dayKey}`}
                      initialContent={appState.journal?.[weekId]?.[dayKey] || ""}
                    />
                  </div>
                )}
            </div>
        </div>
    );
}