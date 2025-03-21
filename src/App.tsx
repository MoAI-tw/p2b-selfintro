import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css'
import { FormProvider } from './context/FormContext';
import { ApiKeyProvider } from './context/ApiKeyContext';
import { ToastProvider } from './components/ToastContainer';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Industry from './pages/Industry';
import Settings from './pages/Settings';
import Result from './pages/Result';
import Versions from './pages/Versions';
import Projects from './pages/Projects';
import Features from './pages/Features';
import UseCases from './pages/UseCases';
import FAQ from './pages/FAQ';
import History from './pages/History';
import PromptEditor from './pages/PromptEditor';

// 滾動復位組件
function ScrollToTop() {
  const { pathname } = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function App() {
  return (
    <Router>
      <FormProvider>
        <ApiKeyProvider>
          <ToastProvider>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Suspense fallback={<div className="flex items-center justify-center h-screen">
                  <div className="text-indigo-600 text-2xl">Loading...</div>
                </div>}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/industry" element={<Industry />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/result" element={<Result />} />
                    <Route path="/versions" element={<Versions />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/use-cases" element={<UseCases />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/prompt-editor" element={<PromptEditor />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </ApiKeyProvider>
      </FormProvider>
    </Router>
  )
}

export default App
