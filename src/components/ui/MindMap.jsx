import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Link, Edit2, Trash2, Save, RotateCcw } from 'lucide-react';
import { useSimpleLocalization } from '../../context/SimpleLocalizationContext';

const MindMap = ({ data, onSave, onClose }) => {
  const [nodes, setNodes] = useState(data?.nodes || []);
  const [connections, setConnections] = useState(data?.connections || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  
  // Safe access to useSimpleLocalization
  let localizationData;
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    console.error('Error accessing useSimpleLocalization:', error);
    localizationData = {
      language: 'ar',
      direction: 'rtl',
      isRTL: true,
      toggleLanguage: () => {}
    };
  }
  const { language } = localizationData;

  // Initialize with default central node if empty
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes([{
        id: '1',
        title: language === 'ar' ? 'الموضوع الرئيسي' : 'Main Topic',
        content: language === 'ar' ? 'ابدأ هنا' : 'Start here',
        x: 400,
        y: 300,
        color: '#3B82F6',
        size: 'large'
      }]);
    }
  }, [language]);

  // Handle mouse events for panning
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        setPan(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
      }
      
      if (isConnecting) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          setMousePosition({
            x: (e.clientX - rect.left - pan.x) / zoom,
            y: (e.clientY - rect.top - pan.y) / zoom
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging || isConnecting) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isConnecting, dragStart, pan, zoom]);

  // Handle zoom with mouse wheel
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prev => Math.max(0.3, Math.min(2, prev * delta)));
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const addNode = (parentId = null) => {
    const newNode = {
      id: Date.now().toString(),
      title: language === 'ar' ? 'مفهوم جديد' : 'New Concept',
      content: language === 'ar' ? 'أضف المحتوى هنا' : 'Add content here',
      x: parentId ? nodes.find(n => n.id === parentId)?.x + 200 : 400,
      y: parentId ? nodes.find(n => n.id === parentId)?.y : 300,
      color: getRandomColor(),
      size: 'medium'
    };

    setNodes(prev => [...prev, newNode]);

    if (parentId) {
      const newConnection = {
        id: `conn-${parentId}-${newNode.id}`,
        from: parentId,
        to: newNode.id,
        type: 'solid'
      };
      setConnections(prev => [...prev, newConnection]);
    }
  };

  const updateNode = (id, updates) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, ...updates } : node
    ));
  };

  const deleteNode = (id) => {
    setNodes(prev => prev.filter(node => node.id !== id));
    setConnections(prev => prev.filter(conn => conn.from !== id && conn.to !== id));
  };

  const startConnection = (nodeId) => {
    setIsConnecting(true);
    setConnectionStart(nodeId);
  };

  const finishConnection = (nodeId) => {
    if (isConnecting && connectionStart && connectionStart !== nodeId) {
      const newConnection = {
        id: `conn-${connectionStart}-${nodeId}`,
        from: connectionStart,
        to: nodeId,
        type: 'dashed'
      };
      setConnections(prev => [...prev, newConnection]);
    }
    setIsConnecting(false);
    setConnectionStart(null);
  };

  const deleteConnection = (connectionId) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  };

  const getRandomColor = () => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#06B6D4', '#F97316', '#EC4899'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ nodes, connections });
    }
  };

  const handleReset = () => {
    setNodes([{
      id: '1',
      title: language === 'ar' ? 'الموضوع الرئيسي' : 'Main Topic',
      content: language === 'ar' ? 'ابدأ هنا' : 'Start here',
      x: 400,
      y: 300,
      color: '#3B82F6',
      size: 'large'
    }]);
    setConnections([]);
  };

  const renderConnection = (connection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return null;

    const isSelected = selectedNode === connection.from || selectedNode === connection.to;
    const isConnectingFrom = connectionStart === connection.from || connectionStart === connection.to;

    return (
      <motion.line
        key={connection.id}
        x1={fromNode.x}
        y1={fromNode.y}
        x2={toNode.x}
        y2={toNode.y}
        stroke={isSelected || isConnectingFrom ? '#3B82F6' : '#9CA3AF'}
        strokeWidth={isSelected ? 3 : 2}
        strokeDasharray={connection.type === 'dashed' ? '5,5' : 'none'}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
        className="cursor-pointer"
        onClick={() => deleteConnection(connection.id)}
      />
    );
  };

  const renderNode = (node) => {
    const isSelected = selectedNode === node.id;
    const isConnecting = connectionStart === node.id;
    const isEditingThis = editingNode === node.id;

    return (
      <motion.g
        key={node.id}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Node Circle */}
        <circle
          cx={node.x}
          cy={node.y}
          r={node.size === 'large' ? 60 : node.size === 'medium' ? 45 : 35}
          fill={node.color}
          stroke={isSelected ? '#3B82F6' : '#FFFFFF'}
          strokeWidth={isSelected ? 3 : 2}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setSelectedNode(node.id)}
          onDoubleClick={() => {
            setEditingNode(node.id);
            setIsEditing(true);
          }}
        />

        {/* Node Title */}
        <text
          x={node.x}
          y={node.y - 10}
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="12"
          fontWeight="bold"
          className="pointer-events-none select-none"
        >
          {node.title}
        </text>

        {/* Node Content */}
        <text
          x={node.x}
          y={node.y + 10}
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="10"
          className="pointer-events-none select-none"
        >
          {node.content.substring(0, 15)}...
        </text>

        {/* Connection Button */}
        <circle
          cx={node.x + (node.size === 'large' ? 70 : node.size === 'medium' ? 55 : 45)}
          cy={node.y}
          r="8"
          fill={isConnecting ? '#EF4444' : '#10B981'}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => isConnecting ? finishConnection(node.id) : startConnection(node.id)}
        />

        {/* Add Child Button */}
        <circle
          cx={node.x}
          cy={node.y + (node.size === 'large' ? 70 : node.size === 'medium' ? 55 : 45)}
          r="8"
          fill="#3B82F6"
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => addNode(node.id)}
        >
          <title>{language === 'ar' ? 'إضافة مفهوم فرعي' : 'Add child concept'}</title>
        </circle>

        {/* Edit Button */}
        {isSelected && (
          <circle
            cx={node.x - (node.size === 'large' ? 70 : node.size === 'medium' ? 55 : 45)}
            cy={node.y}
            r="8"
            fill="#F59E0B"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setEditingNode(node.id);
              setIsEditing(true);
            }}
          >
            <title>{language === 'ar' ? 'تعديل' : 'Edit'}</title>
          </circle>
        )}

        {/* Delete Button */}
        {isSelected && (
          <circle
            cx={node.x}
            cy={node.y - (node.size === 'large' ? 70 : node.size === 'medium' ? 55 : 45)}
            r="8"
            fill="#EF4444"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => deleteNode(node.id)}
          >
            <title>{language === 'ar' ? 'حذف' : 'Delete'}</title>
          </circle>
        )}
      </motion.g>
    );
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'خريطة المفاهيم' : 'Mind Map'}
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={language === 'ar' ? 'إعادة تعيين' : 'Reset'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleSave}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={language === 'ar' ? 'حفظ' : 'Save'}
            >
              <Save className="w-4 h-4" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={language === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="absolute inset-0 pt-16 cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => {
          if (e.target === canvasRef.current) {
            setIsDragging(true);
            setDragStart({ x: e.clientX, y: e.clientY });
          }
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Connections */}
          {connections.map(renderConnection)}
          
          {/* Nodes */}
          {nodes.map(renderNode)}
          
          {/* Connection Preview */}
          {isConnecting && connectionStart && (
            <line
              x1={nodes.find(n => n.id === connectionStart)?.x || 0}
              y1={nodes.find(n => n.id === connectionStart)?.y || 0}
              x2={mousePosition.x}
              y2={mousePosition.y}
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
        </svg>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && editingNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {language === 'ar' ? 'تعديل المفهوم' : 'Edit Concept'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'العنوان' : 'Title'}
                  </label>
                  <input
                    type="text"
                    value={nodes.find(n => n.id === editingNode)?.title || ''}
                    onChange={(e) => updateNode(editingNode, { title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'المحتوى' : 'Content'}
                  </label>
                  <textarea
                    value={nodes.find(n => n.id === editingNode)?.content || ''}
                    onChange={(e) => updateNode(editingNode, { content: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'اللون' : 'Color'}
                  </label>
                  <input
                    type="color"
                    value={nodes.find(n => n.id === editingNode)?.color || '#3B82F6'}
                    onChange={(e) => updateNode(editingNode, { color: e.target.value })}
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          {language === 'ar' ? 'التعليمات' : 'Instructions'}
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• {language === 'ar' ? 'انقر مرتين لتعديل المفهوم' : 'Double-click to edit concept'}</li>
          <li>• {language === 'ar' ? 'اسحب للتنقل' : 'Drag to pan'}</li>
          <li>• {language === 'ar' ? 'Ctrl+Scroll للتكبير/التصغير' : 'Ctrl+Scroll to zoom'}</li>
          <li>• {language === 'ar' ? 'انقر على الأزرار الملونة للوظائف' : 'Click colored buttons for actions'}</li>
        </ul>
      </div>
    </div>
  );
};

export default MindMap;