import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./register.css";

function Register() {
  const [firstName, setFname] = useState("");
  const [middleName, setMname] = useState("");
  const [lastName, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  // 1. Gawing empty string ang initial state
  const [section, setSection] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ show: false, title: "", message: "" });

  const navigate = useNavigate();
  const closeDialog = () => setDialog({ show: false, title: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 2. Dagdagan ng validation para sa section
    if (!firstName || !lastName || !email || !password || !section) {
      setDialog({ 
        show: true, 
        title: "Error", 
        message: "Please fill all required fields, including the Assigned Section." 
      });
      return;
    }

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
          section
        })
      });

      const data = await response.json();
      if (response.ok) {
        setDialog({ show: true, title: "Success", message: data.message });
        setTimeout(() => navigate("/"), 2000);
      } else {
        setDialog({ show: true, title: "Error", message: data.error || "Registration failed" });
      }
    } catch (err) {
      setDialog({ show: true, title: "Error", message: "Server error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="logo-container">
        <h1 className="system-name">Farm<span>Ops</span></h1>
      </div>

      <h2>Employee Registration</h2>
      <p className="sub-text">All new employees must wait for admin approval.</p>

      <form onSubmit={handleSubmit} autoComplete="off">
        {/* ... (First Name, Middle Name, Last Name, Email, Password inputs stay the same) ... */}
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFname(e.target.value)} required />
        <input type="text" placeholder="Middle Name (optional)" value={middleName} onChange={(e) => setMname(e.target.value)} />
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLname(e.target.value)} required />
        <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPass(e.target.value)} required />

        <label>Assigned Section</label>
        <select 
          value={section} 
          onChange={(e) => setSection(e.target.value)}
          required
        >
          {/* 3. Placeholder option: disabled at hidden para hindi na pwedeng balikan pag nakapili na */}
          <option value="" disabled hidden>-- Select Section --</option>
          <option value="Inventory">Inventory</option>
          <option value="Finance">Reports</option>
        </select>

        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? "Registering..." : "Create Employee Account"}
        </button>
      </form>

      <Link to="/" className="back-link">Back to Login</Link>

      {/* ... (Dialog code stays the same) ... */}
      {dialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3 style={{ color: dialog.title === "Success" ? "#57b894" : "#f87171" }}>
              {dialog.title}
            </h3>
            <p>{dialog.message}</p>
            <button onClick={closeDialog}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;