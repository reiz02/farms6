import React, { useEffect, useState, useCallback } from "react";
import { FaTrash, FaPlusCircle, FaChartLine } from "react-icons/fa";

const ReportsPage = () => {
  const [amount, setAmount] = useState("");
  const [submissions, setSubmissions] = useState([]);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/earnings");
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:5000/api/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeEmail: "admin@farmops.com", amount: amount })
      });
      setAmount("");
      fetchSubmissions();
    } catch (err) {
      console.log("Submit error:", err);
    }
  };

  const deleteRecord = async (id) => {
    if (window.confirm("Are you sure?")) {
      await fetch(`http://localhost:5000/api/earnings/${id}`, { method: "DELETE" });
      fetchSubmissions();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", marginBottom: "20px" }}>Submit Daily Earnings</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "15px" }}>
          <input
            type="number"
            placeholder="Enter daily income (₱)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={{ flex: 1, padding: "12px 15px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" }}
          />
          <button type="submit" style={{ backgroundColor: "#57b894", color: "white", border: "none", padding: "12px 25px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <FaPlusCircle /> Submit Report
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1e293b", marginBottom: "20px" }}>Submission History</h3>
        
        {submissions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
            <FaChartLine size={40} style={{ marginBottom: "10px", opacity: 0.2 }} />
            <p>No reports submitted yet.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <th style={thStyle}>Employee</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((item) => (
                <tr key={item._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={tdStyle}>{item.employeeEmail}</td>
                  <td style={tdStyle}>₱{Number(item.amount).toLocaleString()}</td>
                  <td style={tdStyle}>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    <button onClick={() => deleteRecord(item._id)} style={{ background: "#fee2e2", color: "#ef4444", border: "none", padding: "8px", borderRadius: "8px", cursor: "pointer" }}>
                      <FaTrash size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const thStyle = { textAlign: "left", padding: "15px", color: "#64748b", fontSize: "13px", fontWeight: "600" };
const tdStyle = { padding: "15px", color: "#1e293b", fontSize: "14px" };

export default ReportsPage;