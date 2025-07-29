// Notebook.jsx

import React, { useState, useMemo, useEffect } from "react";
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
  ChevronUp,
  Grid3X3,
  List,
  Pin,
  Archive,
  FolderOpen
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getNotes, updateNote, deleteNote, addNote } from "../services/dbService";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SearchInput from "../components/ui/SearchInput";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

function extractAllNotes(appState, planData, lang) {
  const notes = [];
  for (const weekId in appState.notes) {
    const week = appState.notes[weekId];
    if (!week?.days) continue;
    week.days.forEach((dayNotes, dayIdx) => {
      if (!dayNotes) return;
      for (const taskId in dayNotes) {
        const note = dayNotes[taskId];
        const weekObj = planData.find(w => String(w.week) === String(weekId));
        const dayObj = weekObj?.days?.[dayIdx];
        const taskObj = dayObj?.tasks?.find(t => String(t.id) === String(taskId));
        notes.push({
          id: `${weekId}-${dayIdx}-${taskId}`,
          title: note.title || taskObj?.description?.[lang] || "(بدون عنوان)",
          tags: (note.keywords || "").split(",").map(t => t.trim()).filter(Boolean),
          content: note.content,
          weekId,
          dayIdx,
          dayTitle: dayObj?.day?.[lang] || dayObj?.day?.ar || dayObj?.day?.en,
          taskTitle: taskObj?.description?.[lang] || taskObj?.description?.ar || taskObj?.description?.en,
          favorite: note.favorite || false,
          pinned: note.pinned || false,
          category: note.category || "general",
          createdAt: note.createdAt || new Date().toISOString(),
          updatedAt: note.updatedAt || new Date().toISOString()
        });
      }
    });
  }
  return notes;
}

