// Week Phase Service - Manages dynamic week-phase linking based on week numbers
import phasesData from '../data/phases.json';
import planData from '../data/PlanData.json';

export interface Phase {
  id: number;
  title: {
    ar: string;
    en: string;
  };
  weeks: number[];
  focus: {
    ar: string;
    en: string;
  };
  mainContent: {
    ar: string;
    en: string;
  };
  duration: string;
  difficulty: string;
  color: string;
  icon: string;
}

export interface WeekData {
  week: number;
  title: {
    ar: string;
    en: string;
  };
  objective: {
    ar: string;
    en: string;
  };
  days: any[];
}

export class WeekPhaseService {
  private phases: Phase[] = phasesData;
  private allWeeks: WeekData[] = planData;

  // Create week-to-phase mapping from phases data
  private weekToPhaseMap: Map<number, number> = new Map();
  
  constructor() {
    this.buildWeekToPhaseMap();
  }

  private buildWeekToPhaseMap(): void {
    this.phases.forEach(phase => {
      phase.weeks.forEach(week => {
        this.weekToPhaseMap.set(week, phase.id);
      });
    });
  }

  // Get the correct phase for a specific week
  getPhaseForWeek(weekNumber: number): Phase | undefined {
    const phaseId = this.weekToPhaseMap.get(weekNumber);
    if (phaseId) {
      return this.phases.find(phase => phase.id === phaseId);
    }
    return undefined;
  }

  // Get week data with correct phase assignment
  getWeekWithPhase(weekNumber: number): (WeekData & { phase: number }) | undefined {
    const weekData = this.allWeeks.find(week => week.week === weekNumber);
    const phase = this.getPhaseForWeek(weekNumber);
    
    if (weekData && phase) {
      return {
        ...weekData,
        phase: phase.id
      };
    }
    return undefined;
  }

  // Get all weeks for a specific phase
  getWeeksForPhase(phaseId: number): WeekData[] {
    const phase = this.phases.find(p => p.id === phaseId);
    if (!phase) return [];

    return phase.weeks
      .map(weekNumber => this.allWeeks.find(week => week.week === weekNumber))
      .filter((week): week is WeekData => week !== undefined);
  }

  // Get all weeks with their correct phase assignments
  getAllWeeksWithPhases(): (WeekData & { phase: number })[] {
    return this.allWeeks
      .map(week => {
        const phase = this.getPhaseForWeek(week.week);
        return {
          ...week,
          phase: phase ? phase.id : 0
        };
      })
      .filter(week => week.phase > 0);
  }

  // Get phase progress based on completed weeks
  getPhaseProgress(phaseId: number, completedWeeks: number[]): number {
    const phase = this.phases.find(p => p.id === phaseId);
    if (!phase) return 0;

    const phaseWeeks = phase.weeks;
    const completedPhaseWeeks = phaseWeeks.filter(week => completedWeeks.includes(week));
    
    return Math.round((completedPhaseWeeks.length / phaseWeeks.length) * 100);
  }

  // Get current phase based on completed weeks
  getCurrentPhase(completedWeeks: number[]): Phase | null {
    // Find the first phase that has incomplete weeks
    for (const phase of this.phases) {
      const incompleteWeeks = phase.weeks.filter(week => !completedWeeks.includes(week));
      if (incompleteWeeks.length > 0) {
        return phase;
      }
    }
    return null;
  }

  // Get next week in current phase
  getNextWeekInPhase(phaseId: number, currentWeek: number): number | null {
    const phase = this.phases.find(p => p.id === phaseId);
    if (!phase) return null;

    const currentIndex = phase.weeks.indexOf(currentWeek);
    if (currentIndex === -1 || currentIndex === phase.weeks.length - 1) {
      return null;
    }

    return phase.weeks[currentIndex + 1];
  }

  // Get previous week in current phase
  getPreviousWeekInPhase(phaseId: number, currentWeek: number): number | null {
    const phase = this.phases.find(p => p.id === phaseId);
    if (!phase) return null;

    const currentIndex = phase.weeks.indexOf(currentWeek);
    if (currentIndex <= 0) {
      return null;
    }

    return phase.weeks[currentIndex - 1];
  }

  // Get phase statistics
  getPhaseStats(phaseId: number, completedWeeks: number[]): {
    totalWeeks: number;
    completedWeeks: number;
    progress: number;
    remainingWeeks: number;
  } {
    const phase = this.phases.find(p => p.id === phaseId);
    if (!phase) {
      return { totalWeeks: 0, completedWeeks: 0, progress: 0, remainingWeeks: 0 };
    }

    const totalWeeks = phase.weeks.length;
    const completed = phase.weeks.filter(week => completedWeeks.includes(week)).length;
    const progress = Math.round((completed / totalWeeks) * 100);
    const remaining = totalWeeks - completed;

    return {
      totalWeeks,
      completedWeeks: completed,
      progress,
      remainingWeeks: remaining
    };
  }

  // Get all phases with their statistics
  getAllPhasesWithStats(completedWeeks: number[]): (Phase & {
    stats: {
      totalWeeks: number;
      completedWeeks: number;
      progress: number;
      remainingWeeks: number;
    };
  })[] {
    return this.phases.map(phase => ({
      ...phase,
      stats: this.getPhaseStats(phase.id, completedWeeks)
    }));
  }

  // Get week number by phase and week index
  getWeekNumberByPhaseAndIndex(phaseId: number, weekIndex: number): number | null {
    const phase = this.phases.find(p => p.id === phaseId);
    if (!phase || weekIndex < 0 || weekIndex >= phase.weeks.length) {
      return null;
    }
    return phase.weeks[weekIndex];
  }

  // Get week index in phase
  getWeekIndexInPhase(weekNumber: number): { phaseId: number; index: number } | null {
    for (const phase of this.phases) {
      const index = phase.weeks.indexOf(weekNumber);
      if (index !== -1) {
        return { phaseId: phase.id, index };
      }
    }
    return null;
  }

  // Validate week-phase assignment
  validateWeekPhaseAssignment(weekNumber: number, phaseId: number): boolean {
    const correctPhase = this.weekToPhaseMap.get(weekNumber);
    return correctPhase === phaseId;
  }

  // Get all validation errors
  getValidationErrors(): Array<{ week: number; currentPhase: number; correctPhase: number }> {
    const errors: Array<{ week: number; currentPhase: number; correctPhase: number }> = [];
    
    this.allWeeks.forEach(weekData => {
      const correctPhase = this.weekToPhaseMap.get(weekData.week);
      if (correctPhase && correctPhase !== (weekData as any).phase) {
        errors.push({
          week: weekData.week,
          currentPhase: (weekData as any).phase || 0,
          correctPhase
        });
      }
    });

    return errors;
  }
}

// Export singleton instance
export const weekPhaseService = new WeekPhaseService();