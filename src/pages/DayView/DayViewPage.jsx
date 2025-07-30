import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TaskItem from "./TaskItem";
import NotesPrompt from "./NotesPrompt";
import JournalEditor from "./JournalEditor";
import { useApp } from "../../context/AppContext";
import toast from "react-hot-toast";
import { FaVideo, FaRegFileAlt, FaBook, FaWrench, FaPodcast, FaChalkboardTeacher, FaQuestionCircle, FaProjectDiagram, FaUsers, FaNewspaper, FaLink, FaRegStickyNote, FaEdit } from "react-icons/fa";

// NoteEditor component
function NoteEditor({ note, taskDescription, onSave, onDelete }) {
    const { lang, translations, setModal, setAppState, appState } = useApp();
    
    // Defensive check for lang
    if (!lang) {
        return <div className="text-center text-red-500 py-12">السياق غير محمل (context not loaded)</div>;
    }
    
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
                        <textarea
                            className="w-full h-48 p-2 border rounded bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="اكتب محتوى الملاحظة هنا..."
                        />
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
    const { lang, setModal, translations, Icons, plan } = useApp();
    const [userResources, setUserResources] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Defensive check for lang
    if (!lang) {
        return <div className="text-center text-red-500 py-12">السياق غير محمل (context not loaded)</div>;
    }
    
    const t = translations[lang];
    
    // جلب المراجع من الخطة الأصلية (plan)
    let planResources = [];
    if (plan && plan.find) {
      const week = plan.find(w => String(w.week) === String(weekId));
      if (week && week.days && week.days[dayIndex]) {
        planResources = week.days[dayIndex].resources || [];
      }
    }
    
    // جلب المراجع المضافة من قاعدة البيانات
    useEffect(() => {
        async function fetchResources() {
            try {
                const { getResourcesByDay } = await import("../../services/dbService");
                const resources = await getResourcesByDay(weekId, dayIndex);
                setUserResources(resources);
            } catch (error) {
                console.error("Error fetching resources:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchResources();
    }, [weekId, dayIndex]);
    
    console.log("ResourcesSection - planResources:", planResources);
    console.log("ResourcesSection - userResources:", userResources);
    // دالة لفتح نافذة تعديل أو إضافة مرجع
    const openResourceModal = (resource, index, isPlanResource) => {
        console.log("Opening resource modal:", { resource, index, isPlanResource, weekId, dayIndex });
        setModal({
            isOpen: true,
            content: (
                <ResourceEditorModal 
                    resource={resource} 
                    index={isPlanResource ? null : index} 
                    weekId={weekId} 
                    dayIndex={dayIndex} 
                    isPlanResource={isPlanResource}
                    onSave={() => {
                        // إعادة تحميل المراجع بعد الحفظ
                        fetchResources();
                    }}
                />
            )
        });
    };
    
    // دالة إعادة تحميل المراجع
    const fetchResources = async () => {
        try {
            const { getResourcesByDay } = await import("../../services/dbService");
            const resources = await getResourcesByDay(weekId, dayIndex);
            setUserResources(resources);
        } catch (error) {
            console.error("Error fetching resources:", error);
        }
    };
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    {t.suggestedResources}
                </h4>
                <motion.button 
                    onClick={() => {
                        console.log("Adding new resource for weekId:", weekId, "dayIndex:", dayIndex);
                        openResourceModal(null, null, false);
                    }} 
                    className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {t.addResource}
                </motion.button>
            </div>
            <div className="space-y-3">
                {/* مراجع الخطة الأصلية */}
                {planResources.map((res, index) => (
                    <motion.div 
                        key={index} 
                        className="flex items-center group bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 0.8, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, opacity: 1 }}
                    >
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center flex-grow min-w-0">
                            <span className="w-8 h-8 me-3 text-gray-500 dark:text-gray-400 flex items-center justify-center">
                                {RESOURCE_TYPES.find(rt => rt.value === res.type)?.icon || <FaLink />}
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400 hover:underline truncate font-medium">{res.title}</span>
                        </a>
                        <motion.button 
                            onClick={() => openResourceModal(res, index, true)} 
                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200" 
                            title="تعديل المرجع"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                          <FaEdit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </motion.button>
                    </motion.div>
                ))}
                {/* مراجع المستخدم */}
                {userResources.map((res, index) => (
                    <motion.div 
                        key={"user-"+index} 
                        className="flex items-center group bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (planResources.length + index) * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center flex-grow min-w-0">
                            <span className="w-8 h-8 me-3 text-blue-500 dark:text-blue-400 flex items-center justify-center">
                                {RESOURCE_TYPES.find(rt => rt.value === res.type)?.icon || <FaLink />}
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 hover:underline truncate font-medium">{res.title}</span>
                        </a>
                        <motion.button 
                            onClick={() => openResourceModal(res, index, false)} 
                            className="p-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 opacity-0 group-hover:opacity-100 transition-all duration-200" 
                            title="تعديل المرجع"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Icons.edit className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        </motion.button>
                    </motion.div>
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

// ResourceEditorModal component
function ResourceEditorModal({ resource, index, weekId, dayIndex, isPlanResource, onSave }) {
    const { lang, setAppState, appState, setModal, translations } = useApp();
    
    // Defensive check for lang
    if (!lang) {
        return <div className="text-center text-red-500 py-12">السياق غير محمل (context not loaded)</div>;
    }
    
    const t = translations[lang];
    const [title, setTitle] = useState(resource?.title || '');
    const [url, setUrl] = useState(resource?.url || '');
    const [type, setType] = useState(resource?.type || 'link');
    const [error, setError] = useState("");
    
    function isValidUrl(str) {
      try { 
        new URL(str); 
        return true; 
      } catch { 
        return false; 
      }
    }
    
    const handleSave = async () => {
        if (!title.trim()) { 
            setError("يجب إدخال عنوان المرجع"); 
            return; 
        }
        if (!isValidUrl(url)) { 
            setError("يجب إدخال رابط صحيح يبدأ بـ https:// أو http://"); 
            return; 
        }
        
        try {
            const { addResource, updateResource } = await import("../../services/dbService");
            
            if (resource && resource.id) {
                // تعديل مرجع موجود
                await updateResource(resource.id, { title, url, type, weekId, dayIndex });
                toast.success("تم تحديث المرجع بنجاح");
            } else {
                // إضافة مرجع جديد
                await addResource({ title, url, type, weekId, dayIndex });
                toast.success("تم إضافة المرجع بنجاح");
            }
            
            onSave?.(); // استدعاء onSave لإعادة تحميل المراجع
            setModal({ isOpen: false, content: null });
        } catch (error) {
            console.error("Error saving resource:", error);
            setError("خطأ في حفظ المرجع، يرجى المحاولة مرة أخرى");
        }
    };
    
    const handleDelete = async () => {
        if (!resource || !resource.id) {
            setModal({ isOpen: false, content: null });
            return;
        }
        
        try {
            const { deleteResource } = await import("../../services/dbService");
            await deleteResource(resource.id);
            
            toast.success("تم حذف المرجع بنجاح");
            onSave?.(); // استدعاء onSave لإعادة تحميل المراجع
            setModal({ isOpen: false, content: null });
        } catch (error) {
            console.error("Error deleting resource:", error);
            setError("خطأ في حذف المرجع، يرجى المحاولة مرة أخرى");
        }
    };
    
    return (
        <div className="p-6 space-y-4 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {resource ? t.editResource : t.addResource}
            </h3>
            
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {t.resourceTitle}
                    </label>
                    <input 
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)}
                        placeholder="أدخل عنوان المرجع"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {t.resourceUrl}
                    </label>
                    <input 
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        value={url} 
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://example.com"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {t.resourceType}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {RESOURCE_TYPES.map(rt => (
                            <button
                                key={rt.value}
                                type="button"
                                onClick={() => setType(rt.value)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500
                                    ${type === rt.value
                                        ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600'}
                                `}
                            >
                                {rt.icon}
                                <span>{rt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {resource && index !== null && index !== undefined && (
                    <button 
                        onClick={handleDelete} 
                        className="flex-1 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 transition-colors"
                    >
                        {t.deleteResource}
                    </button>
                )}
                <button 
                    onClick={() => setModal({ isOpen: false, content: null })} 
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                >
                    {t.cancel}
                </button>
                <button 
                    onClick={handleSave} 
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-colors"
                >
                    {t.saveResource}
                </button>
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
    const navigate = useNavigate();
    
    // Defensive checks for context values
    if (!lang) return <div className="text-center text-red-500 py-12">السياق غير محمل (context not loaded)</div>;
    if (!plan) return <div className="text-center text-red-500 py-12">الخطة غير محملة (plan not loaded)</div>;
    if (!weekId || !dayKey) return <div className="text-center text-red-500 py-12">weekId أو dayKey مفقود</div>;
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
    if (!weekData) {
      console.log("DayViewPage - week not found:", weekId);
      console.log("DayViewPage - available weeks:", plan.map(w => w.week));
      return (
        <div className="text-center text-red-500 py-12">
          <h3 className="text-lg font-semibold mb-2">الأسبوع غير موجود</h3>
          <p className="mb-4">الأسبوع المطلوب: {weekId}</p>
          <p className="mb-4">الأسابيع المتاحة: {plan.map(w => w.week).join(", ")}</p>
          <button 
            onClick={() => navigate("/phases")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            العودة إلى المراحل
          </button>
        </div>
      );
    }

    const dayData = weekData.days?.find(d => String(d.key).toLowerCase() === String(dayKey).toLowerCase());
    const dayIndex = weekData.days?.findIndex(d => String(d.key).toLowerCase() === String(dayKey).toLowerCase());
    
    console.log("DayViewPage - searching for day:", dayKey);
    console.log("DayViewPage - weekData.days:", weekData.days);
    console.log("DayViewPage - dayData found:", dayData);
    console.log("DayViewPage - dayIndex:", dayIndex);
    
    if (!dayData || dayIndex === -1) {
      console.log("DayViewPage - day not found:", dayKey);
      console.log("DayViewPage - available days:", weekData.days?.map(d => d.key));
      return (
        <div className="text-center text-red-500 py-12">
          <h3 className="text-lg font-semibold mb-2">اليوم غير موجود</h3>
          <p className="mb-4">اليوم المطلوب: {dayKey}</p>
          <p className="mb-4">الأيام المتاحة: {weekData.days?.map(d => d.key).join(", ")}</p>
          <button 
            onClick={() => navigate(`/week/${weekId}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            العودة إلى الأسبوع
          </button>
        </div>
      );
    }

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
    // منطق اليوم السابق والتالي:
    const prevDay = dayIndex > 0 ? weekData.days[dayIndex - 1] : null;
    const nextDay = dayIndex < weekData.days.length - 1 ? weekData.days[dayIndex + 1] : null;
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header Section */}
                <motion.div 
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mb-6">
                        <motion.button
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                !prevDay 
                                    ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400' 
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 hover:scale-105'
                            }`}
                            onClick={() => prevDay && navigate(`/day/${weekId}/${prevDay.key}`)}
                            disabled={!prevDay}
                            whileHover={prevDay ? { scale: 1.05 } : {}}
                            whileTap={prevDay ? { scale: 0.95 } : {}}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            اليوم السابق
                        </motion.button>
                        
                        <div className="text-center">
                            <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-1">الأسبوع {weekId}</h2>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                {dayIndex + 1} من {weekData.days?.length || 0}
                            </div>
                        </div>
                        
                        <motion.button
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                !nextDay 
                                    ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400' 
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 hover:scale-105'
                            }`}
                            onClick={() => nextDay && navigate(`/day/${weekId}/${nextDay.key}`)}
                            disabled={!nextDay}
                            whileHover={nextDay ? { scale: 1.05 } : {}}
                            whileTap={nextDay ? { scale: 0.95 } : {}}
                        >
                            اليوم التالي
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </motion.button>
                    </div>
                    
                    {/* Day Title */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            {dayData.day?.[lang] || dayData.day?.ar || dayData.day?.en || "اليوم"}
                        </h1>
                        <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">
                            {dayData.topic?.[lang] || dayData.topic?.ar || dayData.topic?.en || "الموضوع"}
                        </p>
                    </div>
                </motion.div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* قسم المهام */}
                    <motion.div 
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                {t.activeTasks}
                            </h4>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {(dayData.tasks || []).length} مهام
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {(dayData.tasks || []).map((task, i) => {
                              const isChecked = !!(progress || []).find(p => 
                                p.weekId == weekId && 
                                p.dayKey == dayKey && 
                                p.taskId == task.id
                              )?.done;
                              
                              return (
                                <motion.div
                                  key={task.id || i}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: i * 0.1 }}
                                >
                                  <TaskItem
                                    task={task}
                                    weekId={weekId}
                                    dayKey={dayKey}
                                    checked={isChecked}
                                    onToggle={() => handleTaskToggle(i)}
                                  />
                                </motion.div>
                              );
                            })}
                        </div>
                    </motion.div>
                    {/* قسم المراجع */}
                    <motion.div 
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <ResourcesSection weekId={weekId} dayIndex={dayIndex} />
                    </motion.div>
                </div>
                {/* قسم مهمة التدوين المسائية */}
                {dayData.notes_prompt && dayData.notes_prompt.points.length > 0 && (
                  <motion.div 
                    className="lg:col-span-1 flex flex-col gap-6 sticky top-8"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                      <NotesPrompt prompt={dayData.notes_prompt} />
                    </div>
                    <JournalEditor
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
                  </motion.div>
                )}
            </div>
        </div>
    );
}