export default function Notebook() {
  const { t, i18n } = useTranslation();
  const { appState, planData, lang, addNotification } = useApp();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("updated"); // updated, created, title, favorite
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNewNote, setShowNewNote] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editContent, setEditContent] = useState("");
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: "",
    category: "general"
  });

  // Tiptap editor for editing
  const editEditor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link,
      Placeholder.configure({
        placeholder: t("notePlaceholder", "اكتب ملاحظاتك هنا...")
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

  // Tiptap editor for new note
  const newNoteEditor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link,
      Placeholder.configure({
        placeholder: t("newNotePlaceholder", "ابدأ كتابة ملاحظاتك...")
      })
    ],
    content: newNote.content,
    editorProps: {
      attributes: {
        class: `min-h-[200px] w-full rounded-lg border p-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent ${i18n.language === "ar" ? "text-right" : "text-left"}`,
        dir: i18n.language === "ar" ? "rtl" : "ltr"
      }
    },
    onUpdate: ({ editor }) => setNewNote(prev => ({ ...prev, content: editor.getHTML() }))
  });

  useEffect(() => {
    loadNotes();
  }, []);

  // Filter and sort notes
  useEffect(() => {
    let filtered = notes;
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(note => 
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.taskTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }
    
    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "updated":
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case "created":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "title":
          return a.title.localeCompare(b.title);
        case "favorite":
          return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
        default:
          return 0;
      }
    });
    
    setFilteredNotes(filtered);
  }, [notes, searchQuery, selectedTag, selectedCategory, sortBy]);

  async function loadNotes() {
    try {
      setLoading(true);
      const extractedNotes = extractAllNotes(appState, planData, lang);
      setNotes(extractedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      addNotification('error', 'خطأ في تحميل الملاحظات', 'فشل في تحميل الملاحظات');
    } finally {
      setLoading(false);
    }
  }

  function openEdit(note) {
    setEditing(note);
    setEditTitle(note.title || "");
    setEditTags(note.tags.join(", ") || "");
    setEditContent(note.content || "");
    setTimeout(() => {
      if (editEditor) editEditor.commands.setContent(note.content || "");
    }, 0);
  }

  async function saveEdit() {
    if (!editing) return;
    
    try {
      const updatedNote = {
        ...editing,
        title: editTitle,
        tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag),
        content: editContent,
        updatedAt: new Date().toISOString()
      };
      
      // Update in app state
      // This would need to be implemented based on your state management
      
      setEditing(null);
      addNotification('success', 'تم حفظ التعديلات', 'تم تحديث الملاحظة بنجاح');
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      addNotification('error', 'خطأ في حفظ التعديلات', 'فشل في تحديث الملاحظة');
    }
  }

  async function handleDelete(id) {
    try {
      // Delete from database
      // This would need to be implemented based on your data service
      
      addNotification('success', 'تم حذف الملاحظة', 'تم حذف الملاحظة بنجاح');
      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      addNotification('error', 'خطأ في حذف الملاحظة', 'فشل في حذف الملاحظة');
    }
  }

  async function handleCreateNote() {
    try {
      const noteData = {
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        category: newNote.category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favorite: false,
        pinned: false
      };
      
      // Add to database
      // This would need to be implemented based on your data service
      
      setShowNewNote(false);
      setNewNote({ title: "", content: "", tags: "", category: "general" });
      if (newNoteEditor) newNoteEditor.commands.setContent("");
      addNotification('success', 'تم إنشاء الملاحظة', 'تم إضافة الملاحظة الجديدة بنجاح');
      loadNotes();
    } catch (error) {
      console.error('Error creating note:', error);
      addNotification('error', 'خطأ في إنشاء الملاحظة', 'فشل في إضافة الملاحظة الجديدة');
    }
  }

  const allTags = useMemo(() => Array.from(new Set(notes.flatMap(n => n.tags))), [notes]);
  const allCategories = useMemo(() => Array.from(new Set(notes.map(n => n.category))), [notes]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("loadingNotes", "جاري تحميل الملاحظات...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-7xl mx-auto py-8 px-4"
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
              {t("notebook", "المذكرة")}
            </h1>
            <p className="text-light-textSecondary dark:text-dark-textSecondary">
              {t("notebookDescription", "نظم ملاحظاتك وأفكارك في مكان واحد")}
            </p>
          </div>
          <Button
            onClick={() => setShowNewNote(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("newNote", "ملاحظة جديدة")}
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchInput
              placeholder={t("searchNotes", "البحث في الملاحظات...")}
              onSearch={setSearchQuery}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
            >
              <option value="all">{t("allCategories", "جميع الفئات")}</option>
              {allCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
            >
              <option value="updated">{t("lastUpdated", "آخر تحديث")}</option>
              <option value="created">{t("dateCreated", "تاريخ الإنشاء")}</option>
              <option value="title">{t("title", "العنوان")}</option>
              <option value="favorite">{t("favorites", "المفضلة")}</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Tags Filter */}
        {(allTags || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedTag === "" ? "primary" : "outline"}
              size="sm"
              onClick={() => setSelectedTag("")}
            >
              {t("allTags", "جميع العلامات")}
            </Button>
            {(allTags || []).map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Button>
            ))}
          </div>
        )}
      </motion.div>

      {/* New Note Form */}
      <AnimatePresence>
        {showNewNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t("newNote", "ملاحظة جديدة")}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewNote(false)}
                >
                  إلغاء
                </Button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t("noteTitle", "عنوان الملاحظة")}
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
                
                <input
                  type="text"
                  placeholder={t("noteTags", "العلامات (مفصولة بفواصل)")}
                  value={newNote.tags}
                  onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
                
                <select
                  value={newNote.category}
                  onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                >
                  <option value="general">{t("general", "عام")}</option>
                  <option value="study">{t("study", "دراسة")}</option>
                  <option value="ideas">{t("ideas", "أفكار")}</option>
                  <option value="resources">{t("resources", "موارد")}</option>
                </select>
                
                <EditorContent editor={newNoteEditor} />
                
                <div className="flex gap-2">
                  <Button onClick={handleCreateNote}>
                    {t("save", "حفظ")}
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewNote(false)}>
                    {t("cancel", "إلغاء")}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Grid */}
      <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-1"}`}>
        {(filteredNotes || []).length === 0 ? (
          <motion.div 
            className="col-span-full text-center py-12"
            variants={itemVariants}
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {searchQuery ? t("noSearchResults", "لا توجد نتائج للبحث") : t("noNotes", "لا توجد ملاحظات")}
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {searchQuery ? t("tryDifferentSearch", "جرب البحث بكلمات مختلفة") : t("startNoteTaking", "ابدأ كتابة أول ملاحظة")}
            </p>
          </motion.div>
        ) : (
          (filteredNotes || []).map((note, index) => (
            <motion.div
              key={note.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <Card className={`relative overflow-hidden ${note.pinned ? 'ring-2 ring-yellow-400' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{note.title}</h3>
                      {note.favorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      {note.pinned && <Pin className="w-4 h-4 text-yellow-500" />}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(note.updatedAt)}
                      </div>
                      {note.category && (
                        <div className="flex items-center gap-1">
                          <FolderOpen className="w-4 h-4" />
                          {note.category}
                        </div>
                      )}
                    </div>
                    
                    {(note.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(note.tags || []).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(note)}
                  >
                    <Edit className="w-4 h-4" />
                    {t("edit", "تعديل")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Share functionality
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                    {t("share", "مشاركة")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("delete", "حذف")}
                  </Button>
                </div>
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
                <h3 className="text-lg font-semibold">{t("editNote", "تعديل الملاحظة")}</h3>
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
                  placeholder={t("noteTitle", "عنوان الملاحظة")}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                />
                
                <input
                  type="text"
                  placeholder={t("noteTags", "العلامات (مفصولة بفواصل)")}
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
