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
// Image extension removed - not available
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
// FontFamily extension removed - not available
// FontSize extension removed - not available
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

// Font Families - تحسين الخطوط العربية
const fontFamilies = [
  { name: 'Cairo', value: 'Cairo, sans-serif' },
  { name: 'Amiri', value: 'Amiri, serif' },
  { name: 'Noto Naskh Arabic', value: 'Noto Naskh Arabic, serif' },
  { name: 'Scheherazade New', value: 'Scheherazade New, serif' },
  { name: 'IBM Plex Sans Arabic', value: 'IBM Plex Sans Arabic, sans-serif' },
  { name: 'Readex Pro', value: 'Readex Pro, sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Courier New', value: 'Courier New, monospace' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Tahoma', value: 'Tahoma, sans-serif' }
];

// Font Sizes - تحسين أحجام الخطوط
const fontSizes = [
  { name: 'صغير جداً', value: '12px' },
  { name: 'صغير', value: '14px' },
  { name: 'عادي', value: '16px' },
  { name: 'متوسط', value: '18px' },
  { name: 'كبير', value: '20px' },
  { name: 'كبير جداً', value: '24px' },
  { name: 'عنوان', value: '28px' },
  { name: 'عنوان رئيسي', value: '32px' },
  { name: 'عنوان كبير', value: '36px' },
  { name: 'عنوان ضخم', value: '48px' }
];

// Colors
const colors = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
];

