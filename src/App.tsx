import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BackgroundEffect from "@/components/BackgroundEffect";
import { useAppStore } from "@/store";
import { authAPI } from "@/services/api";

const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
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
      <BackgroundEffect />
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/firmware/:id" element={<FirmwareDetail />} />
          <Route path="/user" element={<UserCenter />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </Suspense>
    </Router>
  );
}