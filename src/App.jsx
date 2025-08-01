import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import HomePage from "./pages/HomePage";
import ProgressPage from "./pages/ProgressPage";
import PlanPageEnhanced from "./pages/PlanPageEnhanced";
import DayViewPageEnhanced from "./pages/DayViewPageEnhanced";
import DaysPageEnhanced from "./pages/DaysPage";
import PhasesPageEnhanced from "./pages/PhasesPage";
import PhaseWeeksPageEnhanced from "./pages/PhaseWeeksPage";
import NotesPage from "./pages/NotesPage";
import JournalPage from "./pages/JournalPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/plan" element={<PlanPageEnhanced />} />
          <Route path="/phases" element={<PhasesPageEnhanced />} />
          <Route path="/phase/:phaseId" element={<PhaseWeeksPageEnhanced />} />
          <Route path="/day/:weekId/:dayIndex" element={<DayViewPageEnhanced />} />
          <Route path="/days/:weekId" element={<DaysPageEnhanced />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
