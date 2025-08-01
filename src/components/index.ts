// Week Phase System Components
export { WeekPhaseProvider, useWeekPhase } from './WeekPhaseProvider';
export { WeekPhaseExample } from './WeekPhaseExample';
export { WeekPhaseHookExample } from './WeekPhaseHookExample';
export { WeekPhaseTest } from './WeekPhaseTest';

// Week Phase Service
export { weekPhaseService, WeekPhaseService } from '../services/weekPhaseService';
export type { Phase, WeekData } from '../services/weekPhaseService';

// Week Phase Hook
export { useWeekPhaseData } from '../hooks/useWeekPhaseData';
export type { WeekPhaseData, PhaseProgress } from '../hooks/useWeekPhaseData';