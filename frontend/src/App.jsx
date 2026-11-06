import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ManualTestingPage from './pages/ManualTestingPage';
import CsvUploadPage from './pages/CsvUploadPage';
import RealTimeMonitorPage from './pages/RealTimeMonitorPage';
import PredictionsHistoryPage from './pages/PredictionsHistoryPage';
import ModelTrainingPage from './pages/ModelTrainingPage';
import ModelInfoPage from './pages/ModelInfoPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="manual-test" element={<ManualTestingPage />} />
          <Route path="csv-upload" element={<CsvUploadPage />} />
          <Route path="realtime-monitor" element={<RealTimeMonitorPage />} />
          <Route path="predictions" element={<PredictionsHistoryPage />} />
          <Route path="model-training" element={<ModelTrainingPage />} />
          <Route path="model-info" element={<ModelInfoPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

