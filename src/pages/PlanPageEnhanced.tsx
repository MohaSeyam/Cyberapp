import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers, Calendar, ChevronRight, Home, ArrowLeft, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import PhasesList from '../components/phases/PhasesList';
import PhaseDetails from '../components/phases/PhaseDetails';
import { phaseService } from '../services/phaseService';
import { animations } from '../constants/theme';
import { WeekPhaseProvider } from '../components/WeekPhaseProvider';
import WeeksPage from '../components/weeks/WeeksPage';

// Breadcrumbs component
function Breadcrumbs({ items, onNavigate }) {
  return (
    <nav className="flex items-center space-x-2 mb-6 text-sm">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center">
          {idx > 0 && <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />}
          {item.onClick ? (
            <button onClick={item.onClick} className="text-blue-600 dark:text-blue-400 hover:underline">
              {item.icon && <item.icon className="inline w-4 h-4 mr-1" />} {item.label}
            </button>
          ) : (
            <span className="text-gray-700 dark:text-gray-200 font-semibold">
              {item.icon && <item.icon className="inline w-4 h-4 mr-1" />} {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

type ViewMode = 'phases' | 'weeks' | 'days';

export default function PlanPageEnhanced() {
  const { plan, progress, lang } = useApp();
  const { t } = useLocalization();
  
  // فحص البيانات الأساسية
  if (!plan || !Array.isArray(plan) || plan.length === 0) {
    return (
      <PageLayout title={t('plan')} subtitle={t('learningPlan')} showHeader={true}>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('loading')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('loadingPlanData')}
          </p>
        </div>
      </PageLayout>
    );
  }

  // فحص phaseService
  if (!phaseService) {
    return (
      <PageLayout title={t('plan')} subtitle={t('learningPlan')} showHeader={true}>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('error')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('serviceNotAvailable')}
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <WeekPhaseProvider>
      <WeeksPage />
    </WeekPhaseProvider>
  );
}