import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

// Lazy load chart components to reduce initial bundle size
const ProgressChart = lazy(() => import('./ProgressChart'));
const PieChartComponent = lazy(() => import('./PieChart'));

interface ChartWrapperProps {
  type: 'progress' | 'pie';
  data: any[];
  className?: string;
}

export default function ChartWrapper({ type, data, className = '' }: ChartWrapperProps) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {type === 'progress' && <ProgressChart data={data} className={className} />}
      {type === 'pie' && <PieChartComponent data={data} className={className} />}
    </Suspense>
  );
}