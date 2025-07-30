import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Code from "@tiptap/extension-code";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { useApp } from "../../context/AppContext";
import { addJournalEntry, getJournalEntries, updateJournalEntry } from "../../services/dbService";
import { motion } from "framer-motion";
import { Edit3, Save, X, Eye, FileText } from "lucide-react";
import toast from "react-hot-toast";

function TiptapToolbar({ editor, lang }) {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap gap-1 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
      <button 
        onClick={() => editor.chain().focus().toggleBold().run()} 
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive('bold') 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        B
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleItalic().run()} 
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive('italic') 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        I
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleUnderline().run()} 
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive('underline') 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        U
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleStrike().run()} 
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive('strike') 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        S
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
      <button 
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive('heading', { level: 1 }) 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        H1
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive('heading', { level: 2 }) 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        H2
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
      <button 
        onClick={() => editor.chain().focus().toggleBulletList().run()} 
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive('bulletList') 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        •
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleOrderedList().run()} 
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          editor.isActive('orderedList') 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        1.
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
      <button 
        onClick={() => editor.chain().focus().setTextAlign(lang === 'ar' ? 'right' : 'left').run()} 
        className="px-2 py-1 rounded text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {lang === 'ar' ? 'يمين' : 'Left'}
      </button>
      <button 
        onClick={() => editor.chain().focus().setTextAlign('center').run()} 
        className="px-2 py-1 rounded text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        وسط
      </button>
      <button 
        onClick={() => editor.chain().focus().setTextAlign(lang === 'ar' ? 'left' : 'right').run()} 
        className="px-2 py-1 rounded text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {lang === 'ar' ? 'يسار' : 'Right'}
      </button>
    </div>
  );
}

export default function JournalEditor({ onSave, dateKey, initialContent = "" }) {
  const { lang } = useApp();
  const { t, i18n } = useTranslation();
  
  // Defensive check for lang
  if (!lang) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <span className="text-gray-600 dark:text-gray-400">جاري تحميل المدونة...</span>
      </div>
    );
  }

  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [entryId, setEntryId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load journal entry for this dateKey
  useEffect(() => {
    async function fetchJournal() {
      try {
        const entries = await getJournalEntries();
        const found = entries.find(e => e.date === dateKey);
        if (found) {
          setContent(found.content || "");
          setTitle(found.title || "");
          setTags(found.tags || "");
          setEntryId(found.id);
          setIsEditing(false); // Show in view mode
        } else {
          setContent("");
          setTitle("");
          setTags("");
          setEntryId(null);
          setIsEditing(true); // Show in edit mode for new entry
        }
      } catch (error) {
        console.error("Error fetching journal:", error);
        toast.error("خطأ في تحميل المدونة");
      }
    }
    if (dateKey) fetchJournal();
  }, [dateKey]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link,
      Placeholder.configure({
        placeholder: t("journalPlaceholder", "اكتب تدوينك هنا...")
      }),
      Underline,
      Code,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Highlight,
      Color,
      TextStyle,
    ],
    content,
    editorProps: {
      attributes: {
        class: `min-h-[200px] w-full rounded-lg border border-gray-300 dark:border-gray-600 p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${i18n.language === "ar" ? "text-right" : "text-left"}`,
        dir: i18n.language === "ar" ? "rtl" : "ltr"
      }
    },
    onUpdate: ({ editor }) => setContent(editor.getHTML())
  });

  async function handleSave() {
    if (!title.trim()) {
      setError("يجب إدخال عنوان للمدونة");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      if (entryId) {
        await updateJournalEntry(entryId, { content, title, tags });
        toast.success("تم تحديث المدونة بنجاح");
      } else {
        await addJournalEntry({ content, title, tags, date: dateKey });
        toast.success("تم حفظ المدونة بنجاح");
      }
      
      onSave?.({ content, title, tags });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving journal:", error);
      toast.error("خطأ في حفظ المدونة");
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit() {
    setIsEditing(true);
  }

  function handleCancel() {
    // Reset to original content
    if (entryId) {
      setIsEditing(false);
    } else {
      setContent("");
      setTitle("");
      setTags("");
    }
  }

  // View mode - show saved content
  if (!isEditing && (entryId || content.trim())) {
    return (
      <motion.div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {title || "المدونة اليومية"}
            </h3>
          </div>
          <motion.button
            onClick={handleEdit}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit3 className="w-4 h-4" />
            تعديل
          </motion.button>
        </div>

        {tags && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {tags.split(',').map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </motion.div>
    );
  }

  // Edit mode
  return (
    <motion.div 
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {entryId ? "تعديل المدونة" : "مدونة جديدة"}
          </h3>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={handleCancel}
            className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-4 h-4" />
            إلغاء
          </motion.button>
          <motion.button
            onClick={handleSave}
            disabled={isLoading || !title.trim()}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isLoading ? "جاري الحفظ..." : "حفظ"}
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            عنوان المدونة *
          </label>
          <input
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="أدخل عنوان المدونة..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            التاجات (اختياري)
          </label>
          <input
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="تاجات (افصل بينها بفاصلة)..."
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            المحتوى
          </label>
          <TiptapToolbar editor={editor} lang={lang} />
          <EditorContent editor={editor} />
        </div>
      </div>
    </motion.div>
  );
}