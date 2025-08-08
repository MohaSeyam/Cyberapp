// Day View Page - Enhanced with Week-Phase Integration
import React from 'react';
import { WeekPhaseProvider } from '../components/WeekPhaseProvider';
import DayViewPage from '../components/days/DayViewPage';

export default function DayViewPageEnhanced() {
  return (
    <WeekPhaseProvider>
      <DayViewPage />
    </WeekPhaseProvider>
  );
}