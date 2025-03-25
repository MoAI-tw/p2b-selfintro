import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css'
import { FormProvider } from './context/FormContext';
import { ApiKeyProvider } from './context/ApiKeyContext';
import { OptimizerPromptProvider } from './context/OptimizerPromptContext';
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
import Optimizer from './pages/Optimizer';
import Recorder from './pages/Optimizer/Recorder';
import Optimize from './pages/Optimizer/Optimize';
import OptimizerResult from './pages/Optimizer/Result';
import OptimizerHistory from './pages/Optimizer/History';
import OptimizerPromptEditor from './pages/OptimizerPromptEditor';

// 滾動復位組件
function ScrollToTop() {
  const { pathname } = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

// FooterWrapper 組件，有條件地顯示 Footer
function FooterWrapper() {
  const location = useLocation();
  const hideFooterPaths = [
    '/profile', 
    '/industry', 
    '/settings',
    '/optimizer/recorder',
    '/optimizer/optimize',
    '/optimizer/result'
  ];
  
  if (hideFooterPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }
  
  return <Footer />;
}

function App() {
  return (
    <Router>
      <FormProvider>
        <ApiKeyProvider>
          <OptimizerPromptProvider>
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
                      {/* 自我介紹優化頁面 */}
                      <Route path="/optimizer" element={<Optimizer />} />
                      <Route path="/optimizer/recorder" element={<Recorder />} />
                      <Route path="/optimizer/optimize" element={<Optimize />} />
                      <Route path="/optimizer/result" element={<OptimizerResult />} />
                      <Route path="/optimizer/history" element={<OptimizerHistory />} />
                      <Route path="/optimizer/prompt-editor" element={<OptimizerPromptEditor />} />
                    </Routes>
                  </Suspense>
                </main>
                <FooterWrapper />
              </div>
            </ToastProvider>
          </OptimizerPromptProvider>
        </ApiKeyProvider>
      </FormProvider>
    </Router>
  )
}

export default App
