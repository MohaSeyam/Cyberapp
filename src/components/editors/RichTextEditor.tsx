import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Highlight from '@tiptap/extension-highlight';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import Image from '@tiptap/extension-image';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { FontSize } from '@tiptap/extension-font-size';
import { Node, mergeAttributes, ReactNodeViewRenderer, Extension } from '@tiptap/react';
import { Plugin } from 'prosemirror-state';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, Minus, Code as CodeIcon, Highlighter,
  Link as LinkIcon, Plus, X, Table as TableIcon, Square,
  Type, ChevronDown, Palette, CheckCircle, AlertCircle
} from 'lucide-react';

// Custom CSS for rich text editor
const editorStyles = `
  .rich-text-editor .ProseMirror {
    outline: none;
    min-height: 150px;
    padding: 1rem;
    line-height: 1.6;
  }

  .rich-text-editor .ProseMirror h1 {
    font-size: 2rem;
    font-weight: bold;
    margin: 1rem 0;
    color: #1f2937;
  }

  .rich-text-editor .ProseMirror h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0.75rem 0;
    color: #1f2937;
  }

  .rich-text-editor .ProseMirror h3 {
    font-size: 1.25rem;
    font-weight: bold;
    margin: 0.5rem 0;
    color: #1f2937;
  }

  .rich-text-editor .ProseMirror p {
    margin: 0.5rem 0;
    color: #374151;
  }

  .rich-text-editor .ProseMirror strong {
    font-weight: bold;
    color: #1f2937;
  }

  .rich-text-editor .ProseMirror em {
    font-style: italic;
  }

  .rich-text-editor .ProseMirror u {
    text-decoration: underline;
  }

  .rich-text-editor .ProseMirror s {
    text-decoration: line-through;
  }

  .rich-text-editor .ProseMirror code {
    background-color: #f3f4f6;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    color: #dc2626;
  }

  .rich-text-editor .ProseMirror pre {
    background-color: #f3f4f6;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1rem 0;
  }

  .rich-text-editor .ProseMirror pre code {
    background: none;
    padding: 0;
    color: #374151;
  }

  .rich-text-editor .ProseMirror blockquote {
    border-left: 4px solid #3b82f6;
    padding-left: 1rem;
    margin: 1rem 0;
    font-style: italic;
    color: #6b7280;
  }

  .rich-text-editor .ProseMirror ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }

  .rich-text-editor .ProseMirror ol {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }

  .rich-text-editor .ProseMirror li {
    margin: 0.25rem 0;
  }

  .rich-text-editor .ProseMirror a {
    color: #3b82f6;
    text-decoration: underline;
  }

  .rich-text-editor .ProseMirror a:hover {
    color: #2563eb;
  }

  .rich-text-editor .ProseMirror mark {
    background-color: #fef3c7;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
  }

  /* تحسينات للألوان */
  .rich-text-editor .ProseMirror [style*="color"] {
    transition: color 0.2s ease;
  }

  .rich-text-editor .ProseMirror [style*="font-family"] {
    transition: font-family 0.2s ease;
  }

  .rich-text-editor .ProseMirror [style*="font-size"] {
    transition: font-size 0.2s ease;
  }

  .rich-text-editor .ProseMirror hr {
    border: none;
    border-top: 2px solid #e5e7eb;
    margin: 1rem 0;
  }

  .rich-text-editor .ProseMirror table {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0;
    border: 2px solid #d1d5db;
  }

  .rich-text-editor .ProseMirror th,
  .rich-text-editor .ProseMirror td {
    border: 1px solid #d1d5db;
    padding: 0.75rem;
    text-align: left;
    min-width: 100px;
    position: relative;
  }

  .rich-text-editor .ProseMirror th {
    background-color: #f9fafb;
    font-weight: bold;
    color: #374151;
  }

  .rich-text-editor .ProseMirror td:focus,
  .rich-text-editor .ProseMirror th:focus {
    outline: 2px solid #3b82f6;
    outline-offset: -2px;
  }

  .rich-text-editor .ProseMirror td:hover,
  .rich-text-editor .ProseMirror th:hover {
    background-color: #f3f4f6;
  }

  /* Dark mode styles */
  .dark .rich-text-editor .ProseMirror h1,
  .dark .rich-text-editor .ProseMirror h2,
  .dark .rich-text-editor .ProseMirror h3 {
    color: #f9fafb;
  }

  .dark .rich-text-editor .ProseMirror p {
    color: #d1d5db;
  }

  .dark .rich-text-editor .ProseMirror strong {
    color: #f9fafb;
  }

  .dark .rich-text-editor .ProseMirror code {
    background-color: #374151;
    color: #f87171;
  }

  .dark .rich-text-editor .ProseMirror pre {
    background-color: #374151;
  }

  .dark .rich-text-editor .ProseMirror pre code {
    color: #d1d5db;
  }

  .dark .rich-text-editor .ProseMirror blockquote {
    color: #9ca3af;
  }

  .dark .rich-text-editor .ProseMirror mark {
    background-color: #92400e;
  }

  /* تحسينات للألوان في الوضع المظلم */
  .dark .rich-text-editor .ProseMirror [style*="color"] {
    transition: color 0.2s ease;
  }

  .dark .rich-text-editor .ProseMirror hr {
    border-top-color: #4b5563;
  }

  .dark .rich-text-editor .ProseMirror th,
  .dark .rich-text-editor .ProseMirror td {
    border-color: #4b5563;
  }

  .dark .rich-text-editor .ProseMirror table {
    border-color: #4b5563;
  }

  .dark .rich-text-editor .ProseMirror th,
  .dark .rich-text-editor .ProseMirror td {
    border-color: #4b5563;
  }

  .dark .rich-text-editor .ProseMirror th {
    background-color: #374151;
    color: #f9fafb;
  }

  .dark .rich-text-editor .ProseMirror td:focus,
  .dark .rich-text-editor .ProseMirror th:focus {
    outline-color: #60a5fa;
  }

  .dark .rich-text-editor .ProseMirror td:hover,
  .dark .rich-text-editor .ProseMirror th:hover {
    background-color: #4b5563;
  }

  /* RTL support */
  .rich-text-editor.rtl .ProseMirror {
    text-align: right;
    direction: rtl;
  }

  .rich-text-editor.rtl .ProseMirror ul,
  .rich-text-editor.rtl .ProseMirror ol {
    padding-right: 1.5rem;
    padding-left: 0;
  }

  .rich-text-editor.rtl .ProseMirror blockquote {
    border-right: 4px solid #3b82f6;
    border-left: none;
    padding-right: 1rem;
    padding-left: 0;
  }

  /* تحسينات للجداول في RTL */
  .rich-text-editor.rtl .ProseMirror th,
  .rich-text-editor.rtl .ProseMirror td {
    text-align: right;
  }
`;

