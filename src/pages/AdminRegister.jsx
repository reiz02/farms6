import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminRegister.css";

function AdminRegister() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ show: false, title: "", message: "" });

  const navigate = useNavigate();

  const handleDialogClose = () => setDialog({ show: false, title: "", message: "" });

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, middleName, lastName, email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Server error.");
      }

      if (response.ok) {
        setDialog({ show: true, title: "Success", message: data.message });
        setTimeout(() => navigate("/"), 2500);
      } else {
        setDialog({ show: true, title: "Error", message: data.error || "Registration failed" });
      }
    } catch (err) {
      setDialog({
        show: true,
        title: "Error",
        message: "Could not connect to the server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-setup-container">
      <div className="admin-card">
        {/* FarmOps Branding */}
        <div className="logo-container">
          <h1 className="system-name">Farm<span>Ops</span></h1>
        </div>

        <div className="header-section">
          <h2>Admin Registration</h2>
          <div className="restricted-badge">Restricted Access</div>
          <p className="sub-text">Create an account to manage your farm operations.</p>
        </div>

        <form onSubmit={handleAdminSubmit} autoComplete="off">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Middle Name (optional)"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="admin-btn" disabled={loading}>
            {loading ? "Registering..." : "Register Admin"}
          </button>
        </form>
      </div>

      {dialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3 style={{ color: dialog.title === "Success" ? "#57b894" : "#f87171" }}>
              {dialog.title}
            </h3>
            <p>{dialog.message}</p>
            <button
              onClick={() => {
                handleDialogClose();
                if (dialog.title === "Success") navigate("/");
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRegister;