import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, Play, Copy, Check, AlertCircle, Database, Settings, 
  Terminal, Globe, Lock, Unlock, Eye, EyeOff, Download, Upload, RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useStorageManager } from '../hooks/useAdvancedLocalStorage';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { animations } from '../constants/theme';

interface APIEndpoint {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  response: any;
  example: string;
}

interface APITest {
  endpoint: string;
  method: string;
  params: Record<string, any>;
  headers: Record<string, string>;
  response: any;
  status: 'idle' | 'loading' | 'success' | 'error';
  timestamp: number;
}

export default function DevelopmentAPI() {
  const { t } = useLocalization();
  const { plan, progress, lang } = useApp();
  const storageManager = useStorageManager();
  
  // State
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [apiKey, setApiKey] = useState('dev-api-key-2024');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testHistory, setTestHistory] = useState<APITest[]>([]);
  const [baseUrl, setBaseUrl] = useState('https://api.cyberlearning.app/v1');

  // API Endpoints
  const endpoints: APIEndpoint[] = [
    {
      id: 'get-plan',
      name: 'Get Learning Plan',
      description: 'Retrieve the complete learning plan structure',
      method: 'GET',
      path: '/plan',
      response: {
        success: true,
        data: {
          weeks: plan || [],
          totalWeeks: plan?.length || 0,
          totalTasks: plan?.flatMap(w => w.days || []).flatMap(d => d.tasks || []).length || 0
        }
      },
      example: `curl -X GET "${baseUrl}/plan" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`
    },
    {
      id: 'get-progress',
      name: 'Get User Progress',
      description: 'Retrieve user progress and completion status',
      method: 'GET',
      path: '/progress',
      response: {
        success: true,
        data: {
          completedTasks: progress || [],
          totalCompleted: progress?.length || 0,
          completionRate: plan?.flatMap(w => w.days || []).flatMap(d => d.tasks || []).length > 0 
            ? (progress?.length || 0) / plan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).length * 100 
            : 0
        }
      },
      example: `curl -X GET "${baseUrl}/progress" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`
    },
    {
      id: 'update-task',
      name: 'Update Task Status',
      description: 'Mark a task as completed or update its status',
      method: 'POST',
      path: '/tasks/{taskId}/complete',
      parameters: [
        {
          name: 'taskId',
          type: 'string',
          required: true,
          description: 'The ID of the task to update'
        },
        {
          name: 'completed',
          type: 'boolean',
          required: true,
          description: 'Whether the task is completed'
        },
        {
          name: 'notes',
          type: 'string',
          required: false,
          description: 'Optional notes about the task completion'
        }
      ],
      response: {
        success: true,
        data: {
          taskId: 'task-123',
          completed: true,
          completedAt: new Date().toISOString(),
          notes: 'Task completed successfully'
        }
      },
      example: `curl -X POST "${baseUrl}/tasks/task-123/complete" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "completed": true,
    "notes": "Task completed successfully"
  }'`
    },
    {
      id: 'get-analytics',
      name: 'Get Analytics',
      description: 'Retrieve detailed analytics and statistics',
      method: 'GET',
      path: '/analytics',
      parameters: [
        {
          name: 'timeframe',
          type: 'string',
          required: false,
          description: 'Timeframe for analytics (week, month, year)'
        },
        {
          name: 'includeDetails',
          type: 'boolean',
          required: false,
          description: 'Include detailed breakdown'
        }
      ],
      response: {
        success: true,
        data: {
          completionRate: 75.5,
          totalTasks: 100,
          completedTasks: 75,
          currentStreak: 7,
          longestStreak: 15,
          averageTaskTime: 45,
          taskTypeDistribution: {
            blueTeam: 25,
            redTeam: 20,
            practical: 30
          }
        }
      },
      example: `curl -X GET "${baseUrl}/analytics?timeframe=month&includeDetails=true" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`
    },
    {
      id: 'export-data',
      name: 'Export Data',
      description: 'Export user data in various formats',
      method: 'POST',
      path: '/export',
      parameters: [
        {
          name: 'format',
          type: 'string',
          required: true,
          description: 'Export format (json, csv, pdf)'
        },
        {
          name: 'includeProgress',
          type: 'boolean',
          required: false,
          description: 'Include progress data'
        }
      ],
      response: {
        success: true,
        data: {
          downloadUrl: 'https://api.cyberlearning.app/downloads/export-123.json',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          format: 'json',
          size: '2.5MB'
        }
      },
      example: `curl -X POST "${baseUrl}/export" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "format": "json",
    "includeProgress": true
  }'`
    }
  ];

  // Handlers
  const testEndpoint = useCallback(async (endpoint: APIEndpoint, params: Record<string, any> = {}) => {
    const test: APITest = {
      endpoint: endpoint.path,
      method: endpoint.method,
      params,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      response: null,
      status: 'loading',
      timestamp: Date.now()
    };

    setTestHistory(prev => [test, ...prev.slice(0, 9)]); // Keep last 10 tests

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Mock response based on endpoint
      let response;
      switch (endpoint.id) {
        case 'get-plan':
          response = {
            success: true,
            data: {
              weeks: plan || [],
              totalWeeks: plan?.length || 0,
              totalTasks: plan?.flatMap(w => w.days || []).flatMap(d => d.tasks || []).length || 0
            }
          };
          break;
        case 'get-progress':
          response = {
            success: true,
            data: {
              completedTasks: progress || [],
              totalCompleted: progress?.length || 0,
              completionRate: plan?.flatMap(w => w.days || []).flatMap(d => d.tasks || []).length > 0 
                ? (progress?.length || 0) / plan.flatMap(w => w.days || []).flatMap(d => d.tasks || []).length * 100 
                : 0
            }
          };
          break;
        case 'update-task':
          response = {
            success: true,
            data: {
              taskId: params.taskId || 'task-123',
              completed: params.completed || true,
              completedAt: new Date().toISOString(),
              notes: params.notes || 'Task completed successfully'
            }
          };
          break;
        case 'get-analytics':
          response = {
            success: true,
            data: {
              completionRate: 75.5,
              totalTasks: 100,
              completedTasks: 75,
              currentStreak: 7,
              longestStreak: 15,
              averageTaskTime: 45,
              taskTypeDistribution: {
                blueTeam: 25,
                redTeam: 20,
                practical: 30
              }
            }
          };
          break;
        case 'export-data':
          response = {
            success: true,
            data: {
              downloadUrl: 'https://api.cyberlearning.app/downloads/export-123.json',
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              format: params.format || 'json',
              size: '2.5MB'
            }
          };
          break;
        default:
          response = { success: false, error: 'Unknown endpoint' };
      }

      setTestHistory(prev => prev.map(t => 
        t.timestamp === test.timestamp 
          ? { ...t, response, status: 'success' }
          : t
      ));
    } catch (error) {
      setTestHistory(prev => prev.map(t => 
        t.timestamp === test.timestamp 
          ? { ...t, response: { success: false, error: error instanceof Error ? error.message : 'Request failed' }, status: 'error' }
          : t
      ));
    }
  }, [apiKey, plan, progress]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const generateApiKey = useCallback(() => {
    const newKey = 'dev-api-key-' + Math.random().toString(36).substr(2, 9);
    setApiKey(newKey);
  }, []);

  const downloadSDK = useCallback(() => {
    const sdkCode = `
// CyberLearning API SDK
class CyberLearningAPI {
  constructor(apiKey, baseUrl = 'https://api.cyberlearning.app/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    return response.json();
  }

  async getPlan() {
    return this.request('/plan');
  }

  async getProgress() {
    return this.request('/progress');
  }

  async updateTask(taskId, data) {
    return this.request(\`/tasks/\${taskId}/complete\`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(\`/analytics?\${queryString}\`);
  }

  async exportData(format = 'json', options = {}) {
    return this.request('/export', {
      method: 'POST',
      body: JSON.stringify({ format, ...options })
    });
  }
}

// Usage example:
const api = new CyberLearningAPI('your-api-key');
const plan = await api.getPlan();
const progress = await api.getProgress();
`;
    
    const blob = new Blob([sdkCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cyberlearning-api-sdk.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('developmentAPI')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('apiDocumentationAndTesting')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" icon={<Download />} onClick={downloadSDK}>
            {t('downloadSDK')}
          </Button>
          <Button icon={<Code />} onClick={() => setShowTestModal(true)}>
            {t('testAPI')}
          </Button>
        </div>
      </div>

      {/* API Configuration */}
      <motion.div {...animations.fadeIn}>
        <Card title={t('apiConfiguration')} subtitle={t('configureYourAPI')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('baseUrl')}
              </label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('apiKey')}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={generateApiKey}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* API Endpoints */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.1 }}>
        <Card title={t('apiEndpoints')} subtitle={t('availableEndpoints')}>
          <div className="space-y-4">
            {endpoints.map(endpoint => (
              <div key={endpoint.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      endpoint.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono text-gray-900 dark:text-white">
                      {endpoint.path}
                    </code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Play className="w-4 h-4" />}
                      onClick={() => testEndpoint(endpoint)}
                    >
                      {t('test')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Copy className="w-4 h-4" />}
                      onClick={() => copyToClipboard(endpoint.example)}
                    >
                      {t('copy')}
                    </Button>
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  {endpoint.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {endpoint.description}
                </p>
                
                {endpoint.parameters && endpoint.parameters.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {t('parameters')}:
                    </h4>
                    <div className="space-y-1">
                      {endpoint.parameters.map(param => (
                        <div key={param.name} className="flex items-center space-x-2 text-sm">
                          <code className="font-mono text-gray-900 dark:text-white">
                            {param.name}
                          </code>
                          <span className="text-gray-500">({param.type})</span>
                          {param.required && (
                            <span className="text-red-500 text-xs">*</span>
                          )}
                          <span className="text-gray-600 dark:text-gray-400">
                            - {param.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white">
                    {t('exampleRequest')}
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                    <code>{endpoint.example}</code>
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Test History */}
      <motion.div {...animations.fadeIn} transition={{ delay: 0.2 }}>
        <Card title={t('testHistory')} subtitle={t('recentAPITests')}>
          <div className="space-y-3">
            {testHistory.length > 0 ? (
              testHistory.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      test.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      test.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      test.status === 'loading' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {test.method}
                    </span>
                    <code className="text-sm font-mono text-gray-900 dark:text-white">
                      {test.endpoint}
                    </code>
                    <span className="text-xs text-gray-500">
                      {new Date(test.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {test.status === 'loading' && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                    {test.status === 'success' && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                    {test.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    {test.response && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => {
                          console.log('API Response:', test.response);
                          alert(JSON.stringify(test.response, null, 2));
                        }}
                      >
                        {t('view')}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('noTestsYet')}</p>
                <p className="text-sm">{t('startTestingAPI')}</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Modals */}
      
      {/* Test Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title={t('testAPIEndpoint')}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('selectEndpoint')}
            </label>
            <select
              onChange={(e) => setSelectedEndpoint(endpoints.find(ep => ep.id === e.target.value) || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('selectAnEndpoint')}</option>
              {endpoints.map(endpoint => (
                <option key={endpoint.id} value={endpoint.id}>
                  {endpoint.method} {endpoint.path} - {endpoint.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedEndpoint && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {selectedEndpoint.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedEndpoint.description}
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowTestModal(false)}>
                  {t('cancel')}
                </Button>
                <Button onClick={() => {
                  testEndpoint(selectedEndpoint);
                  setShowTestModal(false);
                }}>
                  {t('runTest')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}