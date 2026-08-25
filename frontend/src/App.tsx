import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import MentalHealth from './pages/MentalHealth';
import Appointment from './pages/Appointment';
import AiSupport from './pages/AiSupport';
import MoodTracker from './pages/MoodTracker';
import Auth from './pages/Auth';
import ResourcesPage from './pages/ResourcesPage';

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const showFooter = !isAuthPage && location.pathname !== '/ai-support';

  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mental-health" element={<MentalHealth />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/ai-support" element={<AiSupport />} />
          <Route path="/mood-tracker" element={<MoodTracker />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/forgot-password" element={<Auth />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
