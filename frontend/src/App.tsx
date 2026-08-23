import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ChatbotWidget from './components/ChatbotWidget/ChatbotWidget';
import Home from './pages/Home';
import MentalHealth from './pages/MentalHealth';
import Appointment from './pages/Appointment';
import AiSupport from './pages/AiSupport';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mental-health" element={<MentalHealth />} />
            <Route path="/appointment" element={<Appointment />} />
            <Route path="/ai-support" element={<AiSupport />} />
          </Routes>
        </main>
        <Footer />
        <ChatbotWidget />
      </div>
    </BrowserRouter>
  );
}

export default App;
