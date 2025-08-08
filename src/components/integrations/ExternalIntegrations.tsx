import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Share2, Calendar, Mail, Twitter, Facebook, 
  Linkedin, Github, ExternalLink, Settings, Zap, Globe, Smartphone,
  Monitor, Cloud, Database, Lock, Unlock, Eye, EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useStorageManager } from '../../hooks/useAdvancedLocalStorage';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { animations } from '../../constants/theme';

interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
  apiKey?: string;
  webhookUrl?: string;
  settings: Record<string, any>;
}

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: any;
  extension: string;
  mimeType: string;
}

export default function ExternalIntegrations() {
  const { t } = useLocalization();
  const { plan, progress, lang } = useApp();
  const storageManager = useStorageManager();
  
  // State
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync your learning schedule with Google Calendar',
      icon: Calendar,
      enabled: false,
      settings: { autoSync: true, reminderTime: 15 }
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Export your notes and progress to Notion',
      icon: FileText,
      enabled: false,
      settings: { databaseId: '', autoExport: false }
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications and share progress on Slack',
      icon: Share2,
      enabled: false,
      settings: { channel: '', notifications: true }
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Track your learning progress in GitHub',
      icon: Github,
      enabled: false,
      settings: { repository: '', branch: 'main' }
    }
  ]);
  
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  const exportFormats: ExportFormat[] = [
    {
      id: 'pdf',
      name: 'PDF Report',
      description: 'Export as a professional PDF report',
      icon: FileText,
      extension: 'pdf',
      mimeType: 'application/pdf'
    },
    {
      id: 'csv',
      name: 'CSV Data',
      description: 'Export raw data as CSV for analysis',
      icon: FileText,
      extension: 'csv',
      mimeType: 'text/csv'
    },
    {
      id: 'json',
      name: 'JSON Backup',
      description: 'Export complete data backup',
      icon: Database,
      extension: 'json',
      mimeType: 'application/json'
    },
    {
      id: 'html',
      name: 'HTML Report',
      description: 'Export as interactive HTML report',
      icon: Globe,
      extension: 'html',
      mimeType: 'text/html'
    }
  ];

  // Handlers
  const toggleIntegration = useCallback((integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, enabled: !integration.enabled }
        : integration
    ));
  }, []);

  const configureIntegration = useCallback((integration: IntegrationConfig) => {
    setSelectedIntegration(integration);
    setApiKey(integration.apiKey || '');
    setWebhookUrl(integration.webhookUrl || '');
    setShowIntegrationModal(true);
  }, []);

  const saveIntegrationConfig = useCallback(() => {
    if (!selectedIntegration) return;
    
    setIntegrations(prev => prev.map(integration => 
      integration.id === selectedIntegration.id 
        ? { 
            ...integration, 
            apiKey: apiKey || undefined,
            webhookUrl: webhookUrl || undefined
          }
        : integration
    ));
    
    setShowIntegrationModal(false);
    setSelectedIntegration(null);
    setApiKey('');
    setWebhookUrl('');
  }, [selectedIntegration, apiKey, webhookUrl]);

  const exportData = useCallback(async (format: ExportFormat) => {
    setExportProgress(0);
    setShowExportModal(true);
    
    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Generate export data
      const exportData = generateExportData(format);
      
      // Create and download file
      const blob = new Blob([exportData.content], { type: format.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cyber-learning-${format.id}-${new Date().toISOString().split('T')[0]}.${format.extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportModal(false);
      setExportProgress(0);
    } catch (error) {
      console.error('Export failed:', error);
      setShowExportModal(false);
      setExportProgress(0);
    }
  }, []);

  const generateExportData = useCallback((format: ExportFormat) => {
    const safePlan = plan || [];
    const safeProgress = progress || [];
    
    const data = {
      metadata: {
        exportDate: new Date().toISOString(),
        format: format.id,
        version: '1.0.0',
        totalTasks: safePlan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).length,
        completedTasks: safeProgress.length,
        completionRate: safePlan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).length > 0 
          ? (safeProgress.length / safePlan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).length) * 100 
          : 0
      },
      plan: safePlan,
      progress: safeProgress
    };

    switch (format.id) {
      case 'pdf':
        return {
          content: generatePDFContent(data),
          mimeType: 'application/pdf'
        };
      case 'csv':
        return {
          content: generateCSVContent(data),
          mimeType: 'text/csv'
        };
      case 'json':
        return {
          content: JSON.stringify(data, null, 2),
          mimeType: 'application/json'
        };
      case 'html':
        return {
          content: generateHTMLContent(data),
          mimeType: 'text/html'
        };
      default:
        return {
          content: JSON.stringify(data, null, 2),
          mimeType: 'application/json'
        };
    }
  }, [plan, progress]);

  const generatePDFContent = useCallback((data: any) => {
    // Mock PDF content - in real implementation, use a library like jsPDF
    return `PDF Report - Cybersecurity Learning Progress
Generated: ${new Date().toLocaleDateString()}
Total Tasks: ${data.metadata.totalTasks}
Completed Tasks: ${data.metadata.completedTasks}
Completion Rate: ${data.metadata.completionRate.toFixed(1)}%
`;
  }, []);

  const generateCSVContent = useCallback((data: any) => {
    const headers = ['Task ID', 'Task Title', 'Week', 'Day', 'Completed', 'Completion Date'];
    const rows = data.plan.flatMap((week: any, weekIndex: number) =>
      week.days?.flatMap((day: any, dayIndex: number) =>
        day.tasks?.map((task: any) => {
          const progress = data.progress.find((p: any) => p.taskId === task.id);
          return [
            task.id,
            task.title,
            week.week,
            day.day?.[lang] || dayIndex + 1,
            progress ? 'Yes' : 'No',
            progress ? new Date(progress.completedAt).toLocaleDateString() : ''
          ];
        }) || []
      ) || []
    );
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }, [lang]);

  const generateHTMLContent = useCallback((data: any) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Cybersecurity Learning Progress Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: #007bff; transition: width 0.3s; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Cybersecurity Learning Progress Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <h3>${data.metadata.totalTasks}</h3>
            <p>Total Tasks</p>
        </div>
        <div class="stat-card">
            <h3>${data.metadata.completedTasks}</h3>
            <p>Completed Tasks</p>
        </div>
        <div class="stat-card">
            <h3>${data.metadata.completionRate.toFixed(1)}%</h3>
            <p>Completion Rate</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${data.metadata.completionRate}%"></div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }, []);

  const shareProgress = useCallback((platform: string) => {
    const progressText = `I've completed ${progress?.length || 0} cybersecurity learning tasks! 🚀`;
    const url = window.location.href;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(progressText)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent('My Cybersecurity Learning Progress')}&body=${encodeURIComponent(progressText + '\n\n' + url)}`
    };
    
    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
  }, [progress]);

  const syncWithCalendar = useCallback(async () => {
    try {
      // Simulate calendar sync
      console.log('Syncing with calendar...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Calendar sync completed');
    } catch (error) {
      console.error('Calendar sync failed:', error);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('externalIntegrations')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('connectWithExternalTools')}</p>
        </div>
        <Button icon={<Zap />} onClick={() => setShowExportModal(true)}>
          {t('exportData')}
        </Button>
      </div>

      {/* Integrations */}
      <motion.div {...animations.fadeIn}>
        <Card title={t('integrations')} subtitle={t('connectYourTools')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map(integration => {
              const IconComponent = integration.icon;
              return (
                <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${integration.enabled ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <IconComponent className={`w-5 h-5 ${integration.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{integration.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => configureIntegration(integration)}
                    >
                      {t('configure')}
                    </Button>
                    <button
                      onClick={() => toggleIntegration(integration.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        integration.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          integration.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Export Options */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.1 }}>
        <Card title={t('exportOptions')} subtitle={t('exportYourData')}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {exportFormats.map(format => {
              const IconComponent = format.icon;
              return (
                <Button
                  key={format.id}
                  variant="outline"
                  icon={<IconComponent className="w-4 h-4" />}
                  onClick={() => exportData(format)}
                  className="h-20 flex-col space-y-2"
                >
                  <span>{format.name}</span>
                  <span className="text-xs text-gray-500">{format.description}</span>
                </Button>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Social Sharing */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.2 }}>
        <Card title={t('socialSharing')} subtitle={t('shareYourProgress')}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              icon={<Twitter className="w-4 h-4" />}
              onClick={() => shareProgress('twitter')}
              className="h-16 flex-col space-y-2"
            >
              <span>Twitter</span>
            </Button>
            
            <Button
              variant="outline"
              icon={<Facebook className="w-4 h-4" />}
              onClick={() => shareProgress('facebook')}
              className="h-16 flex-col space-y-2"
            >
              <span>Facebook</span>
            </Button>
            
            <Button
              variant="outline"
              icon={<Linkedin className="w-4 h-4" />}
              onClick={() => shareProgress('linkedin')}
              className="h-16 flex-col space-y-2"
            >
              <span>LinkedIn</span>
            </Button>
            
            <Button
              variant="outline"
              icon={<Mail className="w-4 h-4" />}
              onClick={() => shareProgress('email')}
              className="h-16 flex-col space-y-2"
            >
              <span>Email</span>
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.3 }}>
        <Card title={t('quickActions')} subtitle={t('commonIntegrations')}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              icon={<Calendar className="w-4 h-4" />}
              onClick={syncWithCalendar}
              className="h-16 flex-col space-y-2"
            >
              <span>{t('syncCalendar')}</span>
            </Button>
            
            <Button
              variant="outline"
              icon={<Download className="w-4 h-4" />}
              onClick={() => exportData(exportFormats[0])}
              className="h-16 flex-col space-y-2"
            >
              <span>{t('downloadReport')}</span>
            </Button>
            
            <Button
              variant="outline"
              icon={<Share2 className="w-4 h-4" />}
              onClick={() => shareProgress('twitter')}
              className="h-16 flex-col space-y-2"
            >
              <span>{t('shareProgress')}</span>
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Modals */}
      
      {/* Integration Configuration Modal */}
      <Modal
        isOpen={showIntegrationModal}
        onClose={() => setShowIntegrationModal(false)}
        title={selectedIntegration ? `Configure ${selectedIntegration.name}` : t('configureIntegration')}
      >
        <div className="space-y-4">
          {selectedIntegration && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter API key"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter webhook URL"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowIntegrationModal(false)}>
                  {t('cancel')}
                </Button>
                <Button onClick={saveIntegrationConfig}>
                  {t('save')}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Export Progress Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={t('exportingData')}
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Download className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('preparingExport')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('exportProgressDescription')}
            </p>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {exportProgress}% {t('complete')}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}