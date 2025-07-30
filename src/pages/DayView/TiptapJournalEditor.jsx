import React from "react";
import { useState, useEffect } from "react";
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

function TiptapToolbar({ editor, lang }) {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap gap-1 mb-2 border-b pb-1">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'font-bold text-violet-700' : ''}>B</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'italic text-violet-700' : ''}>I</button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'underline text-violet-700' : ''}>U</button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'line-through text-violet-700' : ''}>S</button>
      <button onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'bg-slate-200 text-violet-700' : ''}>{'<>'}</button>
      <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive('highlight') ? 'bg-yellow-200 text-violet-700' : ''}>HL</button>
      <button onClick={() => editor.chain().focus().setColor('#e11d48').run()} style={{ color: '#e11d48' }}>A</button>
      <button onClick={() => editor.chain().focus().setColor('#2563eb').run()} style={{ color: '#2563eb' }}>A</button>
      <button onClick={() => editor.chain().focus().setColor('#059669').run()} style={{ color: '#059669' }}>A</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'font-bold text-lg text-violet-700' : ''}>H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'font-bold text-violet-700' : ''}>H2</button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'text-violet-700' : ''}>•</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'text-violet-700' : ''}>1.</button>
      <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Tbl</button>
      <button onClick={() => editor.chain().focus().setTextAlign(lang === 'ar' ? 'right' : 'left').run()}>{lang === 'ar' ? 'يمين' : 'Left'}</button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()}>وسط</button>
      <button onClick={() => editor.chain().focus().setTextAlign(lang === 'ar' ? 'left' : 'right').run()}>{lang === 'ar' ? 'يسار' : 'Right'}</button>
      <button onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className="text-gray-400">مسح</button>
    </div>
  );
}

export default function TiptapJournalEditor({ onSave, dateKey, initialContent = "", initialTitle = "", initialTags = "" }) {
  const { lang } = useApp();
  const { t, i18n } = useTranslation();
  
  // Defensive check for lang
  if (!lang) {
    return (
      <div className="rounded-2xl bg-white/80 dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 shadow p-4 flex flex-col">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <span>جاري تحميل المحرر...</span>
      </div>
    );
  }
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [tags, setTags] = useState(initialTags);
  const [error, setError] = useState("");
  const [entryId, setEntryId] = useState(null);
  // Load journal entry for this dateKey (e.g., weekId-dayKey)
  useEffect(() => {
    async function fetchJournal() {
      const entries = await getJournalEntries();
      const found = entries.find(e => e.date === dateKey);
      if (found) {
        setContent(found.content || "");
        setTitle(found.title || "");
        setTags(found.tags || "");
        setEntryId(found.id);
      } else {
        setContent("");
        setTitle("");
        setTags("");
        setEntryId(null);
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
        class: `min-h-[100px] w-full rounded border p-2 bg-white/80 dark:bg-zinc-900 text-gray-800 dark:text-gray-100 focus:outline-none ${i18n.language === "ar" ? "text-right" : "text-left"}`,
        dir: i18n.language === "ar" ? "rtl" : "ltr"
      }
    },
    onUpdate: ({ editor }) => setContent(editor.getHTML())
  });
  async function handleSave() {
    if (!title.trim() || !tags.trim()) {
      setError("يجب إدخال عنوان وتاجات");
      return;
    }
    setError("");
    if (entryId) {
      await updateJournalEntry(entryId, { content, title, tags });
    } else {
      await addJournalEntry({ content, title, tags, date: dateKey });
    }
    onSave?.({ content, title, tags });
  }
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 shadow p-4 flex flex-col">
      <span className="font-bold text-lg text-violet-700 dark:text-violet-400 mb-2">{t("eveningJournal", "التدوين المسائي")}</span>
      <input
        className="mb-2 p-2 rounded border"
        placeholder="العنوان..."
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <input
        className="mb-2 p-2 rounded border"
        placeholder="تاجات (افصل بينها بفاصلة)..."
        value={tags}
        onChange={e => setTags(e.target.value)}
      />
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <TiptapToolbar editor={editor} lang={lang} />
      <EditorContent editor={editor} />
      <button
        className="mt-3 px-4 py-1 rounded-full bg-violet-600 text-white font-semibold hover:bg-violet-700 transition self-end"
        onClick={handleSave}
        disabled={!editor || editor.isEmpty}
      >{t("save", "حفظ")}</button>
    </div>
  );
}