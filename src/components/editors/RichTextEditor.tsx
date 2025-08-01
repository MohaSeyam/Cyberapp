// Unified Rich Text Editor Component
import React, { useEffect } from 'react';
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Highlight from "@tiptap/extension-highlight";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { ListItem } from "@tiptap/extension-list-item";
import Blockquote from "@tiptap/extension-blockquote";
import { motion } from "framer-motion";
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Code as CodeIcon, Highlighter, Quote
} from "lucide-react";
import type { Language } from "../../types";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  lang?: Language;
  className?: string;
  showToolbar?: boolean;
  minHeight?: string;
}

// Toolbar Component
function EditorToolbar({ editor, lang = 'ar' }: { editor: any; lang?: Language }) {
  if (!editor) return null;
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 mb-3">
      <div className="flex flex-wrap gap-1 items-center">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
          <button 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('bold') 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="عريض"
          >
            <Bold size={14} />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('italic') 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="مائل"
          >
            <Italic size={14} />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('underline') 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="تحت خط"
          >
            <UnderlineIcon size={14} />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleStrike().run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('strike') 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="خط في الوسط"
          >
            <Strikethrough size={14} />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
          <button 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('heading', { level: 1 }) 
                ? 'bg-green-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="عنوان رئيسي 1"
          >
            <Heading1 size={14} />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('heading', { level: 2 }) 
                ? 'bg-green-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="عنوان فرعي 2"
          >
            <Heading2 size={14} />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
          <button 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('bulletList') 
                ? 'bg-purple-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="قائمة نقطية"
          >
            <List size={14} />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleOrderedList().run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('orderedList') 
                ? 'bg-purple-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="قائمة مرقمة"
          >
            <ListOrdered size={14} />
          </button>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
          <button 
            onClick={() => editor.chain().focus().setTextAlign(lang === 'ar' ? 'right' : 'left').run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive({ textAlign: lang === 'ar' ? 'right' : 'left' }) 
                ? 'bg-orange-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title={lang === 'ar' ? 'محاذاة لليمين' : 'Align Left'}
          >
            <AlignLeft size={14} />
          </button>
          <button 
            onClick={() => editor.chain().focus().setTextAlign('center').run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive({ textAlign: 'center' }) 
                ? 'bg-orange-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="محاذاة للوسط"
          >
            <AlignCenter size={14} />
          </button>
          <button 
            onClick={() => editor.chain().focus().setTextAlign(lang === 'ar' ? 'left' : 'right').run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive({ textAlign: lang === 'ar' ? 'left' : 'right' }) 
                ? 'bg-orange-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title={lang === 'ar' ? 'محاذاة لليسار' : 'Align Right'}
          >
            <AlignRight size={14} />
          </button>
        </div>

        {/* Code */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
          <button 
            onClick={() => editor.chain().focus().toggleCode().run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('code') 
                ? 'bg-red-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="كود"
          >
            <CodeIcon size={14} />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('codeBlock') 
                ? 'bg-red-600 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="كود بلوك"
          >
            <CodeIcon size={14} />
          </button>
        </div>

        {/* Highlight */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
          <button 
            onClick={() => editor.chain().focus().toggleHighlight().run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('highlight') 
                ? 'bg-yellow-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="تمييز"
          >
            <Highlighter size={14} />
          </button>
        </div>

        {/* Quote */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
          <button 
            onClick={() => editor.chain().focus().toggleBlockquote().run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('blockquote') 
                ? 'bg-indigo-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="اقتباس"
          >
            <Quote size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "اكتب هنا...",
  lang = 'ar',
  className = "",
  showToolbar = true,
  minHeight = "150px"
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // تم إزالة تعطيل القوائم لضمان عمل النقاط والأرقام
        codeBlock: false,
        blockquote: false, // تعطيل الاقتباس من StarterKit لاستخدام إعدادات مخصصة
      }),
      TextAlign.configure({ 
        types: ["heading", "paragraph", "blockquote"],
        alignments: ['left', 'center', 'right']
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800'
        }
      }),
      Placeholder.configure({ 
        placeholder,
        emptyEditorClass: 'is-editor-empty'
      }),
      Underline,
      Code.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono'
        }
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto'
        }
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc pl-6 space-y-1'
        }
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal pl-6 space-y-1'
        }
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'marker:text-gray-600 dark:marker:text-gray-400'
        }
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 bg-gray-50 dark:bg-gray-700 italic'
        }
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-200 dark:bg-yellow-800 px-1 rounded'
        }
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: `min-h-[${minHeight}] w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200 ${lang === "ar" ? "text-right" : "text-left"} ${className}`,
        dir: lang === "ar" ? "rtl" : "ltr",
        spellcheck: 'true'
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onCreate: ({ editor }) => {
      // إضافة دعم اختصارات لوحة المفاتيح
      editor.commands.setContent(content);
    }
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="w-full">
      {showToolbar && <EditorToolbar editor={editor} lang={lang} />}
      <EditorContent editor={editor} />
    </div>
  );
}