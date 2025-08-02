// Enhanced Rich Text Editor Component
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
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { FontSize } from "@tiptap/extension-font-size";
import { motion } from "framer-motion";
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Code as CodeIcon, Highlighter, Quote, Link as LinkIcon, Save, CheckCircle, AlertCircle, 
  Image as ImageIcon, Upload, Minus, Table as TableIcon, Palette, Type, 
  ChevronDown, X, Plus
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

// Font Families
const fontFamilies = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Courier New', value: 'Courier New, monospace' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Tahoma', value: 'Tahoma, sans-serif' },
  { name: 'Cairo', value: 'Cairo, sans-serif' },
  { name: 'Amiri', value: 'Amiri, serif' },
  { name: 'Noto Naskh Arabic', value: 'Noto Naskh Arabic, serif' },
  { name: 'Scheherazade New', value: 'Scheherazade New, serif' },
  { name: 'Readex Pro', value: 'Readex Pro, sans-serif' },
  { name: 'IBM Plex Sans Arabic', value: 'IBM Plex Sans Arabic, sans-serif' }
];

// Font Sizes
const fontSizes = [
  { name: 'صغير جداً', value: '12px' },
  { name: 'صغير', value: '14px' },
  { name: 'عادي', value: '16px' },
  { name: 'متوسط', value: '18px' },
  { name: 'كبير', value: '20px' },
  { name: 'كبير جداً', value: '24px' },
  { name: 'عنوان', value: '28px' },
  { name: 'عنوان رئيسي', value: '32px' }
];

// Colors
const colors = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#a4c2f4', '#b4a7d6', '#d5a6bd'
];

// Enhanced Toolbar Component
function EditorToolbar({ editor, lang = 'ar', saveStatus }: { editor: any; lang?: Language; saveStatus?: 'saving' | 'saved' | 'error' }) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  
  if (!editor) return null;
  
  const addLink = () => {
    if (linkUrl.trim()) {
      if (editor.isActive('link')) {
        editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run();
      } else {
        editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
      }
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addRowBefore = () => {
    editor.chain().focus().addRowBefore().run();
  };

  const addRowAfter = () => {
    editor.chain().focus().addRowAfter().run();
  };

  const deleteRow = () => {
    editor.chain().focus().deleteRow().run();
  };

  const addColumnBefore = () => {
    editor.chain().focus().addColumnBefore().run();
  };

  const addColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run();
  };

  const deleteColumn = () => {
    editor.chain().focus().deleteColumn().run();
  };

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run();
  };

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setSelectedColor(color);
    setShowColorPicker(false);
  };

  const setFontFamily = (fontFamily: string) => {
    editor.chain().focus().setFontFamily(fontFamily).run();
    setShowFontFamily(false);
  };

  const setFontSize = (fontSize: string) => {
    editor.chain().focus().setFontSize(fontSize).run();
    setShowFontSize(false);
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
      <div className="flex flex-wrap gap-1 items-center justify-start overflow-x-auto scrollbar-hide">
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
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
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
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
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
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
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
        <div className="relative">
          <button 
            onClick={() => setShowFontFamily(!showFontFamily)} 
            className="flex items-center gap-1 p-1.5 rounded text-xs transition-all duration-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="نوع الخط"
          >
            <Type size={14} />
            <ChevronDown size={12} />
          </button>
          {showFontFamily && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {fontFamilies.map((font) => (
                <button
                  key={font.value}
                  onClick={() => setFontFamily(font.value)}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  style={{ fontFamily: font.value }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size */}
        <div className="relative">
          <button 
            onClick={() => setShowFontSize(!showFontSize)} 
            className="flex items-center gap-1 p-1.5 rounded text-xs transition-all duration-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="حجم الخط"
          >
            <Type size={14} />
            <span className="text-xs">حجم</span>
            <ChevronDown size={12} />
          </button>
          {showFontSize && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setFontSize(size.value)}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  style={{ fontSize: size.value }}
                >
                  {size.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color Picker */}
        <div className="relative">
          <button 
            onClick={() => setShowColorPicker(!showColorPicker)} 
            className="flex items-center gap-1 p-1.5 rounded text-xs transition-all duration-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="لون النص"
          >
            <Palette size={14} />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 p-2">
              <div className="grid grid-cols-10 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setColor(color)}
                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table Controls */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-md p-1 border border-gray-200 dark:border-gray-600">
          <button 
            onClick={insertTable} 
            className="p-1.5 rounded text-xs transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="إدراج جدول"
          >
            <TableIcon size={14} />
          </button>
          {editor.isActive('table') && (
            <>
              <button 
                onClick={addRowBefore} 
                className="p-1.5 rounded text-xs transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                title="إضافة صف قبل"
              >
                <Plus size={14} />
              </button>
              <button 
                onClick={addRowAfter} 
                className="p-1.5 rounded text-xs transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                title="إضافة صف بعد"
              >
                <Plus size={14} />
              </button>
              <button 
                onClick={deleteRow} 
                className="p-1.5 rounded text-xs transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                title="حذف صف"
              >
                <X size={14} />
              </button>
              <button 
                onClick={addColumnBefore} 
                className="p-1.5 rounded text-xs transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                title="إضافة عمود قبل"
              >
                <Plus size={14} />
              </button>
              <button 
                onClick={addColumnAfter} 
                className="p-1.5 rounded text-xs transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                title="إضافة عمود بعد"
              >
                <Plus size={14} />
              </button>
              <button 
                onClick={deleteColumn} 
                className="p-1.5 rounded text-xs transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                title="حذف عمود"
              >
                <X size={14} />
              </button>
              <button 
                onClick={deleteTable} 
                className="p-1.5 rounded text-xs transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                title="حذف الجدول"
              >
                <X size={14} />
              </button>
            </>
          )}
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
              <X size={14} />
            </button>
          )}
        </div>

        {/* Save Status */}
        <div className="ml-auto">
          <SaveStatus status={saveStatus} />
        </div>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-600">
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
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              onClick={addLink}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              إضافة
            </button>
            <button
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl('');
              }}
              className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
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
  const [lastSavedContent, setLastSavedContent] = useState(content);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

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
      TextStyle,
      Color,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      FontSize.configure({
        types: ['textStyle'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      handleAutoSave(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none',
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
    };
  }, [autoSaveTimeout]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" style={{ minHeight }} />;
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      {showToolbar && (
        <EditorToolbar editor={editor} lang={lang} saveStatus={saveStatus} />
      )}
      
      <div 
        className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
        style={{ minHeight }}
      >
        <EditorContent 
          editor={editor} 
          className="p-4 focus:outline-none prose prose-lg max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-900 dark:prose-code:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-700 dark:prose-blockquote:text-white prose-li:text-gray-700 dark:prose-li:text-white prose-ul:text-gray-700 dark:prose-ul:text-white prose-ol:text-gray-700 dark:prose-ol:text-white"
        />
      </div>
    </div>
  );
}