// Enhanced Rich Text Editor Component
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, Quote, Code,
  Heading1, Heading2, Heading3, Link, Image
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "ابدأ الكتابة...", 
  className = "" 
}) => {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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

  const toggleDropdown = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertText = (text: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      onChange(editorRef.current?.innerHTML || '');
    }
  };

  const toolbarButtons = [
    {
      name: 'bold',
      icon: Bold,
      action: () => {
        execCommand('bold');
        setIsBold(!isBold);
      },
      active: isBold
    },
    {
      name: 'italic',
      icon: Italic,
      action: () => {
        execCommand('italic');
        setIsItalic(!isItalic);
      },
      active: isItalic
    },
    {
      name: 'underline',
      icon: Underline,
      action: () => {
        execCommand('underline');
        setIsUnderline(!isUnderline);
      },
      active: isUnderline
    },
    {
      name: 'heading',
      icon: Heading1,
      action: () => toggleDropdown('heading'),
      dropdown: true,
      dropdownItems: [
        { label: 'العنوان 1', action: () => execCommand('formatBlock', '<h1>') },
        { label: 'العنوان 2', action: () => execCommand('formatBlock', '<h2>') },
        { label: 'العنوان 3', action: () => execCommand('formatBlock', '<h3>') }
      ]
    },
    {
      name: 'list',
      icon: List,
      action: () => toggleDropdown('list'),
      dropdown: true,
      dropdownItems: [
        { label: 'قائمة غير مرقمة', action: () => execCommand('insertUnorderedList') },
        { label: 'قائمة مرقمة', action: () => execCommand('insertOrderedList') }
      ]
    },
    {
      name: 'align',
      icon: AlignLeft,
      action: () => toggleDropdown('align'),
      dropdown: true,
      dropdownItems: [
        { label: 'محاذاة لليسار', action: () => execCommand('justifyLeft') },
        { label: 'محاذاة للوسط', action: () => execCommand('justifyCenter') },
        { label: 'محاذاة لليمين', action: () => execCommand('justifyRight') }
      ]
    },
    {
      name: 'quote',
      icon: Quote,
      action: () => execCommand('formatBlock', '<blockquote>')
    },
    {
      name: 'code',
      icon: Code,
      action: () => execCommand('formatBlock', '<pre>')
    }
  ];

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center space-x-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {toolbarButtons.map((button) => (
          <div key={button.name} className="relative">
            <button
              onClick={button.action}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                button.active ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <button.icon className="w-4 h-4" />
            </button>
            
            {/* Dropdown Menu */}
            {button.dropdown && activeDropdown === button.name && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-48"
              >
                {button.dropdownItems?.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      item.action();
                      setActiveDropdown(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="p-4 min-h-[200px] focus:outline-none text-gray-900 dark:text-white"
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;