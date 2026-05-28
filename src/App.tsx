import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BackgroundEffect from "@/components/BackgroundEffect";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Categories from "@/pages/Categories";
import FirmwareDetail from "@/pages/FirmwareDetail";
import UserCenter from "@/pages/UserCenter";
import Donate from "@/pages/Donate";
import ForgotPassword from "@/pages/ForgotPassword";
import { useAppStore } from "@/store";
import { authAPI } from "@/services/api";

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
    </Router>
  );
}
