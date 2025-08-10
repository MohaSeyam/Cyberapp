import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, BookOpen, ExternalLink, FileText, Video, 
  Link, Download, Star, Calendar, Tag, Edit, Trash2, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const ResourcesPage = () => {
  const navigate = useNavigate();
  const { language } = useLocalization();
  const { resources, addResource, updateResource, deleteResource } = useApp();
  const isRTL = language === 'ar';

  // Ensure data is available
  const safeResources = resources || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [editingResource, setEditingResource] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    type: 'link',
    category: '',
    tags: [],
    rating: 0
  });

  // Get all unique categories and types
  const allCategories = useMemo(() => {
    const categories = new Set();
    safeResources.forEach(resource => {
      if (resource.category) {
        categories.add(resource.category);
      }
    });
    return Array.from(categories).sort();
  }, [safeResources]);

  const allTypes = useMemo(() => {
    const types = new Set();
    safeResources.forEach(resource => {
      if (resource.type) {
        types.add(resource.type);
      }
    });
    return Array.from(types).sort();
  }, [safeResources]);

  // Filter resources based on search, category, and type
  const filteredResources = useMemo(() => {
    return safeResources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || resource.category === selectedCategory;
      const matchesType = !selectedType || resource.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [safeResources, searchTerm, selectedCategory, selectedType]);

  const handleAddResource = async () => {
    if (!formData.title.trim() || !formData.url.trim()) {
      return;
    }

    try {
      await addResource({
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        url: '',
        type: 'link',
        category: '',
        tags: [],
        rating: 0
      });
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };

  const handleUpdateResource = async () => {
    if (!editingResource || !formData.title.trim() || !formData.url.trim()) {
      return;
    }

    try {
      await updateResource({
        ...editingResource,
        ...formData,
        updatedAt: new Date().toISOString()
      });
      setShowAddModal(false);
      setEditingResource(null);
      setFormData({
        title: '',
        description: '',
        url: '',
        type: 'link',
        category: '',
        tags: [],
        rating: 0
      });
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  };

  const handleDelete = async (resourceId) => {
    try {
      await deleteResource(resourceId);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title || '',
      description: resource.description || '',
      url: resource.url || '',
      type: resource.type || 'link',
      category: resource.category || '',
      tags: resource.tags || [],
      rating: resource.rating || 0
    });
    setShowAddModal(true);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'link':
        return <Link className="w-5 h-5 text-green-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'video':
        return language === 'ar' ? 'فيديو' : 'Video';
      case 'document':
        return language === 'ar' ? 'مستند' : 'Document';
      case 'link':
        return language === 'ar' ? 'رابط' : 'Link';
      default:
        return type;
    }
  };

  const typeOptions = [
    { value: 'link', label: { ar: 'رابط', en: 'Link' } },
    { value: 'video', label: { ar: 'فيديو', en: 'Video' } },
    { value: 'document', label: { ar: 'مستند', en: 'Document' } }
  ];

  const animations = {
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6 }
    },
    stagger: {
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    }
  };

  return (
    <PageLayout
      title={language === 'ar' ? 'المراجع' : 'Resources'}
      subtitle={language === 'ar' ? 'إدارة المراجع والموارد التعليمية' : 'Manage learning resources and references'}
    >
      <motion.div {...animations.fadeIn} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'المراجع' : 'Resources'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {language === 'ar' 
                ? `${safeResources.length} مرجع إجمالاً`
                : `${safeResources.length} total resources`
              }
            </p>
          </div>
          <Button
            variant="primary"
            icon={<Plus />}
            onClick={() => setShowAddModal(true)}
          >
            {language === 'ar' ? 'إضافة مرجع' : 'Add Resource'}
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={language === 'ar' ? 'البحث في المراجع...' : 'Search resources...'}
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="">
                  {language === 'ar' ? 'جميع الفئات' : 'All Categories'}
                </option>
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="">
                  {language === 'ar' ? 'جميع الأنواع' : 'All Types'}
                </option>
                {allTypes.map(type => (
                  <option key={type} value={type}>{getTypeLabel(type)}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Resources List */}
        <motion.div {...animations.stagger} className="space-y-4">
          {filteredResources.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'لا توجد مراجع' : 'No resources found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {language === 'ar' 
                  ? 'ابدأ بإضافة مرجعك الأول'
                  : 'Start by adding your first resource'
                }
              </p>
              <Button
                variant="primary"
                icon={<Plus />}
                onClick={() => setShowAddModal(true)}
              >
                {language === 'ar' ? 'إضافة مرجع' : 'Add Resource'}
              </Button>
            </Card>
          ) : (
            filteredResources.map(resource => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getTypeIcon(resource.type)}
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {resource.title}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Tag className="w-4 h-4" />
                              <span>{resource.category || (language === 'ar' ? 'بدون فئة' : 'No category')}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Star className="w-4 h-4" />
                              <span>{resource.rating}/5</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(resource.createdAt).toLocaleDateString(
                                  language === 'ar' ? 'ar-SA' : 'en-US'
                                )}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {resource.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {resource.description}
                        </p>
                      )}

                      {/* URL */}
                      <div className="mb-4">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm break-all flex items-center space-x-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>{resource.url}</span>
                        </a>
                      </div>

                      {/* Tags */}
                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {resource.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye />}
                          onClick={() => window.open(resource.url, '_blank')}
                        >
                          {language === 'ar' ? 'عرض' : 'View'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit />}
                          onClick={() => openEditModal(resource)}
                        >
                          {language === 'ar' ? 'تعديل' : 'Edit'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 />}
                          onClick={() => setShowDeleteModal(resource.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          {language === 'ar' ? 'حذف' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Add/Edit Resource Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingResource(null);
            setFormData({
              title: '',
              description: '',
              url: '',
              type: 'link',
              category: '',
              tags: [],
              rating: 0
            });
          }}
          title={editingResource ? (language === 'ar' ? 'تعديل المرجع' : 'Edit Resource') : (language === 'ar' ? 'إضافة مرجع جديد' : 'Add New Resource')}
        >
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'العنوان' : 'Title'}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={language === 'ar' ? 'أدخل عنوان المرجع...' : 'Enter resource title...'}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'الوصف' : 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={language === 'ar' ? 'أدخل وصف المرجع...' : 'Enter resource description...'}
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'الرابط' : 'URL'}
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={language === 'ar' ? 'أدخل رابط المرجع...' : 'Enter resource URL...'}
              />
            </div>

            {/* Type and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'النوع' : 'Type'}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {typeOptions.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label[language]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'الفئة' : 'Category'}
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={language === 'ar' ? 'أدخل الفئة...' : 'Enter category...'}
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'التقييم' : 'Rating'}
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className={`p-1 rounded ${
                      formData.rating >= star
                        ? 'text-yellow-500'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    <Star className="w-5 h-5" />
                  </button>
                ))}
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  {formData.rating}/5
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingResource(null);
                  setFormData({
                    title: '',
                    description: '',
                    url: '',
                    type: 'link',
                    category: '',
                    tags: [],
                    rating: 0
                  });
                }}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                onClick={editingResource ? handleUpdateResource : handleAddResource}
                disabled={!formData.title.trim() || !formData.url.trim()}
              >
                {editingResource ? (language === 'ar' ? 'تحديث' : 'Update') : (language === 'ar' ? 'إضافة' : 'Add')}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!showDeleteModal}
          onClose={() => setShowDeleteModal(null)}
          title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'ar' 
                ? 'هل أنت متأكد من حذف هذا المرجع؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this resource? This action cannot be undone.'
              }
            </p>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteModal(null)}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(showDeleteModal)}
              >
                {language === 'ar' ? 'حذف' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      </motion.div>
    </PageLayout>
  );
};

export default ResourcesPage;