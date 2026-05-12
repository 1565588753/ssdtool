import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Categories from "@/pages/Categories";
import FirmwareDetail from "@/pages/FirmwareDetail";
import UserCenter from "@/pages/UserCenter";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/firmware/:id" element={<FirmwareDetail />} />
        <Route path="/user" element={<UserCenter />} />
      </Routes>
    </Router>
  );
}
