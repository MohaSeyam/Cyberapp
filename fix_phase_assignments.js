import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the phases.json file to get the correct week-to-phase mapping
const phasesPath = path.join(__dirname, 'src/data/phases.json');
const planDataPath = path.join(__dirname, 'src/data/PlanData.json');

console.log('Reading phases.json...');
const phasesData = JSON.parse(fs.readFileSync(phasesPath, 'utf8'));

// Create a mapping of weeks to their correct phases
const weekToPhaseMap = {};
phasesData.forEach(phase => {
  phase.weeks.forEach(week => {
    weekToPhaseMap[week] = phase.id;
  });
});

console.log('Week to Phase mapping:');
console.log(weekToPhaseMap);

// Read the PlanData.json file
console.log('\nReading PlanData.json...');
const planData = JSON.parse(fs.readFileSync(planDataPath, 'utf8'));

// Update the phase assignments
let updatedCount = 0;
planData.forEach(weekData => {
  const week = weekData.week;
  const correctPhase = weekToPhaseMap[week];
  
  if (correctPhase && weekData.phase !== correctPhase) {
    console.log(`Week ${week}: Phase ${weekData.phase} → Phase ${correctPhase}`);
    weekData.phase = correctPhase;
    updatedCount++;
  }
});

console.log(`\nUpdated ${updatedCount} week phase assignments.`);

// Write the updated data back to the file
fs.writeFileSync(planDataPath, JSON.stringify(planData, null, 2), 'utf8');
console.log('PlanData.json has been updated successfully!');