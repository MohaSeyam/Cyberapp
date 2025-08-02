import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Shield, BookOpen, X } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function ResourcePreviewPage() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // استخراج بيانات المورد من URL parameters
  React.useEffect(() => {
    if (resourceId) {
      try {
        const decodedResource = JSON.parse(decodeURIComponent(resourceId));
        setResource(decodedResource);
      } catch (error) {
        console.error('Error parsing resource data:', error);
        toast.error('خطأ في تحميل بيانات المورد');
      } finally {
        setIsLoading(false);
      }
    }
  }, [resourceId]);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const openResourceInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <PageLayout title="جاري التحميل">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            جاري تحميل المورد...
          </p>
        </div>
      </PageLayout>
    );
  }

  if (!resource || !isValidUrl(resource.url)) {
    return (
      <PageLayout title="مورد غير صالح">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            المورد غير صالح
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            الرابط غير صحيح أو المورد غير موجود
          </p>
          <Button onClick={() => navigate(-1)} variant="primary">
            العودة للصفحة السابقة
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={resource.title}>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              icon={<ArrowLeft />}
            >
              العودة
            </Button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                  <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {resource.title}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {resource.url}
                  </p>
                </div>
              </div>
              
              <Button
                variant="primary"
                onClick={() => openResourceInNewTab(resource.url)}
                icon={<ExternalLink />}
              >
                فتح في تبويب جديد
              </Button>
            </div>
          </div>
        </div>

        {/* Security Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-3">
          <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">
              تحذير أمني: يتم عرض المحتوى من موقع خارجي
            </span>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 relative">
          <iframe
            src={resource.url}
            className="w-full h-full border-0"
            title={resource.title}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
            onError={() => {
              toast.error('فشل في تحميل المعاينة. قد يكون الموقع لا يدعم العرض في iframe');
            }}
          />
        </div>
      </div>
    </PageLayout>
  );
}