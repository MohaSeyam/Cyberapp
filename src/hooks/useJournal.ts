import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';

export interface JournalEntry {
  id: number;
  title: string;
  content: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  dayKey: string;
  dayInfo?: {
    week?: any;
    day?: any;
  };
}

export interface JournalForm {
  title: string;
  content: string;
  tags: string[];
}

export const useJournal = () => {
  const { appState, addJournalEntry, updateJournalEntry, deleteJournalEntry, plan } = useApp();
  const journal = appState?.journal || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // جمع جميع المدونات مع معلومات اليوم
  const allJournalEntries = useMemo(() => {
    const entriesArray: JournalEntry[] = [];
    
    Object.keys(journal).forEach(dayKey => {
      const dayEntries = journal[dayKey] || [];
      dayEntries.forEach((entry: any) => {
        const weekKey = dayKey.split('-')[0];
        const week = plan?.weeks?.find((w: any) => w.key === weekKey);
        const day = week?.days?.find((d: any) => d.key === dayKey);
        
        entriesArray.push({
          ...entry,
          dayKey,
          dayInfo: { week, day }
        });
      });
    });
    
    return entriesArray;
  }, [journal, plan]);

  // فلترة وترتيب المدونات
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = allJournalEntries;

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فلترة حسب التاق
    if (selectedTag) {
      filtered = filtered.filter(entry => 
        entry.tags && entry.tags.includes(selectedTag)
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
  }, [allJournalEntries, searchTerm, selectedTag, sortBy]);

  // جمع جميع التاقات المتاحة
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    allJournalEntries.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach((tag: string) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [allJournalEntries]);

  // دالة الحصول على عنوان اليوم
  const getDayTitle = useCallback((dayKey: string, weekId: number) => {
    if (dayKey === 'general') return 'مدونة عامة';
    
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

  // دالة حفظ المدونة
  const handleSaveEntry = useCallback(async (journalForm: JournalForm, existingEntry?: JournalEntry) => {
    if (journalForm.title.trim() && journalForm.content.trim()) {
      setIsSaving(true);
      try {
        if (existingEntry) {
          // Update existing entry
          await updateJournalEntry(existingEntry.id, {
            title: journalForm.title,
            content: journalForm.content,
            tags: journalForm.tags
          });
        } else {
          // Add new entry
          await addJournalEntry({
            title: journalForm.title,
            content: journalForm.content,
            tags: journalForm.tags
          });
        }
        return true;
      } catch (error) {
        console.error('Error saving journal entry:', error);
        return false;
      } finally {
        setIsSaving(false);
      }
    }
    return false;
  }, [addJournalEntry, updateJournalEntry]);

  // دالة حذف المدونة
  const handleDeleteEntry = useCallback(async (entryId: number) => {
    try {
      await deleteJournalEntry(entryId);
      return true;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      return false;
    }
  }, [deleteJournalEntry]);

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
    allJournalEntries,
    filteredAndSortedEntries,
    availableTags,
    
    // Functions
    getDayTitle,
    handleSaveEntry,
    handleDeleteEntry
  };
};