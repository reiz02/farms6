import React, { useEffect, useState, useCallback } from "react";

const ReportsPage = () => {
  const [amount, setAmount] = useState("");
  
  // Helper function to get today's date in YYYY-MM-DD format based on local time
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getTodayString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [submissions, setSubmissions] = useState([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/earnings");
      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      // Filter based on logged-in user
      const filtered = data.filter(item => item.employeeEmail === user?.email);
      setSubmissions(filtered);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) fetchSubmissions();
  }, [fetchSubmissions, user?.email]);

  // Logic to prevent manual typing of future dates
  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    if (inputDate > today) {
      alert("You cannot select a future date.");
      setSelectedDate(today); // Revert to today
    } else {
      setSelectedDate(inputDate);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final Validation Guard
    if (selectedDate > today) {
      alert("Invalid date. Please select a past or present date.");
      return;
    }

    if (!amount || !selectedDate) return;

    try {
      const response = await fetch("http://localhost:5000/api/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail: user.email, 
          amount: Number(amount),
          date: selectedDate // Saving the specific income date
        })
      });

      if (response.ok) {
        setAmount("");
        setSelectedDate(today); // Reset to current date
        await fetchSubmissions(); 
        setShowSuccessDialog(true);
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const deleteRecord = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      await fetch(`http://localhost:5000/api/earnings/${id}`, { method: "DELETE" });
      fetchSubmissions();
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      <h2 style={{ color: "#333" }}>Reports (Admin View)</h2>

      <div style={{ 
        backgroundColor: "white", 
        padding: "30px", 
        borderRadius: "12px", 
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        maxWidth: "600px"
      }}>
        <h3 style={{ marginTop: 0, fontSize: "18px" }}>Submit Daily Income</h3>
        <p style={{ fontSize: "14px", color: "#666" }}>Logged in as: <strong>{user?.email}</strong></p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#444" }}>
              Select Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              max={today} // Disables future dates in the calendar picker
              onChange={handleDateChange}
              required
              style={{ 
                width: "100%", 
                padding: "12px", 
                borderRadius: "6px", 
                border: "1px solid #ddd",
                fontSize: "16px",
                outlineColor: "#4f73df"
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#444" }}>
              Daily Income:
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{ 
                width: "100%", 
                padding: "12px", 
                borderRadius: "6px", 
                border: "1px solid #ddd",
                fontSize: "16px",
                outlineColor: "#4f73df"
              }}
            />
          </div>

          <button type="submit" style={{ 
            width: "100%", 
            padding: "14px", 
            backgroundColor: "#4f73df", 
            color: "white", 
            border: "none", 
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
            transition: "background 0.3s"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#3e5fcb"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#4f73df"}
          >
            Submit Income
          </button>
        </form>
      </div>

      <div style={{ marginTop: "50px" }}>
        <h3 style={{ borderBottom: "2px solid #4f73df", display: "inline-block", paddingBottom: "5px" }}>
          Submission History
        </h3>
        <div style={{ backgroundColor: "white", borderRadius: "12px", overflow: "hidden", marginTop: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", backgroundColor: "#f8f9fc", color: "#4f73df" }}>
                <th style={{ padding: "15px" }}>Employee</th>
                <th style={{ padding: "15px" }}>Amount</th>
                <th style={{ padding: "15px" }}>Date of Income</th>
                <th style={{ padding: "15px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length > 0 ? (
                submissions.map((item) => (
                  <tr key={item._id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "15px" }}>{item.employeeEmail}</td>
                    <td style={{ padding: "15px", fontWeight: "bold" }}>₱{item.amount.toLocaleString()}</td>
                    <td style={{ padding: "15px" }}>
                      {/* Uses saved date, falls back to creation date if missing */}
                      {item.date ? new Date(item.date).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "15px" }}>
                      <button 
                        onClick={() => deleteRecord(item._id)} 
                        style={{ color: "#e74a3b", border: "none", background: "none", cursor: "pointer", fontWeight: "600" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: "30px", textAlign: "center", color: "#999" }}>No submissions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            background: "white", padding: "40px", borderRadius: "15px",
            width: "350px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
          }}>
            <div style={{ fontSize: "50px", color: "#1cc88a", marginBottom: "15px" }}>✓</div>
            <h3 style={{ margin: "0 0 10px 0" }}>Success!</h3>
            <p style={{ color: "#666", marginBottom: "25px" }}>Income record has been added.</p>
            <button
              onClick={() => setShowSuccessDialog(false)}
              style={{ 
                padding: "10px 40px", 
                borderRadius: "6px", 
                border: "none", 
                backgroundColor: "#4f73df", 
                color: "white", 
                fontWeight: "bold",
                cursor: "pointer" 
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;