import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, ExternalLink, Plus, Search, Filter, 
  Calendar, Target, FileText, Video, ToolCase, 
  Edit2, Trash2, Eye, Download, Tag
} from 'lucide-react';
import { useSimpleApp } from '../context/SimpleAppContext';
import { useSimpleLocalization } from '../context/SimpleLocalizationContext';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import planData from '../data/PlanData.json';

const ResourcesPage = () => {
  const { resources, addResource, deleteResource, updateResource } = useSimpleApp();
  const { language } = useSimpleLocalization();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    url: '',
    type: 'article',
    description: '',
    category: '',
    weekId: '',
    dayKey: '',
    phaseId: ''
  });

  // الحصول على جميع الموارد (من الخطة + المضافة من قبل المستخدم)
  const allResources = useMemo(() => {
    const planResources = [];
    const userResources = resources || [];

    // جمع الموارد من ملف الخطة
    planData.forEach(week => {
      week.days?.forEach(day => {
        if (day.resources) {
          day.resources.forEach(resource => {
            planResources.push({
              ...resource,
              source: 'plan',
              weekId: week.week,
              dayKey: day.key,
              phaseId: week.phase,
              dayName: day.day?.[language] || day.day?.ar,
              weekNumber: week.week,
              topic: day.topic?.[language] || day.topic?.ar
            });
          });
        }
      });
    });

    // إضافة الموارد المضافة من قبل المستخدم
    const enhancedUserResources = userResources.map(resource => ({
      ...resource,
      source: 'user',
      dayName: getDayName(resource.weekId, resource.dayKey),
      weekNumber: resource.weekId,
      topic: getDayTopic(resource.weekId, resource.dayKey)
    }));

    return [...planResources, ...enhancedUserResources];
  }, [resources, language]);

  // الحصول على اسم اليوم
  const getDayName = (weekId, dayKey) => {
    const week = planData.find(w => w.week === weekId);
    if (week) {
      const day = week.days?.find(d => d.key === dayKey);
      return day?.day?.[language] || day?.day?.ar;
    }
    return '';
  };

  // الحصول على موضوع اليوم
  const getDayTopic = (weekId, dayKey) => {
    const week = planData.find(w => w.week === weekId);
    if (week) {
      const day = week.days?.find(d => d.key === dayKey);
      return day?.topic?.[language] || day?.topic?.ar;
    }
    return '';
  };

  // تصفية الموارد
  const filteredResources = useMemo(() => {
    return allResources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'all' || resource.type === selectedType;
      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
      
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [allResources, searchTerm, selectedType, selectedCategory]);

  // الحصول على أنواع الموارد الفريدة
  const resourceTypes = useMemo(() => {
    const types = new Set(allResources.map(r => r.type));
    return Array.from(types);
  }, [allResources]);

  // الحصول على فئات الموارد الفريدة
  const resourceCategories = useMemo(() => {
    const categories = new Set(allResources.map(r => r.category).filter(Boolean));
    return Array.from(categories);
  }, [allResources]);

  const handleAddResource = async () => {
    if (!resourceForm.title.trim() || !resourceForm.url.trim()) return;
    
    try {
      await addResource({
        ...resourceForm,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setShowAddModal(false);
      setResourceForm({
        title: '', url: '', type: 'article', description: '', category: '',
        weekId: '', dayKey: '', phaseId: ''
      });
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };

  const handleUpdateResource = async () => {
    if (!editingResource || !resourceForm.title.trim() || !resourceForm.url.trim()) return;
    
    try {
      await updateResource(editingResource.id, {
        ...resourceForm,
        updatedAt: new Date().toISOString(),
      });
      setEditingResource(null);
      setResourceForm({
        title: '', url: '', type: 'article', description: '', category: '',
        weekId: '', dayKey: '', phaseId: ''
      });
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      await deleteResource(resourceId);
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setResourceForm({
      title: resource.title || '',
      url: resource.url || '',
      type: resource.type || 'article',
      description: resource.description || '',
      category: resource.category || '',
      weekId: resource.weekId || '',
      dayKey: resource.dayKey || '',
      phaseId: resource.phaseId || ''
    });
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setEditingResource(null);
    setResourceForm({
      title: '', url: '', type: 'article', description: '', category: '',
      weekId: '', dayKey: '', phaseId: ''
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'book': return <BookOpen className="w-5 h-5" />;
      case 'tool': return <ToolCase className="w-5 h-5" />;
      case 'course': return <FileText className="w-5 h-5" />;
      default: return <ExternalLink className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'book': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'tool': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'course': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'الموارد التعليمية' : 'Learning Resources'}
              </h1>
            </div>
            <Button
              variant="primary"
              icon={<Plus className="w-5 h-5" />}
              onClick={openAddModal}
            >
              {language === 'ar' ? 'إضافة مورد' : 'Add Resource'}
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث في الموارد...' : 'Search resources...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
              {resourceTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'article' ? (language === 'ar' ? 'مقال' : 'Article') :
                   type === 'video' ? (language === 'ar' ? 'فيديو' : 'Video') :
                   type === 'book' ? (language === 'ar' ? 'كتاب' : 'Book') :
                   type === 'tool' ? (language === 'ar' ? 'أداة' : 'Tool') :
                   type === 'course' ? (language === 'ar' ? 'دورة' : 'Course') :
                   type === 'link' ? (language === 'ar' ? 'رابط' : 'Link') : type}
                </option>
              ))}
            </select>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
              {resourceCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedCategory('all');
              }}
            >
              {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
            </Button>
          </div>
        </motion.div>

        {/* Resources Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredResources.map((resource, index) => (
            <motion.div
              key={`${resource.source}-${resource.id || index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-200">
                <div className="p-6">
                  {/* Resource Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                        {getTypeIcon(resource.type)}
                      </div>
                      <div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          resource.source === 'plan' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {resource.source === 'plan' ? (language === 'ar' ? 'من الخطة' : 'From Plan') : (language === 'ar' ? 'مضاف' : 'Added')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => window.open(resource.url, '_blank')}
                      />
                      {resource.source === 'user' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<Edit2 className="w-4 h-4" />}
                            onClick={() => openEditModal(resource)}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => handleDeleteResource(resource.id)}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Resource Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {resource.title}
                    </h3>
                    {resource.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-3">
                        {resource.description}
                      </p>
                    )}
                  </div>

                  {/* Resource Meta */}
                  <div className="space-y-2 mb-4">
                    {resource.dayName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{resource.dayName}</span>
                        {resource.weekNumber && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {language === 'ar' ? 'الأسبوع' : 'Week'} {resource.weekNumber}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {resource.topic && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Target className="w-4 h-4" />
                        <span className="line-clamp-1">{resource.topic}</span>
                      </div>
                    )}
                  </div>

                  {/* Resource Tags */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs rounded-full ${getTypeColor(resource.type)}`}>
                      {resource.type === 'article' ? (language === 'ar' ? 'مقال' : 'Article') :
                       resource.type === 'video' ? (language === 'ar' ? 'فيديو' : 'Video') :
                       resource.type === 'book' ? (language === 'ar' ? 'كتاب' : 'Book') :
                       resource.type === 'tool' ? (language === 'ar' ? 'أداة' : 'Tool') :
                       resource.type === 'course' ? (language === 'ar' ? 'دورة' : 'Course') :
                       resource.type === 'link' ? (language === 'ar' ? 'رابط' : 'Link') : resource.type}
                    </span>
                    {resource.category && (
                      <span className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        {resource.category}
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      icon={<ExternalLink className="w-4 h-4" />}
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      {language === 'ar' ? 'فتح المورد' : 'Open Resource'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'لا توجد موارد' : 'No Resources Found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {language === 'ar' ? 'جرب تغيير معايير البحث أو إضافة مورد جديد.' : 'Try changing your search criteria or add a new resource.'}
            </p>
            <Button variant="primary" onClick={openAddModal}>
              {language === 'ar' ? 'إضافة مورد جديد' : 'Add New Resource'}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Resource Modal */}
      <Modal
        isOpen={showAddModal || !!editingResource}
        onClose={() => {
          setShowAddModal(false);
          setEditingResource(null);
          setResourceForm({
            title: '', url: '', type: 'article', description: '', category: '',
            weekId: '', dayKey: '', phaseId: ''
          });
        }}
        title={editingResource ? (language === 'ar' ? 'تعديل المورد' : 'Edit Resource') : (language === 'ar' ? 'إضافة مورد جديد' : 'Add New Resource')}
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'عنوان المورد' : 'Resource Title'}
            </label>
            <input
              type="text"
              value={resourceForm.title}
              onChange={(e) => setResourceForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={language === 'ar' ? 'أدخل عنوان المورد' : 'Enter resource title'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'رابط المورد' : 'Resource URL'}
            </label>
            <input
              type="url"
              value={resourceForm.url}
              onChange={(e) => setResourceForm(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={language === 'ar' ? 'أدخل رابط المورد' : 'Enter resource URL'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'نوع المورد' : 'Resource Type'}
              </label>
              <select
                value={resourceForm.type}
                onChange={(e) => setResourceForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="article">{language === 'ar' ? 'مقال' : 'Article'}</option>
                <option value="video">{language === 'ar' ? 'فيديو' : 'Video'}</option>
                <option value="book">{language === 'ar' ? 'كتاب' : 'Book'}</option>
                <option value="tool">{language === 'ar' ? 'أداة' : 'Tool'}</option>
                <option value="course">{language === 'ar' ? 'دورة' : 'Course'}</option>
                <option value="link">{language === 'ar' ? 'رابط' : 'Link'}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'الفئة' : 'Category'}
              </label>
              <input
                type="text"
                value={resourceForm.category}
                onChange={(e) => setResourceForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={language === 'ar' ? 'أدخل الفئة (اختياري)' : 'Enter category (optional)'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'وصف المورد' : 'Resource Description'}
            </label>
            <textarea
              value={resourceForm.description}
              onChange={(e) => setResourceForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={language === 'ar' ? 'أدخل وصف المورد (اختياري)' : 'Enter resource description (optional)'}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setEditingResource(null);
                setResourceForm({
                  title: '', url: '', type: 'article', description: '', category: '',
                  weekId: '', dayKey: '', phaseId: ''
                });
              }}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              onClick={editingResource ? handleUpdateResource : handleAddResource}
              disabled={!resourceForm.title.trim() || !resourceForm.url.trim()}
            >
              {editingResource ? (language === 'ar' ? 'تحديث المورد' : 'Update Resource') : (language === 'ar' ? 'إضافة المورد' : 'Add Resource')}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
};

export default ResourcesPage;