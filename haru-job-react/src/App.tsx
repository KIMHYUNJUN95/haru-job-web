import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ApplicationPage from './pages/ApplicationPage';
import AdminPage from './pages/AdminPage';
import FaqPage from './pages/FaqPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NoticePage from './pages/NoticePage';
import JobListingsPage from './pages/JobListingsPage';
import JobDetailPage from './pages/JobDetailPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/apply" element={<ApplicationPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/notice" element={<NoticePage />} />
          <Route path="/jobs" element={<JobListingsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
