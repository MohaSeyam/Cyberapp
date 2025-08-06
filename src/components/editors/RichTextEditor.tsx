// Enhanced Rich Text Editor Component
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, 
  Quote, Code, Heading1, Heading2, Heading3, Link, Image, Strikethrough,
  Superscript, Subscript, Indent, Outdent, Undo, Redo, Palette, Type, 
  Minus, Plus, RotateCcw, RotateCw, Highlighter, Eraser, FileText
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "ابدأ الكتابة...",
  className = "",
  readOnly = false,
  minHeight = "200px"
}) => {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [selectedText, setSelectedText] = useState('');
  
  const editorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update formatting state when selection changes
  useEffect(() => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const parentElement = range.commonAncestorContainer.parentElement;
        
        if (parentElement) {
          setIsBold(parentElement.style.fontWeight === 'bold' || parentElement.tagName === 'STRONG' || parentElement.tagName === 'B');
          setIsItalic(parentElement.style.fontStyle === 'italic' || parentElement.tagName === 'EM' || parentElement.tagName === 'I');
          setIsUnderline(parentElement.style.textDecoration === 'underline' || parentElement.tagName === 'U');
          setIsStrikethrough(parentElement.style.textDecoration === 'line-through' || parentElement.tagName === 'STRIKE');
        }
      }
    }
  }, [value]);

  const toggleDropdown = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    updateContent();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            execCommand('redo');
          } else {
            execCommand('undo');
          }
          break;
      }
    }
  };

  const insertLink = () => {
    const url = prompt('أدخل الرابط:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('أدخل رابط الصورة:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const changeFontSize = (size: string) => {
    execCommand('fontSize', size);
    setFontSize(size);
  };

  const changeFontFamily = (font: string) => {
    execCommand('fontName', font);
    setFontFamily(font);
  };

  const changeTextColor = (color: string) => {
    execCommand('foreColor', color);
    setTextColor(color);
  };

  const changeBackgroundColor = (color: string) => {
    execCommand('hiliteColor', color);
    setBackgroundColor(color);
  };

  const clearFormatting = () => {
    execCommand('removeFormat');
  };

  const insertTable = () => {
    const rows = prompt('عدد الصفوف:', '3');
    const cols = prompt('عدد الأعمدة:', '3');
    if (rows && cols) {
      let table = '<table border="1" style="border-collapse: collapse; width: 100%;">';
      for (let i = 0; i < parseInt(rows); i++) {
        table += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          table += '<td style="padding: 8px; border: 1px solid #ccc;">&nbsp;</td>';
        }
        table += '</tr>';
      }
      table += '</table>';
      execCommand('insertHTML', table);
    }
  };

  const insertHorizontalRule = () => {
    execCommand('insertHorizontalRule');
  };

  // Reorganized toolbar with grouped similar tools
  const toolbarButtons = [
    // Undo/Redo Group
    {
      name: 'undo',
      icon: Undo,
      action: () => execCommand('undo'),
      tooltip: 'تراجع'
    },
    {
      name: 'redo',
      icon: Redo,
      action: () => execCommand('redo'),
      tooltip: 'إعادة'
    },
    { name: 'separator' },
    
    // Text Formatting Group
    {
      name: 'bold',
      icon: Bold,
      action: () => execCommand('bold'),
      active: isBold,
      tooltip: 'عريض (Ctrl+B)'
    },
    {
      name: 'italic',
      icon: Italic,
      action: () => execCommand('italic'),
      active: isItalic,
      tooltip: 'مائل (Ctrl+I)'
    },
    {
      name: 'underline',
      icon: Underline,
      action: () => execCommand('underline'),
      active: isUnderline,
      tooltip: 'تحت خط (Ctrl+U)'
    },
    {
      name: 'strikethrough',
      icon: Strikethrough,
      action: () => execCommand('strikethrough'),
      active: isStrikethrough,
      tooltip: 'خط في المنتصف'
    },
    { name: 'separator' },
    
    // Font Settings Group
    {
      name: 'fontFamily',
      icon: Type,
      action: () => toggleDropdown('fontFamily'),
      dropdown: true,
      tooltip: 'نوع الخط'
    },
    {
      name: 'fontSize',
      icon: FileText,
      action: () => toggleDropdown('fontSize'),
      dropdown: true,
      tooltip: 'حجم الخط'
    },
    {
      name: 'textColor',
      icon: Palette,
      action: () => toggleDropdown('textColor'),
      dropdown: true,
      tooltip: 'لون النص'
    },
    {
      name: 'backgroundColor',
      icon: Highlighter,
      action: () => toggleDropdown('backgroundColor'),
      dropdown: true,
      tooltip: 'لون الخلفية'
    },
    { name: 'separator' },
    
    // Alignment Group
    {
      name: 'alignLeft',
      icon: AlignLeft,
      action: () => execCommand('justifyLeft'),
      tooltip: 'محاذاة لليسار'
    },
    {
      name: 'alignCenter',
      icon: AlignCenter,
      action: () => execCommand('justifyCenter'),
      tooltip: 'محاذاة للمنتصف'
    },
    {
      name: 'alignRight',
      icon: AlignRight,
      action: () => execCommand('justifyRight'),
      tooltip: 'محاذاة لليمين'
    },
    { name: 'separator' },
    
    // Indentation Group
    {
      name: 'indent',
      icon: Indent,
      action: () => execCommand('indent'),
      tooltip: 'زيادة المسافة البادئة'
    },
    {
      name: 'outdent',
      icon: Outdent,
      action: () => execCommand('outdent'),
      tooltip: 'تقليل المسافة البادئة'
    },
    { name: 'separator' },
    
    // Headings Group
    {
      name: 'heading1',
      icon: Heading1,
      action: () => execCommand('formatBlock', '<h1>'),
      tooltip: 'عنوان رئيسي 1'
    },
    {
      name: 'heading2',
      icon: Heading2,
      action: () => execCommand('formatBlock', '<h2>'),
      tooltip: 'عنوان رئيسي 2'
    },
    {
      name: 'heading3',
      icon: Heading3,
      action: () => execCommand('formatBlock', '<h3>'),
      tooltip: 'عنوان رئيسي 3'
    },
    { name: 'separator' },
    
    // Lists and Blocks Group
    {
      name: 'bulletList',
      icon: List,
      action: () => execCommand('insertUnorderedList'),
      tooltip: 'قائمة نقطية'
    },
    {
      name: 'numberList',
      icon: ListOrdered,
      action: () => execCommand('insertOrderedList'),
      tooltip: 'قائمة مرقمة'
    },
    {
      name: 'quote',
      icon: Quote,
      action: () => execCommand('formatBlock', '<blockquote>'),
      tooltip: 'اقتباس'
    },
    {
      name: 'code',
      icon: Code,
      action: () => execCommand('formatBlock', '<pre>'),
      tooltip: 'كود'
    },
    { name: 'separator' },
    
    // Insert Elements Group
    {
      name: 'link',
      icon: Link,
      action: insertLink,
      tooltip: 'إدراج رابط'
    },
    {
      name: 'image',
      icon: Image,
      action: insertImage,
      tooltip: 'إدراج صورة'
    },
    {
      name: 'table',
      icon: FileText,
      action: insertTable,
      tooltip: 'إدراج جدول'
    },
    {
      name: 'horizontalRule',
      icon: Minus,
      action: insertHorizontalRule,
      tooltip: 'خط أفقي'
    },
    { name: 'separator' },
    
    // Utility Group
    {
      name: 'clearFormat',
      icon: Eraser,
      action: clearFormatting,
      tooltip: 'مسح التنسيق'
    }
  ];

  const fontFamilies = [
    { name: 'Arial', value: 'Arial' },
    { name: 'Times New Roman', value: 'Times New Roman' },
    { name: 'Courier New', value: 'Courier New' },
    { name: 'Georgia', value: 'Georgia' },
    { name: 'Verdana', value: 'Verdana' },
    { name: 'Tahoma', value: 'Tahoma' },
    { name: 'Trebuchet MS', value: 'Trebuchet MS' },
    { name: 'Impact', value: 'Impact' }
  ];

  const fontSizes = [
    { name: 'صغير جداً', value: '12px' },
    { name: 'صغير', value: '14px' },
    { name: 'عادي', value: '16px' },
    { name: 'كبير', value: '18px' },
    { name: 'كبير جداً', value: '20px' },
    { name: 'ضخم', value: '24px' },
    { name: 'عملاق', value: '32px' }
  ];

  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#a4c2f4', '#b4a7d6', '#d5a6bd'
  ];

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {toolbarButtons.map((button, index) => {
          if (button.name === 'separator') {
            return <div key={`sep-${index}`} className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />;
          }

          const Icon = button.icon;
          return (
            <div key={button.name} className="relative">
              <button
                onClick={button.action}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  button.active ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'
                }`}
                title={button.tooltip}
                disabled={readOnly}
              >
                <Icon className="w-4 h-4" />
              </button>

              {/* Dropdown Menus */}
              {button.dropdown && activeDropdown === button.name && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-48"
                >
                  {button.name === 'fontFamily' && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">نوع الخط</div>
                      {fontFamilies.map((font) => (
                        <button
                          key={font.value}
                          onClick={() => {
                            changeFontFamily(font.value);
                            setActiveDropdown(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          style={{ fontFamily: font.value }}
                        >
                          {font.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {button.name === 'fontSize' && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">حجم الخط</div>
                      {fontSizes.map((size) => (
                        <button
                          key={size.value}
                          onClick={() => {
                            changeFontSize(size.value);
                            setActiveDropdown(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {button.name === 'textColor' && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">لون النص</div>
                      <div className="grid grid-cols-10 gap-1">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              changeTextColor(color);
                              setActiveDropdown(null);
                            }}
                            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {button.name === 'backgroundColor' && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">لون الخلفية</div>
                      <div className="grid grid-cols-10 gap-1">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              changeBackgroundColor(color);
                              setActiveDropdown(null);
                            }}
                            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        className="p-4 focus:outline-none text-gray-900 dark:text-white"
        style={{ minHeight }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={updateContent}
        dangerouslySetInnerHTML={{ __html: value }}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;