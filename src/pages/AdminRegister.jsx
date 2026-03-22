import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import "./adminRegister.css";

function AdminRegister() {
  // Security & Lock States
  const [isAdminExists, setIsAdminExists] = useState(false);
  const [checking, setChecking] = useState(true);

  // Form States
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodePopup, setShowCodePopup] = useState(false);
  const [dialog, setDialog] = useState({ show: false, title: "", message: "" });

  const navigate = useNavigate();

  

  // ==========================================
  // 1. Check if an Admin is already registered
  // ==========================================
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Added timestamp (?t=) and no-store to force browser to fetch fresh data
        const response = await fetch(`http://localhost:5000/api/check-admin?t=${Date.now()}`, {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          },
          cache: "no-store"
        });

        const data = await response.json();
        
        // Set state based on actual data from server
        setIsAdminExists(data.exists);
      } catch (err) {
        console.error("Connection to server failed.");
        setIsAdminExists(false); // Default to false if there's an error
      } finally {
        setChecking(false);
      }
    };
    checkSystemStatus();
  }, []);

  const handleDialogClose = () => {
    setDialog({ show: false, title: "", message: "" });
    if (dialog.title === "Success") {
      navigate("/");
    }
  };

  // ==========================================
  // 2. Request OTP Code
  // ==========================================
  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setDialog({
        show: true,
        title: "Error",
        message: "Passwords do not match!"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCodePopup(true);
        setDialog({
          show: true,
          title: "Verification",
          message: "A verification code has been sent to your email."
        });
      } else {
        setDialog({
          show: true,
          title: "Error",
          message: data.error || "Failed to send code."
        });
      }
    } catch (err) {
      setDialog({
        show: true,
        title: "Error",
        message: "Could not connect to the server."
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 3. Finalize Registration
  // ==========================================
  const verifyAndRegisterAdmin = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          middleName: middleName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
          code: verificationCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDialog({
          show: true,
          title: "Success",
          message: "Admin account successfully created!"
        });
        setShowCodePopup(false);
      } else {
        setDialog({
          show: true,
          title: "Error",
          message: data.error || "Invalid verification code."
        });
      }
    } catch (err) {
      setDialog({
        show: true,
        title: "Error",
        message: "An error occurred during verification."
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading Screen while checking status
  if (checking) {
    return (
      <div className="admin-setup-container">
        <div className="admin-card">
          <p>Checking system security...</p>
        </div>
      </div>
    );
  }

  // UI if Admin already exists in system
  if (isAdminExists) {
    return (
      <div className="admin-setup-container">
        <div className="admin-card">
          <Lock size={60} color="#ef4444" style={{ marginBottom: "20px" }} />
          <h2>Registration Locked</h2>
          <p>This system already has an existing Administrator account.</p>
          <button onClick={() => navigate("/")} className="admin-btn">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Registration Form UI
  return (
    <div className="admin-setup-container">
      <div className="admin-card">
        <ShieldCheck size={40} color="#2563eb" style={{ marginBottom: "10px" }} />
        <h2>Admin Registration</h2>
        <p>System Administrator Setup</p>

        <form onSubmit={handleAdminSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Middle Name (Optional)"
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
          </div>

          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-wrapper" style={{ position: "relative", marginBottom: "15px" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", paddingRight: "45px" }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#888" }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="password-wrapper" style={{ position: "relative", marginBottom: "15px" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Admin Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: "100%", paddingRight: "45px" }}
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#888" }}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <button type="submit" className="admin-btn" disabled={loading}>
            {loading ? "Processing..." : "Register Administrator"}
          </button>
        </form>
      </div>

      {/* Dialog Overlay */}
      {dialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>{dialog.title}</h3>
            <p>{dialog.message}</p>
            <button onClick={handleDialogClose}>OK</button>
          </div>
        </div>
      )}

      {/* Verification Popup */}
{showCodePopup && (
  <div className="dialog-overlay">
    <div className="dialog-box verification-popup">
      <h3>Identity Verification</h3>
      <p>Please enter the code sent to <strong>{email}</strong></p>
      <input
        type="text"
        placeholder="000000"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        maxLength={6}
        className="code-input"
        style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '4px' }}
      />

      {/* Resend Code Button */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button
          type="button"
          onClick={async () => {
            if (!email.trim()) return; // Prevent sending if no email
            try {
              setLoading(true);
              const res = await fetch("http://localhost:5000/api/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
              });
              await res.json();
            } catch (err) {
              console.error("Resend code error:", err);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          style={{
            background: "none",
            border: "none",
            color: "#2563eb",
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "10px"
          }}
        >
          {loading ? "Resending..." : "Resend Code"}
        </button>
      </div>

      <div className="popup-buttons" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button 
          onClick={verifyAndRegisterAdmin} 
          disabled={loading || verificationCode.length < 6}
          className="verify-btn"
          style={{ flex: 1 }}
        >
          {loading ? "Verifying..." : "Verify & Complete"}
        </button>
        <button 
          onClick={() => {
            setShowCodePopup(false);
            // Clear dialog to prevent any message from showing when cancelling
            setDialog({ show: false, title: "", message: "" });
          }} 
          className="cancel-btn"
          style={{ flex: 1, backgroundColor: '#6b7280' }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default AdminRegister;