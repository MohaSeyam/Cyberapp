import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Edit, 
  Trash2, 
  Tag, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Clock,
  Star,
  Heart,
  Share2,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { getJournalEntries, updateJournalEntry, deleteJournalEntry, addJournalEntry } from "../services/dbService";
import { useApp } from "../context/AppContext";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SearchInput from "../components/ui/SearchInput";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Journal() {
  const { t, i18n } = useTranslation();
  const { lang, plan, loading, addNotification } = useApp();
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editContent, setEditContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, favorites, recent
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    tags: "",
    date: new Date().toISOString().split('T')[0]
  });

  // Tiptap editor for editing
  const editEditor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link,
      Placeholder.configure({
        placeholder: t("journalPlaceholder", "اكتب يومياتك هنا...")
      })
    ],
    content: editContent,
    editorProps: {
      attributes: {
        class: `min-h-[200px] w-full rounded-lg border p-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent ${i18n.language === "ar" ? "text-right" : "text-left"}`,
        dir: i18n.language === "ar" ? "rtl" : "ltr"
      }
    },
    onUpdate: ({ editor }) => setEditContent(editor.getHTML())
  });

  // Tiptap editor for new entry
  const newEntryEditor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link,
      Placeholder.configure({
        placeholder: t("newJournalPlaceholder", "ابدأ كتابة يومياتك...")
      })
    ],
    content: newEntry.content,
    editorProps: {
      attributes: {
        class: `min-h-[200px] w-full rounded-lg border p-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent ${i18n.language === "ar" ? "text-right" : "text-left"}`,
        dir: i18n.language === "ar" ? "rtl" : "ltr"
      }
    },
    onUpdate: ({ editor }) => setNewEntry(prev => ({ ...prev, content: editor.getHTML() }))
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  // Filter entries based on search and filter
  useEffect(() => {
    let filtered = entries;
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(entry => 
        entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Type filter
    if (filterType === "favorites") {
      filtered = filtered.filter(entry => entry.favorite);
    } else if (filterType === "recent") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(entry => new Date(entry.date) > oneWeekAgo);
    }
    
    setFilteredEntries(filtered);
  }, [entries, searchQuery, filterType]);

  async function fetchEntries() {
    try {
      setLoading(true);
      const data = await getJournalEntries();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching entries:', error);
      addNotification('error', 'خطأ في تحميل المدونة', 'فشل في تحميل المدونات');
    } finally {
      setLoading(false);
    }
  }

  function openEdit(entry) {
    setEditing(entry);
    setEditTitle(entry.title || "");
    setEditTags(Array.isArray(entry.tags) ? entry.tags.join(", ") : (entry.tags || ""));
    setEditContent(entry.content || "");
    setTimeout(() => {
      if (editEditor) editEditor.commands.setContent(entry.content || "");
    }, 0);
  }

  async function saveEdit() {
    if (!editing) return;
    
    try {
      await updateJournalEntry(editing.id, {
        title: editTitle,
        tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag),
        content: editContent,
      });
      setEditing(null);
      addNotification('success', 'تم حفظ التعديلات', 'تم تحديث المدونة بنجاح');
      fetchEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      addNotification('error', 'خطأ في حفظ التعديلات', 'فشل في تحديث المدونة');
    }
  }

  async function handleDelete(id) {
    try {
      await deleteJournalEntry(id);
      addNotification('success', 'تم حذف المدونة', 'تم حذف المدونة بنجاح');
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      addNotification('error', 'خطأ في حذف المدونة', 'فشل في حذف المدونة');
    }
  }

  async function handleCreateEntry() {
    try {
      await addJournalEntry({
        title: newEntry.title,
        content: newEntry.content,
        tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        date: newEntry.date,
        favorite: false
      });
      setShowNewEntry(false);
      setNewEntry({ title: "", content: "", tags: "", date: new Date().toISOString().split('T')[0] });
      if (newEntryEditor) newEntryEditor.commands.setContent("");
      addNotification('success', 'تم إنشاء المدونة', 'تم إضافة المدونة الجديدة بنجاح');
      fetchEntries();
    } catch (error) {
      console.error('Error creating entry:', error);
      addNotification('error', 'خطأ في إنشاء المدونة', 'فشل في إضافة المدونة الجديدة');
    }
  }

  // Helper to get day title from planData
  function getDayTitle(entry, lang, plan) {
    const day = plan?.find(w => w.week === entry.week)?.days?.find(d => d.key === entry.dayKey);
    return day?.day?.[lang] || day?.day?.ar || day?.day?.en || null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading || !plan || plan.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div 
      className="max-w-6xl mx-auto py-8 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-light-accent dark:text-dark-accent mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8" />
              {t("journalTitle", "المدونة")}
            </h1>
            <p className="text-light-textSecondary dark:text-dark-textSecondary">
              {t("journalDescription", "سجل يومياتك وتأملاتك في رحلة التعلم")}
            </p>
          </div>
          <Button
            onClick={() => setShowNewEntry(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("newEntry", "مدونة جديدة")}
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchInput
              placeholder={t("searchJournal", "البحث في المدونة...")}
              onSearch={setSearchQuery}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              {t("all", "الكل")}
            </Button>
            <Button
              variant={filterType === "favorites" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterType("favorites")}
            >
              <Star className="w-4 h-4" />
            </Button>
            <Button
              variant={filterType === "recent" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterType("recent")}
            >
              <Clock className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* New Entry Form */}
      <AnimatePresence>
        {showNewEntry && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t("newEntry", "مدونة جديدة")}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewEntry(false)}
                >
                  إلغاء
                </Button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t("entryTitle", "عنوان المدونة")}
                  value={newEntry.title}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
                
                <input
                  type="text"
                  placeholder={t("entryTags", "العلامات (مفصولة بفواصل)")}
                  value={newEntry.tags}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
                
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
                
                <EditorContent editor={newEntryEditor} />
                
                <div className="flex gap-2">
                  <Button onClick={handleCreateEntry}>
                    {t("save", "حفظ")}
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewEntry(false)}>
                    {t("cancel", "إلغاء")}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries List */}
      <div className="space-y-6">
        {(filteredEntries || []).length === 0 ? (
          <motion.div 
            className="text-center py-12"
            variants={itemVariants}
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {searchQuery ? t("noSearchResults", "لا توجد نتائج للبحث") : t("noEntries", "لا توجد مدونات")}
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {searchQuery ? t("tryDifferentSearch", "جرب البحث بكلمات مختلفة") : t("startJournaling", "ابدأ كتابة أول مدونة")}
            </p>
          </motion.div>
        ) : (
          (filteredEntries || []).map((entry, index) => (
            <motion.div
              key={entry.id}
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
            >
              <Card className="cursor-pointer" onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{entry.title || t("untitled", "بدون عنوان")}</h3>
                      {entry.favorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(entry.date)}
                      </div>
                      {getDayTitle(entry, lang, plan) && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {getDayTitle(entry, lang, plan)}
                        </div>
                      )}
                    </div>
                    
                    {Array.isArray(entry.tags) && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {entry.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {expanded === entry.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                      >
                        <div 
                          className="prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: entry.content }}
                        />
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {expanded === entry.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expanded === entry.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 mt-4 pt-4 border-t"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(entry);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      {t("edit", "تعديل")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Share functionality
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      {t("share", "مشاركة")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entry.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      {t("delete", "حذف")}
                    </Button>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t("editEntry", "تعديل المدونة")}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(null)}
                >
                  إغلاق
                </Button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t("entryTitle", "عنوان المدونة")}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
                
                <input
                  type="text"
                  placeholder={t("entryTags", "العلامات (مفصولة بفواصل)")}
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
                
                <EditorContent editor={editEditor} />
                
                <div className="flex gap-2">
                  <Button onClick={saveEdit}>
                    {t("save", "حفظ")}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>
                    {t("cancel", "إلغاء")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
