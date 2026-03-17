import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./register.css"; // Dito kukuha ng styles ang Login card

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ show: false, message: "", type: "error" });

  const navigate = useNavigate();

  const closeDialog = () => {
    setDialog({ show: false, message: "", type: "error" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setDialog({ show: true, message: "Please fill all required fields.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");

        setDialog({ show: true, message: "Login successful!", type: "success" });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);

      } else {
        setDialog({ show: true, message: data.error || "Login failed", type: "error" });
      }

    } catch (err) {
      console.error("Login error:", err);
      setDialog({ show: true, message: "Server connection error.", type: "error" });
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      {/* Branding Section - Logo icon removed for clean text branding */}
      <div className="logo-container">
        <h1 className="system-name">Farm<span>Ops</span></h1>
      </div>

      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: "15px" }}>
        <Link to="/register" className="back-link">Don't have an account? Register</Link>
      </p>

      {dialog.show && (
        <div className="dialog-overlay">
          <div className={`dialog-box ${dialog.type}`}>
            <h3 style={{ color: dialog.type === "success" ? "#57b894" : "#f87171" }}>
              {dialog.type === "error" ? "Error" : "Success"}
            </h3>
            <p>{dialog.message}</p>
            <button 
              onClick={closeDialog} 
              className="register-btn" 
              style={{ width: "auto", padding: "8px 25px" }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;