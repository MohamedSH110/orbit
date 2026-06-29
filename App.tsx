import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Subjects } from './pages/Subjects';
import { SubjectLessons } from './pages/SubjectLessons';
import { LessonView } from './pages/LessonView';
import { AdminDashboard } from './pages/AdminDashboard';
import { AboutTeacher } from './pages/AboutTeacher';
import { Profile } from './pages/Profile';
import { LearningPlatform } from './pages/LearningPlatform';

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<AboutTeacher />} />
                <Route path="auth" element={<Auth />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="learning-platform" element={<LearningPlatform />} />
                <Route path="subjects/:grade/:term" element={<Subjects />} />
                <Route path="lessons/:grade/:term/:subject" element={<SubjectLessons />} />
                <Route path="lesson/:id" element={<LessonView />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
