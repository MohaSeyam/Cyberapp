import { useState, useMemo } from 'react';
import { weekPhaseService, Phase, WeekData } from '../services/weekPhaseService';

export interface WeekPhaseData {
  week: number;
  phase: number;
  weekData: WeekData;
  phaseData: Phase;
  isValid: boolean;
}

export interface PhaseProgress {
  phaseId: number;
  phaseTitle: string;
  totalWeeks: number;
  completedWeeks: number;
  progress: number;
  remainingWeeks: number;
}

export const useWeekPhaseData = () => {
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);

  // Get week data with correct phase assignment
  const getWeekData = (weekNumber: number): WeekPhaseData | null => {
    if (!weekNumber || typeof weekNumber !== 'number') return null;
    
    const weekData = weekPhaseService.getWeekWithPhase(weekNumber);
    const phaseData = weekPhaseService.getPhaseForWeek(weekNumber);
    
    if (!weekData || !phaseData) return null;

    const isValid = weekPhaseService.validateWeekPhaseAssignment(weekNumber, weekData.phase);

    return {
      week: weekNumber,
      phase: weekData.phase,
      weekData,
      phaseData,
      isValid
    };
  };

  // Get all weeks for a specific phase
  const getPhaseWeeks = (phaseId: number): WeekData[] => {
    return weekPhaseService.getWeeksForPhase(phaseId);
  };

  // Get current phase based on completed weeks
  const getCurrentPhase = (): Phase | null => {
    return weekPhaseService.getCurrentPhase(completedWeeks);
  };

  // Get phase progress
  const getPhaseProgress = (phaseId: number): number => {
    return weekPhaseService.getPhaseProgress(phaseId, completedWeeks);
  };

  // Get all phases with progress
  const getAllPhasesProgress = (): PhaseProgress[] => {
    const phases = weekPhaseService.getAllPhasesWithStats(completedWeeks);
    
    return phases.map(phase => ({
      phaseId: phase.id,
      phaseTitle: phase.title?.ar || phase.title?.en || `Phase ${phase.id}`,
      totalWeeks: phase.stats.totalWeeks,
      completedWeeks: phase.stats.completedWeeks,
      progress: phase.stats.progress,
      remainingWeeks: phase.stats.remainingWeeks
    }));
  };

  // Get validation errors
  const getValidationErrors = () => {
    return weekPhaseService.getValidationErrors();
  };

  // Week completion handlers
  const completeWeek = (weekNumber: number) => {
    if (!completedWeeks.includes(weekNumber)) {
      setCompletedWeeks([...completedWeeks, weekNumber]);
    }
  };

  const uncompleteWeek = (weekNumber: number) => {
    setCompletedWeeks(completedWeeks.filter(w => w !== weekNumber));
  };

  const isWeekCompleted = (weekNumber: number): boolean => {
    return completedWeeks.includes(weekNumber);
  };

  // Navigation helpers
  const getNextWeekInPhase = (currentWeek: number): number | null => {
    const weekData = getWeekData(currentWeek);
    if (!weekData) return null;
    
    return weekPhaseService.getNextWeekInPhase(weekData.phase, currentWeek);
  };

  const getPreviousWeekInPhase = (currentWeek: number): number | null => {
    const weekData = getWeekData(currentWeek);
    if (!weekData) return null;
    
    return weekPhaseService.getPreviousWeekInPhase(weekData.phase, currentWeek);
  };

  // Get week index in phase
  const getWeekIndexInPhase = (weekNumber: number) => {
    return weekPhaseService.getWeekIndexInPhase(weekNumber);
  };

  // Get week number by phase and index
  const getWeekNumberByPhaseAndIndex = (phaseId: number, weekIndex: number): number | null => {
    return weekPhaseService.getWeekNumberByPhaseAndIndex(phaseId, weekIndex);
  };

  return {
    // Data getters
    getWeekData,
    getPhaseWeeks,
    getCurrentPhase,
    getPhaseProgress,
    getAllPhasesProgress,
    getValidationErrors,
    
    // Week completion
    completeWeek,
    uncompleteWeek,
    isWeekCompleted,
    completedWeeks,
    
    // Navigation
    getNextWeekInPhase,
    getPreviousWeekInPhase,
    getWeekIndexInPhase,
    getWeekNumberByPhaseAndIndex,
    
    // Service access
    service: weekPhaseService
  };
};