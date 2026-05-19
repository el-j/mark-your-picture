import { HashRouter, Route, Routes } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { AboutPage } from './components/pages/AboutPage';
import { ImprintPage } from './components/pages/ImprintPage';
import { ProjectsPage } from './components/pages/ProjectsPage';
import { ToolPage } from './components/tool/ToolPage';
import { InstallBanner } from './components/ui/InstallBanner';
import { Toast } from './components/ui/Toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { WatermarkProvider } from './contexts/WatermarkContext';
import { ToastProvider } from './hooks/useToast';
import { I18nProvider } from './i18n/index';

export default function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ToastProvider>
          <WatermarkProvider>
            <HashRouter>
              <Header />
              <Routes>
                <Route path="/" element={<ToolPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/imprint" element={<ImprintPage />} />
              </Routes>
              <Toast />
              <InstallBanner />
            </HashRouter>
          </WatermarkProvider>
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
