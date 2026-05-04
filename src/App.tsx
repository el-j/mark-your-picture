import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { WatermarkProvider } from './contexts/WatermarkContext';
import { ToastProvider } from './hooks/useToast';
import { Header } from './components/layout/Header';
import { ToolPage } from './components/tool/ToolPage';
import { AboutPage } from './components/pages/AboutPage';
import { ImprintPage } from './components/pages/ImprintPage';
import { Toast } from './components/ui/Toast';
import { InstallBanner } from './components/ui/InstallBanner';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <WatermarkProvider>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<ToolPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/imprint" element={<ImprintPage />} />
            </Routes>
            <Toast />
            <InstallBanner />
          </BrowserRouter>
        </WatermarkProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
