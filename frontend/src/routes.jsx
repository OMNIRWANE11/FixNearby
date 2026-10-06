import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loader from './components/Loader';

// Code-split pages using React.lazy
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Emergency = lazy(() => import('./pages/Emergency'));
const Verify = lazy(() => import('./pages/Verify'));
const Tracking = lazy(() => import('./pages/Tracking'));
const About = lazy(() => import('./pages/About'));
const Safety = lazy(() => import('./pages/Safety'));
const Directory = lazy(() => import('./pages/Directory'));
const Requests = lazy(() => import('./pages/Requests'));
const Profile = lazy(() => import('./pages/Profile'));
const ProviderPortal = lazy(() => import('./pages/ProviderPortal'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));

export function AppRoutes() {
  return (
    <Suspense fallback={<Loader label="Loading emergency modules..." />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/tracking/:requestId" element={<Tracking />} />
        <Route path="/about" element={<About />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/provider" element={<ProviderPortal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;

