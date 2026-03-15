import { Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './components/Welcome';
import ProfileSelect from './components/ProfileSelect';
import LevelSelect from './components/LevelSelect';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import ParentDashboard from './components/ParentDashboard';
import ReinforcePractice from './components/ReinforcePractice';

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/profiles" element={<ProfileSelect />} />
        <Route path="/levels" element={<LevelSelect />} />
        <Route path="/quiz" element={<QuizScreen />} />
        <Route path="/results" element={<ResultsScreen />} />
        <Route path="/reinforce" element={<ReinforcePractice />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
