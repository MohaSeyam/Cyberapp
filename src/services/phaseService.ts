// Phase Service - Manages the relationship between phases and weeks
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

export interface Week {
  week: number;
  phase: number;
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

export class PhaseService {
  private phases: Phase[] = phasesData;
  private weeks: Week[] = planData;

  // Get all phases
  getAllPhases(): Phase[] {
    return this.phases;
  }

  // Get phase by ID
  getPhaseById(phaseId: number): Phase | undefined {
    return this.phases.find(phase => phase.id === phaseId);
  }

  // Get weeks for a specific phase
  getWeeksByPhase(phaseId: number): Week[] {
    return this.weeks.filter(week => week.phase === phaseId);
  }

  // Get phase for a specific week
  getPhaseByWeek(weekNumber: number): Phase | undefined {
    const week = this.weeks.find(w => w.week === weekNumber);
    if (week) {
      return this.getPhaseById(week.phase);
    }
    return undefined;
  }

  // Get phase progress (completed weeks / total weeks)
  getPhaseProgress(phaseId: number, completedWeeks: number[]): number {
    const phase = this.getPhaseById(phaseId);
    if (!phase) return 0;

    const phaseWeeks = phase.weeks;
    const completedPhaseWeeks = phaseWeeks.filter(week => completedWeeks.includes(week));
    
    return Math.round((completedPhaseWeeks.length / phaseWeeks.length) * 100);
  }

  // Get total weeks in a phase
  getPhaseTotalWeeks(phaseId: number): number {
    const phase = this.getPhaseById(phaseId);
    return phase ? phase.weeks.length : 0;
  }

  // Get completed weeks in a phase
  getPhaseCompletedWeeks(phaseId: number, completedWeeks: number[]): number {
    const phase = this.getPhaseById(phaseId);
    if (!phase) return 0;

    return phase.weeks.filter(week => completedWeeks.includes(week)).length;
  }

  // Get next week in phase
  getNextWeekInPhase(phaseId: number, currentWeek: number): number | null {
    const phase = this.getPhaseById(phaseId);
    if (!phase) return null;

    const currentIndex = phase.weeks.indexOf(currentWeek);
    if (currentIndex === -1 || currentIndex === phase.weeks.length - 1) {
      return null;
    }

    return phase.weeks[currentIndex + 1];
  }

  // Get previous week in phase
  getPreviousWeekInPhase(phaseId: number, currentWeek: number): number | null {
    const phase = this.getPhaseById(phaseId);
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
    const totalWeeks = this.getPhaseTotalWeeks(phaseId);
    const completed = this.getPhaseCompletedWeeks(phaseId, completedWeeks);
    const progress = this.getPhaseProgress(phaseId, completedWeeks);
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

  // Get current phase based on progress
  getCurrentPhase(completedWeeks: number[]): Phase | null {
    const phasesWithStats = this.getAllPhasesWithStats(completedWeeks);
    
    // Find the first phase that has remaining weeks
    const currentPhase = phasesWithStats.find(phase => phase.stats.remainingWeeks > 0);
    
    return currentPhase || null;
  }

  // Get next phase
  getNextPhase(currentPhaseId: number): Phase | null {
    const currentIndex = this.phases.findIndex(phase => phase.id === currentPhaseId);
    if (currentIndex === -1 || currentIndex === this.phases.length - 1) {
      return null;
    }

    return this.phases[currentIndex + 1];
  }

  // Get previous phase
  getPreviousPhase(currentPhaseId: number): Phase | null {
    const currentIndex = this.phases.findIndex(phase => phase.id === currentPhaseId);
    if (currentIndex <= 0) {
      return null;
    }

    return this.phases[currentIndex - 1];
  }

  // Get phase color
  getPhaseColor(phaseId: number): string {
    const phase = this.getPhaseById(phaseId);
    return phase ? phase.color : 'gray';
  }

  // Get phase icon
  getPhaseIcon(phaseId: number): string {
    const phase = this.getPhaseById(phaseId);
    return phase ? phase.icon : 'circle';
  }

  // Get phase difficulty
  getPhaseDifficulty(phaseId: number): string {
    const phase = this.getPhaseById(phaseId);
    return phase ? phase.difficulty : 'غير محدد';
  }

  // Get phase duration
  getPhaseDuration(phaseId: number): string {
    const phase = this.getPhaseById(phaseId);
    return phase ? phase.duration : 'غير محدد';
  }
}

// Export singleton instance
export const phaseService = new PhaseService();