type Language = 'ar' | 'en';

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

// Font families and sizes
const fontFamilies = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Courier New', value: 'Courier New, monospace' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Tahoma', value: 'Tahoma, sans-serif' },
  { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Comic Sans MS', value: 'Comic Sans MS, sans-serif' },
  { name: 'Lucida Console', value: 'Lucida Console, monospace' },
];

const fontSizes = [
  { name: '8px', value: '8px' },
  { name: '10px', value: '10px' },
  { name: '12px', value: '12px' },
  { name: '14px', value: '14px' },
  { name: '16px', value: '16px' },
  { name: '18px', value: '18px' },
  { name: '20px', value: '20px' },
  { name: '24px', value: '24px' },
  { name: '28px', value: '28px' },
  { name: '32px', value: '32px' },
  { name: '36px', value: '36px' },
  { name: '48px', value: '48px' },
];

const colors = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#a4c2f4', '#b4a7d6', '#d5a6bd',
  '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6d9eeb', '#8e7cc3', '#c27ba0',
];

// Text Box Component
const TextBoxComponent = React.memo(({ node, updateAttributes, deleteNode }: any) => {
  const [content, setContent] = useState(node.attrs.content || '');
  const [isEditing, setIsEditing] = useState(false);
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    const timeout = setTimeout(() => {
      updateAttributes({ content: newContent });
    }, 200);
    setUpdateTimeout(timeout);
  };

  React.useEffect(() => {
    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, [updateTimeout]);

  return (
    <div className="my-4">
      <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {isEditing ? 'حفظ' : 'تعديل'}
          </button>
          <button
            onClick={deleteNode}
            className="p-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            حذف
          </button>
        </div>
        
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full min-h-[100px] p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="اكتب هنا..."
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <div 
            className="min-h-[100px] p-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded"
            onClick={() => setIsEditing(true)}
          >
            {content || 'اضغط على تعديل لكتابة المحتوى'}
          </div>
        )}
      </div>
    </div>
  );
});

