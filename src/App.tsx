import { useEffect, lazy, Suspense, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BackgroundEffect from "@/components/BackgroundEffect";
import { useAppStore } from "@/store";
import { authAPI, configAPI } from "@/services/api";

const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const Register = lazy(() => import("@/pages/Register"));
const Categories = lazy(() => import("@/pages/Categories"));
const FirmwareDetail = lazy(() => import("@/pages/FirmwareDetail"));
const UserCenter = lazy(() => import("@/pages/UserCenter"));
const Donate = lazy(() => import("@/pages/Donate"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--theme-bg-base)' }}>
      <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function MaintenancePage({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--theme-bg-base)' }}>
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>网站维护中</h1>
        <p className="text-lg mb-8" style={{ color: 'var(--theme-text-secondary)' }}>
          {message}
        </p>
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}

function AppContent() {
  const { user, isAuthenticated } = useAppStore();
  const [maintenance, setMaintenance] = useState<{ enabled: boolean; message: string } | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await configAPI.get();
        if (res.success && res.config.maintenanceSettings?.enabled) {
          setMaintenance(res.config.maintenanceSettings);
        } else {
          setMaintenance(null);
        }
      } catch {
        setMaintenance(null);
      }
    };
    checkMaintenance();
  }, []);

  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isAdminRoute = location.pathname === '/admin';

  if (maintenance?.enabled && !isAdmin && !isAdminRoute) {
    return <MaintenancePage message={maintenance.message} />;
  }

  return (
    <>
      {!maintenance?.enabled && <BackgroundEffect />}
      {(!maintenance?.enabled || isAdmin) && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/firmware/:id" element={<FirmwareDetail />} />
          <Route path="/user" element={<UserCenter />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  const { loadInitialData, setUser, setAuthReady } = useAppStore();

  useEffect(() => {
    loadInitialData();

    const token = localStorage.getItem('authToken');
    if (token) {
      const user = useAppStore.getState().user;
      if (!user) {
        authAPI.verifyToken().then(res => {
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('authToken');
          }
          setAuthReady();
        }).catch(() => {
          localStorage.removeItem('authToken');
          setAuthReady();
        });
      } else {
        setAuthReady();
      }
    } else {
      setAuthReady();
    }
  }, [loadInitialData, setUser, setAuthReady]);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}