// Enhanced Toolbar Component
function EditorToolbar({ editor, lang = 'ar', saveStatus }: { editor: any; lang?: Language; saveStatus?: 'saving' | 'saved' | 'error' }) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  
  // إغلاق القوائم المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.color-picker-container') && !target.closest('.font-family-container') && !target.closest('.font-size-container')) {
        setShowColorPicker(false);
        setShowFontFamily(false);
        setShowFontSize(false);
      }
    };

    // إغلاق قائمة واحدة عند فتح أخرى
    const closeOtherMenus = () => {
      if (showColorPicker) {
        setShowFontFamily(false);
        setShowFontSize(false);
      }
      if (showFontFamily) {
        setShowColorPicker(false);
        setShowFontSize(false);
      }
      if (showFontSize) {
        setShowColorPicker(false);
        setShowFontFamily(false);
      }
    };

    // تطبيق إغلاق القوائم الأخرى
    closeOtherMenus();

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

  // إغلاق القوائم الأخرى عند فتح قائمة جديدة
  useEffect(() => {
    if (showColorPicker) {
      setShowFontFamily(false);
      setShowFontSize(false);
    }
  }, [showColorPicker]);

  useEffect(() => {
    if (showFontFamily) {
      setShowColorPicker(false);
      setShowFontSize(false);
    }
  }, [showFontFamily]);

  useEffect(() => {
    if (showFontSize) {
      setShowColorPicker(false);
      setShowFontFamily(false);
    }
  }, [showFontSize]);
  
  if (!editor) return null;
  
  const addLink = () => {
    if (linkUrl.trim()) {
      const url = linkUrl.trim();
      // إضافة http:// إذا لم يكن موجوداً
      const finalUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
      
      if (editor.isActive('link')) {
        editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
      } else {
        editor.chain().focus().setLink({ href: finalUrl }).run();
      }
      setLinkUrl('');
      setShowLinkInput(false);
      // Force editor update
      editor.commands.focus();
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
    setSelectedColor(color);
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
    // Force editor update
    editor.commands.focus();
  };

  const setFontFamily = (fontFamily: string) => {
    // استخدام CSS مباشرة لتغيير الخط
    editor.chain().focus().run(({ commands }) => {
      // تطبيق الخط على النص المحدد أو النص الحالي
      const { from, to } = editor.state.selection;
      if (from !== to) {
        // تطبيق على النص المحدد
        editor.chain().focus().setMark('textStyle', { fontFamily }).run();
      } else {
        // تطبيق على النص الجديد
        editor.chain().focus().setMark('textStyle', { fontFamily }).run();
      }
    });
    setShowFontFamily(false);
    // Force editor update
    editor.commands.focus();
  };

  const setFontSize = (fontSize: string) => {
    // استخدام CSS مباشرة لتغيير حجم الخط
    editor.chain().focus().run(({ commands }) => {
      // تطبيق حجم الخط على النص المحدد أو النص الحالي
      const { from, to } = editor.state.selection;
      if (from !== to) {
        // تطبيق على النص المحدد
        editor.chain().focus().setMark('textStyle', { fontSize }).run();
      } else {
        // تطبيق على النص الجديد
        editor.chain().focus().setMark('textStyle', { fontSize }).run();
      }
    });
    setShowFontSize(false);
    // Force editor update
    editor.commands.focus();
  };

  // Save Status Component
  const SaveStatus = ({ status }: { status?: 'saving' | 'saved' | 'error' }) => {
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
  };

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
            <span className="text-xs">خط</span>
            <ChevronDown size={12} />
          </button>
          {showFontFamily && (
            <div className={`absolute top-full ${lang === 'ar' ? 'right-0' : 'left-0'} mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-[9999] max-h-60 overflow-y-auto ${lang === 'ar' ? 'text-right' : 'text-left'} min-w-[220px]`}>
              <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">اختر نوع الخط</span>
              </div>
              {fontFamilies.map((font) => (
                <button
                  key={font.value}
                  onClick={() => setFontFamily(font.value)}
                  className={`block w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ${lang === 'ar' ? 'text-right' : 'text-left'} transition-colors duration-150`}
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
            <span className="text-xs">حجم</span>
            <ChevronDown size={12} />
          </button>
          {showFontSize && (
            <div className={`absolute top-full ${lang === 'ar' ? 'right-0' : 'left-0'} mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-[9999] max-h-60 overflow-y-auto ${lang === 'ar' ? 'text-right' : 'text-left'} min-w-[180px]`}>
              <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">اختر حجم الخط</span>
              </div>
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setFontSize(size.value)}
                  className={`block w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ${lang === 'ar' ? 'text-right' : 'text-left'} transition-colors duration-150`}
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
            title="إدراج جدول"
          >
            <TableIcon size={14} />
          </button>
        </div>

        {/* Save Status */}
        {saveStatus && <SaveStatus status={saveStatus} />}
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
      // FontFamily.configure({
      //   types: ['textStyle'],
      // }),
      // FontSize.configure({
      //   types: ['textStyle'],
      // }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      handleAutoSave(html);
    },
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none ${lang === 'ar' ? 'rtl text-right' : 'ltr text-left'}`,
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
    <div className={`rich-text-editor ${className} ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <style jsx>{`
        .rich-text-editor .ProseMirror {
          font-family: 'Cairo', 'Amiri', 'Noto Naskh Arabic', sans-serif;
          line-height: 1.6;
        }
        .rich-text-editor .ProseMirror p {
          margin-bottom: 1rem;
        }
        .rich-text-editor .ProseMirror h1,
        .rich-text-editor .ProseMirror h2,
        .rich-text-editor .ProseMirror h3,
        .rich-text-editor .ProseMirror h4,
        .rich-text-editor .ProseMirror h5,
        .rich-text-editor .ProseMirror h6 {
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .rich-text-editor .ProseMirror h1 { font-size: 2rem; }
        .rich-text-editor .ProseMirror h2 { font-size: 1.75rem; }
        .rich-text-editor .ProseMirror h3 { font-size: 1.5rem; }
        .rich-text-editor .ProseMirror h4 { font-size: 1.25rem; }
        .rich-text-editor .ProseMirror h5 { font-size: 1.125rem; }
        .rich-text-editor .ProseMirror h6 { font-size: 1rem; }
      `}</style>
      {showToolbar && (
        <EditorToolbar editor={editor} lang={lang} saveStatus={saveStatus} />
      )}
      
      <div 
        className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
        style={{ minHeight }}
      >
        <EditorContent 
          editor={editor} 
          className={`p-4 focus:outline-none prose prose-lg max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-900 dark:prose-code:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-700 dark:prose-blockquote:text-white prose-li:text-gray-700 dark:prose-li:text-white prose-ul:text-gray-700 dark:prose-ul:text-white prose-ol:text-gray-700 dark:prose-ol:text-white ${lang === 'ar' ? 'rtl text-right' : 'ltr text-left'}`}
        />
      </div>
    </div>
  );
}