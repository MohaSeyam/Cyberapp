// Export Page - Separate from Progress Page
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, FileText, FileSpreadsheet, FileJson,
  Calendar, Clock, Database, Settings, ArrowDown, CheckCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { animations } from '../constants/theme';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  mimeType: string;
  extension: string;
}

export default function ExportPage() {
  const { plan, progress, appState } = useApp();
  const { t } = useLocalization();
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [lastExport, setLastExport] = useState<Date | null>(null);

  // Safe translation function
  const safeT = (key: string) => {
    try {
      return t ? t(key) : key;
    } catch (error) {
      console.warn('Translation function not available:', error);
      return key;
    }
  };

  const exportFormats: ExportFormat[] = [
    {
      id: 'json',
      name: safeT('jsonFormat'),
      description: safeT('jsonDescription'),
      icon: FileJson,
      mimeType: 'application/json',
      extension: 'json'
    },
    {
      id: 'csv',
      name: safeT('csvFormat'),
      description: safeT('csvDescription'),
      icon: FileSpreadsheet,
      mimeType: 'text/csv',
      extension: 'csv'
    },
    {
      id: 'pdf',
      name: safeT('pdfFormat'),
      description: safeT('pdfDescription'),
      icon: FileText, // استبدال FilePdf بـ FileText
      mimeType: 'application/pdf',
      extension: 'pdf'
    }
  ];

  const generateExportData = (format: ExportFormat) => {
    const data = {
      plan: plan || [],
      progress: progress || [],
      notes: appState?.notes || {},
      journal: appState?.journal || {},
      settings: appState?.settings || {},
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    switch (format.id) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return generateCSV(data);
      case 'pdf':
        return generatePDF(data);
      default:
        return JSON.stringify(data, null, 2);
    }
  };

  const generateCSV = (data: any) => {
    const headers = ['Task ID', 'Task Name', 'Week', 'Day', 'Status', 'Completed Date'];
    const rows = data.progress.map((p: any) => {
      const task = data.plan
        .flatMap((w: any) => w.days || [])
        .flatMap((d: any) => d.tasks || [])
        .find((t: any) => t.id === p.taskId);
      
      return [
        p.taskId,
        task?.title || 'Unknown Task',
        task?.week || 'Unknown',
        task?.day || 'Unknown',
        p.done ? 'Completed' : 'Pending',
        p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : ''
      ];
    });

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  const generatePDF = (data: any) => {
    // Simple HTML to PDF conversion
    const html = `
      <html>
        <head>
          <title>Cyber Security Journey Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .task { margin: 5px 0; padding: 5px; border-left: 3px solid #3b82f6; }
            .completed { border-left-color: #10b981; }
            .pending { border-left-color: #f59e0b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Cyber Security Journey Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Progress Summary</h2>
            <p>Total Tasks: ${data.plan.reduce((total: number, week: any) => 
              total + (week.days || []).filter((day: any) => day.key !== 'fri')
                .reduce((dayTotal: number, day: any) => dayTotal + (day.tasks || []).length, 0), 0
            )}</p>
            <p>Completed Tasks: ${data.progress.filter((p: any) => p.done).length}</p>
          </div>
          
          <div class="section">
            <h2>Recent Progress</h2>
            ${data.progress.slice(0, 10).map((p: any) => {
              const task = data.plan
                .flatMap((w: any) => w.days || [])
                .flatMap((d: any) => d.tasks || [])
                .find((t: any) => t.id === p.taskId);
              return `<div class="task ${p.done ? 'completed' : 'pending'}">
                <strong>${task?.title || 'Unknown Task'}</strong> - ${p.done ? 'Completed' : 'Pending'}
              </div>`;
            }).join('')}
          </div>
        </body>
      </html>
    `;
    
    return html;
  };

  const handleExport = async (format: ExportFormat) => {
    setExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 20) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const data = generateExportData(format);
      
      if (format.id === 'pdf') {
        // For PDF, we'll create a blob and download
        const blob = new Blob([data], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cyber-security-journey-${new Date().toISOString().split('T')[0]}.html`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // For JSON and CSV
        const blob = new Blob([data], { type: format.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cyber-security-journey-${new Date().toISOString().split('T')[0]}.${format.extension}`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setLastExport(new Date());
      setExportProgress(100);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
      }, 2000);

    } catch (error) {
      console.error('Export failed:', error);
      setExporting(false);
      setExportProgress(0);
    }
  };

  const getProgressStats = () => {
    const totalTasks = plan?.reduce((total, week) => 
      total + (week.days || []).filter(day => day.key !== 'fri')
        .reduce((dayTotal, day) => dayTotal + (day.tasks || []).length, 0), 0
    ) || 0;
    
    const completedTasks = progress?.filter(p => p.done).length || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return { totalTasks, completedTasks, completionRate };
  };

  const { totalTasks, completedTasks, completionRate } = getProgressStats();

  return (
    <PageLayout 
      title={safeT('exportData')}
      subtitle={safeT('exportDataDescription')}
    >
      <div className="space-y-6">
        {/* Progress Summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {safeT('progressSummary')}
            </h3>
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalTasks}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {safeT('totalTasks')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {completedTasks}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {safeT('completedTasks')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {completionRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {safeT('completionRate')}
              </div>
            </div>
          </div>
        </Card>

        {/* Export Formats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exportFormats.map((format) => {
            const Icon = format.icon;
            return (
              <Card key={format.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {format.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {format.description}
                    </p>
                    
                    <Button
                      onClick={() => handleExport(format)}
                      disabled={exporting}
                      className="w-full"
                      variant="outline"
                    >
                      {exporting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>{safeT('exporting')}... {exportProgress}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Download className="w-4 h-4" />
                          <span>{safeT('export')}</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Last Export Info */}
        {lastExport && (
          <Card>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {safeT('lastExport')}: {lastExport.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Export Tips */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {safeT('exportTips')}
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>{safeT('exportTip1')}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>{safeT('exportTip2')}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>{safeT('exportTip3')}</span>
            </li>
          </ul>
        </Card>
      </div>
    </PageLayout>
  );
}