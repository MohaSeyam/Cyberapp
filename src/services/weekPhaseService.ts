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

  // Get all phases
  getPhases(): Phase[] {
    return this.phases;
  }

  // Get a specific phase by ID
  getPhaseById(phaseId: number): Phase | undefined {
    return this.phases.find(phase => phase.id === phaseId);
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
      });
  }

  // Get all weeks
  getAllWeeks(): WeekData[] {
    return this.allWeeks;
  }

  // Get a specific week by number
  getWeekByNumber(weekNumber: number): WeekData | undefined {
    return this.allWeeks.find(week => week.week === weekNumber);
  }

  // Calculate phase progress
  getPhaseProgress(phaseId: number, completedWeeks: number[]): number {
    const phase = this.phases.find(p => p.id === phaseId);
    if (!phase) return 0;

    const phaseWeeks = phase.weeks;
    const completedPhaseWeeks = completedWeeks.filter(week => phaseWeeks.includes(week));
    
    return phaseWeeks.length > 0 ? (completedPhaseWeeks.length / phaseWeeks.length) * 100 : 0;
  }

  // Get current phase based on completed weeks
  getCurrentPhase(completedWeeks: number[]): Phase | null {
    const allWeeks = this.allWeeks.map(w => w.week);
    const nextWeek = allWeeks.find(week => !completedWeeks.includes(week));
    
    if (nextWeek) {
      return this.getPhaseForWeek(nextWeek) || null;
    }
    
    // If all weeks are completed, return the last phase
    const lastCompletedWeek = Math.max(...completedWeeks);
    return this.getPhaseForWeek(lastCompletedWeek) || null;
  }

  // Get next week in a specific phase
  getNextWeekInPhase(phaseId: number, currentWeek: number): number | null {
    const phase = this.phases.find(p => p.id === phaseId);
    if (!phase) return null;

    const phaseWeeks = phase.weeks.sort((a, b) => a - b);
    const currentIndex = phaseWeeks.indexOf(currentWeek);
    
    if (currentIndex >= 0 && currentIndex < phaseWeeks.length - 1) {
      return phaseWeeks[currentIndex + 1];
    }
    
    return null;
  }

  // Get previous week in a specific phase
  getPreviousWeekInPhase(phaseId: number, currentWeek: number): number | null {
    const phase = this.phases.find(p => p.id === phaseId);
    if (!phase) return null;

    const phaseWeeks = phase.weeks.sort((a, b) => a - b);
    const currentIndex = phaseWeeks.indexOf(currentWeek);
    
    if (currentIndex > 0) {
      return phaseWeeks[currentIndex - 1];
    }
    
    return null;
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
      return {
        totalWeeks: 0,
        completedWeeks: 0,
        progress: 0,
        remainingWeeks: 0
      };
    }

    const phaseWeeks = phase.weeks;
    const completedPhaseWeeks = completedWeeks.filter(week => phaseWeeks.includes(week));
    const progress = phaseWeeks.length > 0 ? (completedPhaseWeeks.length / phaseWeeks.length) * 100 : 0;

    return {
      totalWeeks: phaseWeeks.length,
      completedWeeks: completedPhaseWeeks.length,
      progress,
      remainingWeeks: phaseWeeks.length - completedPhaseWeeks.length
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

  // Get week number by phase and index
  getWeekNumberByPhaseAndIndex(phaseId: number, weekIndex: number): number | null {
    const phase = this.phases.find(p => p.id === phaseId);
    if (!phase || weekIndex < 0 || weekIndex >= phase.weeks.length) {
      return null;
    }
    
    return phase.weeks[weekIndex];
  }

  // Get week index within its phase
  getWeekIndexInPhase(weekNumber: number): { phaseId: number; index: number } | null {
    const phase = this.getPhaseForWeek(weekNumber);
    if (!phase) return null;

    const index = phase.weeks.indexOf(weekNumber);
    if (index === -1) return null;

    return {
      phaseId: phase.id,
      index
    };
  }

  // Validate week-phase assignment
  validateWeekPhaseAssignment(weekNumber: number, phaseId: number): boolean {
    const correctPhase = this.getPhaseForWeek(weekNumber);
    return correctPhase?.id === phaseId;
  }

  // Get validation errors
  getValidationErrors(): Array<{ week: number; currentPhase: number; correctPhase: number }> {
    const errors: Array<{ week: number; currentPhase: number; correctPhase: number }> = [];
    
    this.allWeeks.forEach(week => {
      const correctPhase = this.getPhaseForWeek(week.week);
      if (correctPhase) {
        // This would need to be compared with actual data to find mismatches
        // For now, we'll just return an empty array
      }
    });
    
    return errors;
  }
}

// Create and export a singleton instance
export const weekPhaseService = new WeekPhaseService();