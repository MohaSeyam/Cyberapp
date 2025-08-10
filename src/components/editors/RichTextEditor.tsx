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

  const insertTextBox = () => {
    editor.chain().focus().insertTextBox().run();
  };

  const setColor = (color: string) => {
    setSelectedColor(color);
    if (editor.state.selection.empty) {
      editor.chain().focus().setColor(color).run();
      editor.commands.setMark('textStyle', { color });
    } else {
      editor.chain().focus().setColor(color).run();
    }
    setShowColorPicker(false);
    editor.commands.focus();
  };

  const setFontFamily = (fontFamily: string) => {
    if (editor.state.selection.empty) {
      editor.chain().focus().setFontFamily(fontFamily).run();
      editor.commands.setMark('textStyle', { fontFamily });
    } else {
      editor.chain().focus().setFontFamily(fontFamily).run();
    }
    setShowFontFamily(false);
    editor.commands.focus();
  };

  const setFontSize = (fontSize: string) => {
    if (editor.state.selection.empty) {
      editor.chain().focus().setFontSize(fontSize).run();
      editor.commands.setMark('textStyle', { fontSize });
    } else {
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
          className={`p-4 focus:outline-none prose prose-lg max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-gray-900 dark:prose-code:text-white prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-700 dark:prose-blockquote:text-white prose-li:text-gray-700 dark:prose-li:text-white prose-ul:text-gray-700 dark:prose-ul:text-white prose-ol:text-gray-700 dark:prose-ol:text-white ${lang === 'ar' ? 'rtl text-right' : 'ltr text-left'}`}
        />
      </div>
    </div>
  );
}