// Unified Rich Text Editor Component
import React, { useEffect, useState } from 'react';
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
import Image from "@tiptap/extension-image";
import { motion } from "framer-motion";
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Code as CodeIcon, Highlighter, Quote, Link as LinkIcon, Save, CheckCircle, AlertCircle, Image as ImageIcon, Upload
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
  autoSave?: boolean;
  onSave?: () => void;
  saveStatus?: 'saving' | 'saved' | 'error';
}

// Toolbar Component
function EditorToolbar({ editor, lang = 'ar', saveStatus }: { editor: any; lang?: Language; saveStatus?: 'saving' | 'saved' | 'error' }) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  
  if (!editor) return null;
  
  const addLink = () => {
    if (linkUrl.trim()) {
      // إذا كان هناك نص محدد، أضف الرابط له
      if (editor.isActive('link')) {
        editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run();
      } else {
        // إذا لم يكن هناك نص محدد، أضف الرابط للنص الحالي
        editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
      }
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const setLink = () => {
    const url = window.prompt('أدخل الرابط:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  // Save Status Component
  const SaveStatus = ({ status }: { status?: 'saving' | 'saved' | 'error' }) => {
    if (!status) return null;
    
    return (
      <div className="flex items-center space-x-2 text-xs">
        {status === 'saving' && (
          <>
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-blue-600">جارٍ الحفظ...</span>
          </>
        )}
        {status === 'saved' && (
          <>
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span className="text-green-600">تم الحفظ</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-3 h-3 text-red-600" />
            <span className="text-red-600">خطأ في الحفظ</span>
          </>
        )}
      </div>
    );
  };

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

        {/* Link Controls */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
          <button 
            onClick={() => setShowLinkInput(!showLinkInput)} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('link') 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="إضافة رابط"
          >
            <LinkIcon size={14} />
          </button>
          {editor.isActive('link') && (
            <button 
              onClick={removeLink} 
              className="p-1.5 rounded text-xs transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
              title="إزالة الرابط"
            >
              <Strikethrough size={14} />
            </button>
          )}
        </div>

        {/* Link Input */}
        {showLinkInput && (
          <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="أدخل الرابط هنا..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addLink();
                  }
                }}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={addLink}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                إضافة
              </button>
              <button
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl('');
                }}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

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

        {/* Image */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
          <button 
            onClick={() => {
              const url = window.prompt('أدخل رابط الصورة:');
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }} 
            className="p-1.5 rounded text-xs transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="إدراج صورة"
          >
            <ImageIcon size={14} />
          </button>
        </div>

        {/* File Upload */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
          <button 
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*,.pdf,.doc,.docx,.txt';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const result = e.target?.result as string;
                      editor.chain().focus().setImage({ src: result }).run();
                    };
                    reader.readAsDataURL(file);
                  } else {
                    // For non-image files, create a link
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const result = e.target?.result as string;
                      editor.chain().focus().setLink({ href: result }).run();
                    };
                    reader.readAsDataURL(file);
                  }
                }
              };
              input.click();
            }} 
            className="p-1.5 rounded text-xs transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="رفع ملف"
          >
            <Upload size={14} />
          </button>
        </div>
        
        {/* Save Status */}
        <SaveStatus status={saveStatus} />
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
  minHeight = "150px",
  autoSave = false,
  onSave,
  saveStatus
}: RichTextEditorProps) {
  // Auto-save functionality
  const [lastSavedContent, setLastSavedContent] = useState(content);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleAutoSave = (newContent: string) => {
    if (autoSave && onSave && newContent !== lastSavedContent) {
      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
      
      // Set new timeout for auto-save (2 seconds delay)
      const timeout = setTimeout(() => {
        onSave();
        setLastSavedContent(newContent);
      }, 2000);
      
      setAutoSaveTimeout(timeout);
    }
  };

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
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer'
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
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-md'
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
        class: `min-h-[${minHeight}] w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-200 transition-all duration-200 ${lang === "ar" ? "text-right" : "text-left"} ${className}`,
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

  // Auto-save effect
  useEffect(() => {
    if (editor && autoSave) {
      const handleUpdate = () => {
        const newContent = editor.getHTML();
        onChange(newContent);
        handleAutoSave(newContent);
      };

      editor.on('update', handleUpdate);
      return () => {
        editor.off('update', handleUpdate);
      };
    }
  }, [editor, autoSave, onChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  return (
    <div className="w-full">
      {showToolbar && <EditorToolbar editor={editor} lang={lang} saveStatus={saveStatus} />}
      <EditorContent editor={editor} />
      <style jsx>{`
        .ProseMirror {
          color: inherit;
        }
        .dark .ProseMirror {
          color: white !important;
        }
        .dark .ProseMirror p {
          color: white !important;
        }
        .dark .ProseMirror h1,
        .dark .ProseMirror h2,
        .dark .ProseMirror h3,
        .dark .ProseMirror h4,
        .dark .ProseMirror h5,
        .dark .ProseMirror h6 {
          color: white !important;
        }
        .dark .ProseMirror ul,
        .dark .ProseMirror ol {
          color: white !important;
        }
        .dark .ProseMirror li {
          color: white !important;
        }
        .dark .ProseMirror blockquote {
          color: white !important;
        }
        .dark .ProseMirror code {
          color: white !important;
        }
        .dark .ProseMirror strong {
          color: white !important;
        }
        .dark .ProseMirror em {
          color: white !important;
        }
        .dark .ProseMirror a {
          color: #60a5fa !important;
          text-decoration: underline;
        }
        .dark .ProseMirror a:hover {
          color: #93c5fd !important;
        }
        .dark .ProseMirror mark {
          background-color: #fbbf24 !important;
          color: #1f2937 !important;
        }
        .dark .ProseMirror .is-editor-empty:first-child::before {
          color: #9ca3af !important;
        }
        .dark .ProseMirror * {
          color: white !important;
        }
        .dark .ProseMirror span {
          color: white !important;
        }
        .dark .ProseMirror div {
          color: white !important;
        }
        .dark .ProseMirror br {
          color: white !important;
        }
        .dark .ProseMirror hr {
          color: white !important;
        }
        .dark .ProseMirror table {
          color: white !important;
        }
        .dark .ProseMirror th,
        .dark .ProseMirror td {
          color: white !important;
        }
      `}</style>
    </div>
  );
}