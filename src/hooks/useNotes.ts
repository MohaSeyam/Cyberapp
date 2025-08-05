import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';

export interface Note {
  id: number;
  title: string;
  content: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  dayKey: string;
  weekId: number;
  dayInfo?: {
    week?: any;
    day?: any;
  };
}

export interface NoteForm {
  title: string;
  content: string;
  tags: string[];
  weekId: number;
  dayKey: string;
  taskId: string;
}

export const useNotes = () => {
  const { appState, addNote, updateNote, deleteNote, plan } = useApp();
  const notes = appState?.notes || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // جمع جميع الملاحظات مع معلومات اليوم
  const allNotes = useMemo(() => {
    const notesArray: Note[] = [];
    
    Object.keys(notes).forEach(dayKey => {
      const dayNotes = notes[dayKey] || [];
      dayNotes.forEach((note: any) => {
        const weekKey = dayKey.split('-')[0];
        const week = plan?.weeks?.find((w: any) => w.key === weekKey);
        const day = week?.days?.find((d: any) => d.key === dayKey);
        
        notesArray.push({
          ...note,
          dayInfo: { week, day }
        });
      });
    });
    
    return notesArray;
  }, [notes, plan]);

  // فلترة وترتيب الملاحظات
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = allNotes;

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فلترة حسب التاق
    if (selectedTag) {
      filtered = filtered.filter(note => 
        note.tags && note.tags.includes(selectedTag)
      );
    }

    // الترتيب
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title, 'ar');
        default:
          return 0;
      }
    });

    return filtered;
  }, [allNotes, searchTerm, selectedTag, sortBy]);

  // جمع جميع التاقات المتاحة
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    allNotes.forEach(note => {
      if (note.tags) {
        note.tags.forEach((tag: string) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [allNotes]);

  // دالة الحصول على عنوان اليوم
  const getDayTitle = useCallback((dayKey: string, weekId: number) => {
    if (dayKey === 'general') return 'ملاحظة عامة';
    
    const week = plan?.find((w: any) => w.week === weekId);
    const day = week?.days?.find((d: any) => d.key === dayKey);
    
    if (day?.name?.ar) {
      let title = day.name.ar;
      if (day.topic?.ar) {
        title += ` - ${day.topic.ar}`;
      }
      return title;
    }
    
    if (day?.name?.en) {
      let title = day.name.en;
      if (day.topic?.en) {
        title += ` - ${day.topic.en}`;
      }
      return title;
    }
    
    // Fallback to day name
    const dayNames: { [key: string]: string } = {
      sat: 'السبت',
      sun: 'الأحد',
      mon: 'الاثنين',
      tue: 'الثلاثاء',
      wed: 'الأربعاء',
      thu: 'الخميس',
      fri: 'الجمعة'
    };
    return dayNames[dayKey] || dayKey;
  }, [plan]);

  // دالة حفظ الملاحظة
  const handleSaveNote = useCallback(async (noteForm: NoteForm, existingNote?: Note) => {
    if (noteForm.title.trim() && noteForm.content.trim()) {
      setIsSaving(true);
      try {
        // Add automatic tag for general notes
        let finalTags = [...noteForm.tags];
        if (noteForm.dayKey === 'general' && !finalTags.includes('ملاحظة عامة')) {
          finalTags.push('ملاحظة عامة');
        }

        if (existingNote) {
          // Update existing note
          await updateNote(existingNote.id, {
            title: noteForm.title,
            content: noteForm.content,
            tags: finalTags
          });
        } else {
          // Add new note
          await addNote({
            title: noteForm.title,
            content: noteForm.content,
            tags: finalTags,
            weekId: noteForm.weekId,
            dayKey: noteForm.dayKey,
            taskId: noteForm.taskId
          });
        }
        return true;
      } catch (error) {
        console.error('Error saving note:', error);
        return false;
      } finally {
        setIsSaving(false);
      }
    }
    return false;
  }, [addNote, updateNote]);

  // دالة حذف الملاحظة
  const handleDeleteNote = useCallback(async (noteId: number) => {
    try {
      await deleteNote(noteId);
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  }, [deleteNote]);

  return {
    // State
    searchTerm,
    setSearchTerm,
    selectedTag,
    setSelectedTag,
    sortBy,
    setSortBy,
    showFilters,
    setShowFilters,
    isSaving,
    
    // Data
    allNotes,
    filteredAndSortedNotes,
    availableTags,
    
    // Functions
    getDayTitle,
    handleSaveNote,
    handleDeleteNote
  };
};