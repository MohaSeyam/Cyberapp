import React, { createContext, useContext, ReactNode } from 'react';
import { weekPhaseService, WeekPhaseService, Phase, WeekData } from '../services/weekPhaseService';

interface WeekPhaseContextType {
  service: WeekPhaseService;
  getWeekWithPhase: (weekNumber: number) => (WeekData & { phase: number }) | undefined;
  getPhaseForWeek: (weekNumber: number) => Phase | undefined;
  getWeeksForPhase: (phaseId: number) => WeekData[];
  getCurrentPhase: (completedWeeks: number[]) => Phase | null;
  getPhaseProgress: (phaseId: number, completedWeeks: number[]) => number;
  getPhaseStats: (phaseId: number, completedWeeks: number[]) => {
    totalWeeks: number;
    completedWeeks: number;
    progress: number;
    remainingWeeks: number;
  };
  validateWeekPhaseAssignment: (weekNumber: number, phaseId: number) => boolean;
  getValidationErrors: () => Array<{ week: number; currentPhase: number; correctPhase: number }>;
}

const WeekPhaseContext = createContext<WeekPhaseContextType | undefined>(undefined);

interface WeekPhaseProviderProps {
  children: ReactNode;
}

export const WeekPhaseProvider: React.FC<WeekPhaseProviderProps> = ({ children }) => {
  const contextValue: WeekPhaseContextType = {
    service: weekPhaseService,
    getWeekWithPhase: (weekNumber: number) => weekPhaseService.getWeekWithPhase(weekNumber),
    getPhaseForWeek: (weekNumber: number) => weekPhaseService.getPhaseForWeek(weekNumber),
    getWeeksForPhase: (phaseId: number) => weekPhaseService.getWeeksForPhase(phaseId),
    getCurrentPhase: (completedWeeks: number[]) => weekPhaseService.getCurrentPhase(completedWeeks),
    getPhaseProgress: (phaseId: number, completedWeeks: number[]) => weekPhaseService.getPhaseProgress(phaseId, completedWeeks),
    getPhaseStats: (phaseId: number, completedWeeks: number[]) => weekPhaseService.getPhaseStats(phaseId, completedWeeks),
    validateWeekPhaseAssignment: (weekNumber: number, phaseId: number) => weekPhaseService.validateWeekPhaseAssignment(weekNumber, phaseId),
    getValidationErrors: () => weekPhaseService.getValidationErrors(),
  };

  return (
    <WeekPhaseContext.Provider value={contextValue}>
      {children}
    </WeekPhaseContext.Provider>
  );
};

export const useWeekPhase = (): WeekPhaseContextType => {
  const context = useContext(WeekPhaseContext);
  if (context === undefined) {
    throw new Error('useWeekPhase must be used within a WeekPhaseProvider');
  }
  return context;
};