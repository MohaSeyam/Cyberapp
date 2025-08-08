// Days Page - Enhanced with Week-Phase Integration
import React from 'react';
import { WeekPhaseProvider } from '../components/WeekPhaseProvider';
import DaysPage from '../components/days/DaysPage';

export default function DaysPageEnhanced() {
  return (
    <WeekPhaseProvider>
      <DaysPage />
    </WeekPhaseProvider>
  );
}