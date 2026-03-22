import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // Import para sa visibility toggle
import "./register.css";

function Register() {
  // Form States
  const [firstName, setFname] = useState("");
  const [middleName, setMname] = useState("");
  const [lastName, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [confirmPassword, setConfirmPass] = useState("");
  
  // BAGUGO: Ginawang empty string para walang default selection
  const [section, setSection] = useState("");

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & UI States
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodePopup, setShowCodePopup] = useState(false);
  const [dialog, setDialog] = useState({
    show: false,
    title: "",
    message: ""
  });

  const navigate = useNavigate();

  const closeDialog = () => {
    setDialog({ show: false, title: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Basic Field Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword || !section) {
      setDialog({
        show: true,
        title: "Error",
        message: "Please fill out all required fields, including Assigned Section."
      });
      return;
    }

    // 2. Password Match Check
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
      // 3. Request OTP/Verification Code from Backend
      const response = await fetch("http://localhost:5000/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowCodePopup(true);
        setDialog({
          show: true,
          title: "Verification Sent",
          message: "A verification code has been sent to your email."
        });
      } else {
        setDialog({
          show: true,
          title: "Error",
          message: data.error || "Failed to send verification code."
        });
      }
    } catch (err) {
      console.error("Send code error:", err);
      setDialog({
        show: true,
        title: "Server Error",
        message: "Could not connect to the server."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email.trim()) {
      setDialog({
        show: true,
        title: "Error",
        message: "Please enter your email before resending the verification code."
      });
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await response.json();

      if (response.ok) {
        setDialog({
          show: true,
          title: "Success",
          message: "A new verification code has been sent successfully."
        });
      } else {
        setDialog({
          show: true,
          title: "Error",
          message: data.error || "Failed to send verification code."
        });
      }
    } catch (err) {
      console.error("Resend code error:", err);
      setDialog({
        show: true,
        title: "Server Error",
        message: "Could not connect to the server."
      });
    } finally {
      setResendLoading(false);
    }
  };

  const verifyAndRegister = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          middleName: middleName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
          section,
          code: verificationCode
        })
      });

      const data = await response.json();

      if (response.ok) {
        setDialog({
          show: true,
          title: "Success",
          message: "Account created! Please wait for admin approval."
        });
        setShowCodePopup(false);
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setDialog({
          show: true,
          title: "Error",
          message: data.error || "Incorrect verification code."
        });
      }
    } catch (err) {
      console.error("Register error:", err);
      setDialog({
        show: true,
        title: "Error",
        message: "There was a problem saving your account."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Employee Registration</h2>
        <p className="subtitle">All new employees must wait for approval</p>

        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFname(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Middle Name (Optional)"
              value={middleName}
              onChange={(e) => setMname(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLname(e.target.value)}
              required
            />
          </div>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-field-container" style={{ position: "relative", marginBottom: "15px" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPass(e.target.value)}
              required
              style={{ width: "100%", paddingRight: "45px" }}
            />
            <span 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#666" }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="password-field-container" style={{ position: "relative", marginBottom: "15px" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
              style={{ width: "100%", paddingRight: "45px" }}
            />
            <span 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#666" }}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="section-select">
            <label>Assigned Section:</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              required
            >
              <option value="" disabled hidden>Select Section</option>
              <option value="Inventory">Inventory</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Sending Code..." : "Create Account"}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </div>

      {dialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>{dialog.title}</h3>
            <p>{dialog.message}</p>
            <button onClick={closeDialog}>OK</button>
          </div>
        </div>
      )}

      {showCodePopup && (
        <div className="dialog-overlay">
          <div className="dialog-box verification-popup">
            <h3>Email Verification</h3>
            <p>Please input the 6-digit code</p>
            <input
              type="text"
              placeholder="######"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="otp-input"
            />

            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                {resendLoading ? "Resending..." : "Resend Code"}
              </button>
            </div>
          <div className="popup-actions">
            <button
              onClick={verifyAndRegister}
              className="verify-btn"
              disabled={loading}
              >
               {loading ? "Verifying..." : "Verify & Register"}
              </button>
            <button
                onClick={() => {
                setShowCodePopup(false);
                setDialog({ show: false, title: "", message: "" });
                }}
              className="cancel-btn"
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

export default Register;