import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser, FaSignOutAlt, FaBox, FaUsers,
  FaChartLine, FaCheck, FaTimes, FaEdit, FaCalendarAlt
} from "react-icons/fa";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

import StockPage from "./StockPage";
import EmployeePage from "./EmployeePage";
import TotalEarningsCard from "./TotalEarningsCard";
import ReportsPage from "./ReportsPage";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  
  const role = user?.role;
  const section = user?.section;

  const [page, setPage] = useState("dashboard");
  const [reportData, setReportData] = useState({ dailyEarnings: 0, dailyHistory: [] });
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState({ 
    firstName: user?.firstName || "", 
    lastName: user?.lastName || "" 
  });

  const fetchData = useCallback(async () => {
    try {
      const reportRes = await fetch("http://localhost:5000/api/reports");
      const reportJson = await reportRes.json();
      
      setReportData({
        dailyEarnings: reportJson.dailyEarnings || 0,
        dailyHistory: (reportJson.dailyHistory || []).map(d => ({ 
          date: d.date, 
          amount: d.total 
        }))
      });
    } catch (err) {
      console.error("Data fetch error:", err);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn !== "true" || !user) {
      navigate("/");
    } else {
      fetchData();
      const timer = setInterval(() => setCurrentTime(new Date()), 60000);
      return () => clearInterval(timer);
    }
  }, [isLoggedIn, navigate, user, fetchData]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!tempName.firstName.trim() || !tempName.lastName.trim()) return;

    try {
      const response = await fetch("http://localhost:5000/api/users/update-name", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: user.email, 
          firstName: tempName.firstName, 
          lastName: tempName.lastName 
        })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user); 
        setIsEditingName(false);
      }
    } catch (err) {
      alert("Connection error. Check your server.");
    }
  };

  const colors = {
    emerald: "#57b894",
    sidebarBg: "#1e293b", 
    white: "#ffffff",
    bgLight: "#f1f5f9",
    textGray: "#64748b"
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", backgroundColor: colors.bgLight, fontFamily: "'Inter', sans-serif" }}>
      
      <aside style={{ width: "260px", backgroundColor: colors.sidebarBg, color: colors.white, padding: "30px 20px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "40px", paddingLeft: "10px" }}>
           <h1 style={{ fontSize: "22px", fontWeight: "800", color: colors.white, margin: 0 }}>
             Farm<span style={{ color: colors.emerald }}>Ops</span>
           </h1>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
          <SidebarItem icon={<FaUser />} label="Overview" active={page === "dashboard"} onClick={() => setPage("dashboard")} colors={colors} />
          {role === "admin" && <SidebarItem icon={<FaUsers />} label="Employees" active={page === "employees"} onClick={() => setPage("employees")} colors={colors} />}
          {(section === "Inventory" || role === "admin") && <SidebarItem icon={<FaBox />} label="Inventory" active={page === "stock"} onClick={() => setPage("stock")} colors={colors} />}
          <SidebarItem icon={<FaChartLine />} label="Reports" active={page === "reports"} onClick={() => setPage("reports")} colors={colors} />
          
          <div onClick={handleLogout} style={{ marginTop: "auto", padding: "12px 15px", borderRadius: "12px", cursor: "pointer", color: "#f87171", display: "flex", alignItems: "center", gap: "12px", fontWeight: "600" }}>
            <FaSignOutAlt /> Logout
          </div>
        </nav>
      </aside>

      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <header style={{ padding: "15px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.white, borderBottom: "1px solid #e2e8f0", zIndex: 10 }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#f0fdf4", padding: "8px 15px", borderRadius: "10px", border: "1px solid #dcfce7", color: "#166534", fontSize: "13px", fontWeight: "600" }}>
            <FaCalendarAlt style={{ color: colors.emerald }} />
            {currentTime.toLocaleDateString('en-US')} | {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ textAlign: "right" }}>
              {isEditingName ? (
                <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "#f8fafc", padding: "5px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <input value={tempName.firstName} onChange={(e) => setTempName({...tempName, firstName: e.target.value})} style={editingInputHeader} placeholder="First Name" />
                  <input value={tempName.lastName} onChange={(e) => setTempName({...tempName, lastName: e.target.value})} style={editingInputHeader} placeholder="Last Name" />
                  <button onClick={handleUpdateName} style={{...actionBtnStyle, background: colors.emerald}}><FaCheck size={12}/></button>
                  <button onClick={() => setIsEditingName(false)} style={{...actionBtnStyle, background: "#ef4444"}}><FaTimes size={12}/></button>
                </div>
              ) : (
                <div onClick={() => setIsEditingName(true)} style={{ cursor: "pointer" }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
                    {user?.firstName} {user?.lastName} <FaEdit size={12} style={{ color: colors.emerald, opacity: 0.6 }} />
                  </div>
                  <div style={{ fontSize: "11px", color: colors.emerald, textTransform: "uppercase", fontWeight: "800", letterSpacing: "1px" }}>{role}</div>
                </div>
              )}
            </div>
            <img src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=57b894&color=fff&bold=true`} alt="avatar" style={{ width: "42px", height: "42px", borderRadius: "12px", objectFit: "cover" }} />
          </div>
        </header>

        <div style={{ padding: "40px" }}>
          {page === "dashboard" && (
            <div>
              <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Dashboard</h2>
              <p style={{ color: "#64748b", marginTop: "4px" }}>Welcome back! Here's what's happening today.</p>
              
              <div style={{ display: "flex", gap: "25px", marginTop: "30px" }}>
                <div style={cardStyle}>
                   <div style={{ color: colors.textGray, fontSize: "14px", fontWeight: "600" }}>Daily Earnings</div>
                   <div style={{ fontSize: "32px", fontWeight: "800", color: "#1e293b", marginTop: "10px" }}>₱{reportData.dailyEarnings.toLocaleString()}</div>
                   
                   {/* DYNAMIC PERCENTAGE: Lalabas lang kung may earnings na higit sa 0 */}
                   {reportData.dailyEarnings > 0 && (
                     <div style={{ fontSize: "12px", color: colors.emerald, marginTop: "8px", fontWeight: "600" }}>
                       +5.3% from yesterday
                     </div>
                   )}
                </div>
                <div style={{ flex: 1 }}><TotalEarningsCard /></div>
              </div>

              <div style={{ ...cardStyle, marginTop: "30px", height: "400px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>Revenue Trend</h3>
                  <select style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", color: "#64748b" }}>
                    <option>Last 7 Days</option>
                  </select>
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", marginBottom: "15px" }}>Daily Revenue Trend</h4>
                <div style={{ width: "100%", height: "80%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.dailyHistory}>
                      <defs>
                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colors.emerald} stopOpacity={0.1}/>
                          <stop offset="95%" stopColor={colors.emerald} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis hide />
                      <Tooltip />
                      <Area type="monotone" dataKey="amount" stroke={colors.emerald} strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          {page === "employees" && role === "admin" && <EmployeePage />}
          {page === "stock" && (section === "Inventory" || role === "admin") && <StockPage />}
          {page === "reports" && <ReportsPage />}
        </div>
      </main>
    </div>
  );
}

const editingInputHeader = { padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", width: "90px", outline: "none" };
const actionBtnStyle = { color: "white", border: "none", borderRadius: "6px", padding: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" };
const cardStyle = { backgroundColor: "white", padding: "24px", borderRadius: "16px", flex: 1, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" };

function SidebarItem({ icon, label, active, onClick, colors }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", cursor: "pointer", borderRadius: "12px", fontWeight: "600", transition: "0.2s", backgroundColor: active ? colors.emerald : "transparent", color: active ? "white" : "#94a3b8" }}>
      <span style={{ fontSize: "18px" }}>{icon}</span>
      {label}
    </div>
  );
}

export default Dashboard;