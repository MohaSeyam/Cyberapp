// dataService.js
// خدمة البيانات الثابتة: استخراج مراحل الخطة، الأسابيع، الأيام، الأهداف، الموارد من PlanData.json عبر fetch

let planDataCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchPlanData() {
  // Check if cache is still valid
  if (planDataCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    return planDataCache;
  }

  try {
    const res = await fetch('/data/PlanData.json');
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    planDataCache = Array.isArray(data[0]) ? data.flat() : data;
    cacheTimestamp = Date.now();
    return planDataCache;
  } catch (error) {
    console.error('Error fetching plan data:', error);
    // Return cached data if available, even if expired
    if (planDataCache) {
      console.warn('Using cached data due to fetch error');
      return planDataCache;
    }
    throw error;
  }
}

export async function getPhases() {
  const planData = await fetchPlanData();
  const phasesMap = {};
  planData.forEach(item => {
    if (!phasesMap[item.phase]) {
      phasesMap[item.phase] = {
        id: item.phase,
        name: item.title?.ar?.split(":")[0] || `المرحلة ${item.phase}`,
        description: item.title?.ar || item.title?.en || "",
        weekCount: 0,
        totalTasks: 0,
        completedTasks: 0
      };
    }
    // Count weeks and tasks for each phase
    phasesMap[item.phase].weekCount++;
    if (item.days) {
      phasesMap[item.phase].totalTasks += item.days.reduce((sum, day) => 
        sum + (day.tasks?.length || 0), 0);
    }
  });
  return Object.values(phasesMap);
}

export async function getWeeksByPhase(phaseId) {
  const planData = await fetchPlanData();
  return planData.filter(item => item.phase === phaseId);
}

export async function getWeeks() {
  return await fetchPlanData();
}

export async function getDaysByWeek(weekNumber) {
  const planData = await fetchPlanData();
  const week = planData.find(item => item.week === weekNumber);
  return week ? week.days : [];
}

export async function getObjectivesByPhase(phaseId) {
  const planData = await fetchPlanData();
  return planData.filter(item => item.phase === phaseId).map(item => item.objective);
}

export async function getResourcesByWeek(weekNumber) {
  const planData = await fetchPlanData();
  const week = planData.find(item => item.week === weekNumber);
  if (!week) return [];
  return week.days.flatMap(day => day.resources || []);
}

export async function getPlanData() {
  return await fetchPlanData();
}

// دوال استخراج متقدمة async (نفس المنطق السابق لكن async)
export async function getAllResources() {
  const planData = await fetchPlanData();
  return planData.flatMap(week => (week.days || []).flatMap(day => day.resources || []));
}

export async function getAllObjectives() {
  const planData = await fetchPlanData();
  return planData.map(week => week.objective);
}

export async function getAllDays() {
  const planData = await fetchPlanData();
  return planData.flatMap(week => week.days || []);
}

export async function getAllWeekTitles(lang = "ar") {
  const planData = await fetchPlanData();
  return planData.map(week => week.title?.[lang] || week.title?.ar || week.title?.en || "");
}

export async function getAllPhaseTitles(lang = "ar") {
  const phases = await getPhases();
  return phases.map(phase => phase.name);
}

export async function getWeeksCountByPhase(phaseId) {
  const planData = await fetchPlanData();
  return planData.filter(item => item.phase === phaseId).length;
}

export async function getResourcesByType(type) {
  const all = await getAllResources();
  return all.filter(r => r.type === type);
}

export async function getAllTasks() {
  const planData = await fetchPlanData();
  return planData.flatMap(week => (week.days || []).flatMap(day => day.tasks || []));
}

// New functions for enhanced functionality
export async function searchPlanData(query, lang = "ar") {
  const planData = await fetchPlanData();
  const results = [];
  
  planData.forEach(week => {
    // Search in week title
    const weekTitle = week.title?.[lang] || week.title?.ar || week.title?.en || "";
    if (weekTitle.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        type: 'week',
        id: week.week,
        title: weekTitle,
        phase: week.phase
      });
    }
    
    // Search in days
    week.days?.forEach(day => {
      day.tasks?.forEach(task => {
        const taskDesc = task.description?.[lang] || task.description?.ar || task.description?.en || "";
        if (taskDesc.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            type: 'task',
            id: task.id,
            title: taskDesc,
            week: week.week,
            day: day.key,
            phase: week.phase
          });
        }
      });
    });
  });
  
  return results;
}

export async function getPhaseProgress(phaseId, completedTasks = []) {
  const phases = await getPhases();
  const phase = phases.find(p => p.id === phaseId);
  if (!phase) return 0;
  
  const completedCount = completedTasks.filter(task => {
    const planData = await fetchPlanData();
    const week = planData.find(w => w.phase === phaseId);
    return week?.days?.some(day => 
      day.tasks?.some(t => t.id === task.id)
    );
  }).length;
  
  return Math.round((completedCount / phase.totalTasks) * 100);
}

// Clear cache function for manual refresh
export function clearPlanDataCache() {
  planDataCache = null;
  cacheTimestamp = null;
}