// Text Box Extension
const TextBox = Node.create({
  name: 'textBox',
  group: 'block',
  content: 'inline*',
  
  addAttributes() {
    return {
      content: {
        default: '',
      },
      type: {
        default: 'default',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="text-box"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'text-box' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TextBoxComponent);
  },

  addCommands() {
    return {
      insertTextBox: () => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { content: '', type: 'default' },
        });
      },
    };
  },
});

// Performance Optimization Extension
const PerformanceOptimization = Extension.create({
  name: 'performanceOptimization',
  
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            input: (view, event) => {
              clearTimeout((view as any).inputTimeout);
              (view as any).inputTimeout = setTimeout(() => {
                view.dispatch(view.state.tr);
              }, 100);
              return false;
            },
            paste: (view, event) => {
              return false;
            },
            drop: (view, event) => {
              return false;
            },
          },
        },
        filterTransaction: (transaction, state) => {
          return transaction.docChanged || transaction.steps.length > 0;
        },
      }),
    ];
  },
});

// Enhanced Toolbar Component
const EditorToolbar = React.memo(({ editor, lang = 'ar', saveStatus }: { editor: any; lang?: Language; saveStatus?: 'saving' | 'saved' | 'error' }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.color-picker-container') && !target.closest('.font-family-container') && !target.closest('.font-size-container')) {
        setShowColorPicker(false);
        setShowFontFamily(false);
        setShowFontSize(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowColorPicker(false);
        setShowFontFamily(false);
        setShowFontSize(false);
        setShowLinkInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);
  
  if (!editor) return null;
  
  const addLink = () => {
    if (linkUrl.trim()) {
      const url = linkUrl.trim();
      const finalUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
      
      if (editor.isActive('link')) {
        editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
      } else {
        editor.chain().focus().setLink({ href: finalUrl }).run();
      }
      setLinkUrl('');
      setShowLinkInput(false);
      editor.commands.focus();
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    // إضافة مؤشر النص في الخلية الأولى
    setTimeout(() => {
      const table = editor.view.dom.querySelector('table');
      if (table) {
        const firstCell = table.querySelector('td, th');
        if (firstCell) {
          firstCell.focus();
        }
      }
    }, 100);
  };

  const addRowBefore = () => {
    editor.chain().focus().addRowBefore().run();
    // الحفاظ على المؤشر في نفس العمود
    setTimeout(() => {
      editor.commands.focus();
    }, 50);
  };

  const addRowAfter = () => {
    editor.chain().focus().addRowAfter().run();
    // الحفاظ على المؤشر في نفس العمود
    setTimeout(() => {
      editor.commands.focus();
    }, 50);
  };

  const deleteRow = () => {
    editor.chain().focus().deleteRow().run();
    // الحفاظ على المؤشر في الجدول
    setTimeout(() => {
      editor.commands.focus();
    }, 50);
  };

  const addColumnBefore = () => {
    editor.chain().focus().addColumnBefore().run();
    // الحفاظ على المؤشر في نفس الصف
    setTimeout(() => {
      editor.commands.focus();
    }, 50);
  };

  const addColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run();
    // الحفاظ على المؤشر في نفس الصف
    setTimeout(() => {
      editor.commands.focus();
    }, 50);
  };

  const deleteColumn = () => {
    editor.chain().focus().deleteColumn().run();
    // الحفاظ على المؤشر في الجدول
    setTimeout(() => {
      editor.commands.focus();
    }, 50);
  };

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run();
    // إضافة مؤشر النص بعد حذف الجدول
    setTimeout(() => {
      editor.commands.focus();
    }, 50);
  };

  const insertTextBox = () => {
    editor.chain().focus().insertTextBox().run();
  };

  const setColor = (color: string) => {
    setSelectedColor(color);
    if (editor.state.selection.empty) {
      // إذا لم يكن هناك نص محدد، تطبق اللون على النص التالي
      editor.chain().focus().setColor(color).run();
    } else {
      // إذا كان هناك نص محدد، تطبق اللون عليه
      editor.chain().focus().setColor(color).run();
    }
    setShowColorPicker(false);
    editor.commands.focus();
  };

  const setFontFamily = (fontFamily: string) => {
    if (editor.state.selection.empty) {
      // إذا لم يكن هناك نص محدد، تطبق نوع الخط على النص التالي
      editor.chain().focus().setFontFamily(fontFamily).run();
    } else {
      // إذا كان هناك نص محدد، تطبق نوع الخط عليه
      editor.chain().focus().setFontFamily(fontFamily).run();
    }
    setShowFontFamily(false);
    editor.commands.focus();
  };

  const setFontSize = (fontSize: string) => {
    if (editor.state.selection.empty) {
      // إذا لم يكن هناك نص محدد، تطبق حجم الخط على النص التالي
      editor.chain().focus().setFontSize(fontSize).run();
    } else {
      // إذا كان هناك نص محدد، تطبق حجم الخط عليه
      editor.chain().focus().setFontSize(fontSize).run();
    }
    setShowFontSize(false);
    editor.commands.focus();
  };

  // Save Status Component
  const SaveStatus = React.memo(({ status }: { status?: 'saving' | 'saved' | 'error' }) => {
    if (!status) return null;
    
    return (
      <div className={`flex items-center ${lang === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'} text-xs`}>
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
  });

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 mb-3 ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className={`flex flex-wrap gap-1 items-center justify-start overflow-x-auto scrollbar-hide ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
        {/* Text Formatting */}
        <div className={`flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
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
        <div className={`flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
          <button 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('heading', { level: 1 }) 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="عنوان 1"
          >
            <Heading1 size={14} />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('heading', { level: 2 }) 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="عنوان 2"
          >
            <Heading2 size={14} />
          </button>
        </div>

        {/* Text Alignment */}
        <div className={`flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
          <button 
            onClick={() => editor.chain().focus().setTextAlign('left').run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive({ textAlign: 'left' }) 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="محاذاة يسار"
          >
            <AlignLeft size={14} />
          </button>
          <button 
            onClick={() => editor.chain().focus().setTextAlign('center').run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive({ textAlign: 'center' }) 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="محاذاة وسط"
          >
            <AlignCenter size={14} />
          </button>
          <button 
            onClick={() => editor.chain().focus().setTextAlign('right').run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive({ textAlign: 'right' }) 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="محاذاة يمين"
          >
            <AlignRight size={14} />
          </button>
        </div>

        {/* Lists */}
        <div className={`flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
          <button 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('bulletList') 
                ? 'bg-blue-500 text-white' 
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
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="قائمة مرقمة"
          >
            <ListOrdered size={14} />
          </button>
        </div>

        {/* Block Elements */}
        <div className={`flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
          <button 
            onClick={() => editor.chain().focus().toggleBlockquote().run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('blockquote') 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="اقتباس"
          >
            <Quote size={14} />
          </button>
          <button 
            onClick={() => editor.chain().focus().setHorizontalRule().run()} 
            className="p-1.5 rounded text-xs transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="خط أفقي"
          >
            <Minus size={14} />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleCode().run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('code') 
                ? 'bg-blue-500 text-white' 
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
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="كتلة كود"
          >
            <CodeIcon size={14} />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleHighlight().run()} 
            className={`p-1.5 rounded text-xs transition-all duration-200 ${
              editor.isActive('highlight') 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="تظليل"
          >
            <Highlighter size={14} />
          </button>
        </div>

        {/* Font Family */}
        <div className="relative font-family-container">
          <button 
            onClick={() => setShowFontFamily(!showFontFamily)} 
            className={`flex items-center gap-1 p-1.5 rounded text-xs transition-all duration-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
            title="نوع الخط"
          >
            <Type size={14} />
            <ChevronDown size={12} />
          </button>
          {showFontFamily && (
            <div className={`absolute top-full ${lang === 'ar' ? 'right-0' : 'left-0'} mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-[9999] max-h-60 overflow-y-auto ${lang === 'ar' ? 'text-right' : 'text-left'} min-w-[200px]`}>
              {fontFamilies.map((font) => (
                <button
                  key={font.value}
                  onClick={() => setFontFamily(font.value)}
                  className={`block w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  style={{ fontFamily: font.value }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size */}
        <div className="relative font-size-container">
          <button 
            onClick={() => setShowFontSize(!showFontSize)} 
            className={`flex items-center gap-1 p-1.5 rounded text-xs transition-all duration-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
            title="حجم الخط"
          >
            <Type size={14} />
            <ChevronDown size={12} />
          </button>
          {showFontSize && (
            <div className={`absolute top-full ${lang === 'ar' ? 'right-0' : 'left-0'} mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-[9999] max-h-60 overflow-y-auto ${lang === 'ar' ? 'text-right' : 'text-left'} min-w-[150px]`}>
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setFontSize(size.value)}
                  className={`block w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  style={{ fontSize: size.value }}
                >
                  {size.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color Picker */}
        <div className="relative color-picker-container">
          <button 
            onClick={() => setShowColorPicker(!showColorPicker)} 
            className={`flex items-center gap-1 p-1.5 rounded text-xs transition-all duration-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
            title="لون النص"
          >
            <Palette size={14} />
            <div className="w-3 h-3 rounded border border-gray-300" style={{ backgroundColor: selectedColor }} />
          </button>
          {showColorPicker && (
            <div className={`absolute top-full ${lang === 'ar' ? 'right-0' : 'left-0'} mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-[9999] p-3 grid grid-cols-5 gap-2 min-w-[200px]`}>
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setColor(color)}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        {/* Link */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
          {!showLinkInput ? (
            <button 
              onClick={() => setShowLinkInput(true)} 
              className={`p-1.5 rounded text-xs transition-all duration-200 ${
                editor.isActive('link') 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              title="إضافة رابط"
            >
              <LinkIcon size={14} />
            </button>
          ) : (
            <div className={`flex items-center gap-1 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="أدخل الرابط..."
                className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                onKeyPress={(e) => e.key === 'Enter' && addLink()}
                onKeyDown={(e) => e.key === 'Escape' && setShowLinkInput(false)}
                autoFocus
              />
              <button 
                onClick={addLink} 
                className="p-1 rounded text-xs bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                title="إضافة"
              >
                <Plus size={12} />
              </button>
              <button 
                onClick={() => setShowLinkInput(false)} 
                className="p-1 rounded text-xs bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                title="إلغاء"
              >
                <X size={12} />
              </button>
            </div>
          )}
          {editor.isActive('link') && (
            <button 
              onClick={removeLink} 
              className="p-1.5 rounded text-xs bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="إزالة الرابط"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
          <button 
            onClick={insertTable} 
            className="p-1.5 rounded text-xs transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title={lang === 'ar' ? 'إدراج جدول' : 'Insert Table'}
          >
            <TableIcon size={14} />
          </button>
          {editor.isActive('table') && (
            <>
              <button
                onClick={addRowBefore}
                className="p-1.5 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                title={lang === 'ar' ? 'إضافة صف قبل' : 'Add Row Before'}
              >
                <span className="text-xs">↑</span>
              </button>
              <button
                onClick={addRowAfter}
                className="p-1.5 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                title={lang === 'ar' ? 'إضافة صف بعد' : 'Add Row After'}
              >
                <span className="text-xs">↓</span>
              </button>
              <button
                onClick={addColumnBefore}
                className="p-1.5 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                title={lang === 'ar' ? 'إضافة عمود قبل' : 'Add Column Before'}
              >
                <span className="text-xs">←</span>
              </button>
              <button
                onClick={addColumnAfter}
                className="p-1.5 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                title={lang === 'ar' ? 'إضافة عمود بعد' : 'Add Column After'}
              >
                <span className="text-xs">→</span>
              </button>
              <button
                onClick={deleteRow}
                className="p-1.5 rounded text-xs hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                title={lang === 'ar' ? 'حذف الصف' : 'Delete Row'}
              >
                <span className="text-xs">✕</span>
              </button>
              <button
                onClick={deleteColumn}
                className="p-1.5 rounded text-xs hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                title={lang === 'ar' ? 'حذف العمود' : 'Delete Column'}
              >
                <span className="text-xs">🞬</span>
              </button>
              <button
                onClick={deleteTable}
                className="p-1.5 rounded text-xs hover:bg-red-200 dark:hover:bg-red-800 text-red-700"
                title={lang === 'ar' ? 'حذف الجدول' : 'Delete Table'}
              >
                <TableIcon size={12} className="inline-block mr-1" />✕
              </button>
            </>
          )}
        </div>

        {/* Text Box */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
          <button 
            onClick={insertTextBox} 
            className="p-1.5 rounded text-xs transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title={lang === 'ar' ? 'إدراج مربع نص' : 'Insert Text Box'}
          >
            <Square size={14} />
          </button>
        </div>

        {/* Save Status */}
        {saveStatus && <SaveStatus status={saveStatus} />}
      </div>
    </div>
  );
});

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
  const [lastSavedContent, setLastSavedContent] = useState(content);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleAutoSave = (newContent: string) => {
    if (autoSave && onSave && newContent !== lastSavedContent) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
      const timeout = setTimeout(() => {
        onSave();
        setLastSavedContent(newContent);
      }, 2000);
      setAutoSaveTimeout(timeout);
    }
  };

  // Debounced onChange handler for better performance
  const debouncedOnChange = (newContent: string) => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    const timeout = setTimeout(() => {
      onChange(newContent);
    }, 100); // 100ms debounce
    setUpdateTimeout(timeout);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      Code,
      CodeBlock,
      Highlight,
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      Image,
      HorizontalRule,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle.configure({
        types: ['textStyle'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      FontSize.configure({
        types: ['textStyle'],
      }),
      PerformanceOptimization,
      TextBox,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedOnChange(html);
      handleAutoSave(html);
    },
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none ${lang === 'ar' ? 'rtl text-right' : 'ltr text-left'}`,
      },
      handleDOMEvents: {
        input: (view, event) => {
          return false;
        },
        paste: (view, event) => {
          return false;
        },
      },
    },
  });

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

  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, [autoSaveTimeout, updateTimeout]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" style={{ minHeight }} />;
  }

  return (
    <>
      <style>{editorStyles}</style>
      <div className={`rich-text-editor ${className} ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
        {showToolbar && (
          <EditorToolbar editor={editor} lang={lang} saveStatus={saveStatus} />
        )}
        
        <div 
          className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
          style={{ minHeight }}
        >
          <EditorContent 
            editor={editor} 
            className={`focus:outline-none ${lang === 'ar' ? 'rtl text-right' : 'ltr text-left'}`}
          />
        </div>
      </div>
    </>
  );
}