import React, { useEffect, useState, useCallback } from "react";
import { FaTrash, FaPlus, FaHistory, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";

const ReportsPage = () => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Income");

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const today = getTodayString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [submissions, setSubmissions] = useState([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/earnings");
      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      const filtered = data.filter(item => item.employeeEmail === user?.email);
      setSubmissions(filtered);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) fetchSubmissions();
  }, [fetchSubmissions, user?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !selectedDate) return;

    try {
      const response = await fetch("http://localhost:5000/api/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail: user.email,
          amount: Number(amount),
          date: selectedDate,
          description,
          type,
          encodedBy: user.email,
          role: user.role
        })
      });

      if (response.ok) {
        setAmount("");
        setDescription("");
        setType("Income");
        setSelectedDate(today);
        await fetchSubmissions();
        setShowSuccessDialog(true);
        setTimeout(() => setShowSuccessDialog(false), 3000);
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const deleteRecord = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      await fetch(`http://localhost:5000/api/earnings/${id}`, {
        method: "DELETE"
      });
      fetchSubmissions();
    }
  };

  // Internal Styles to match Dashboard
  const styles = {
    container: { padding: "30px 40px", fontFamily: "'Inter', sans-serif", color: "#333" },
    card: { background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", marginBottom: "30px" },
    title: { fontSize: "18px", fontWeight: "bold", marginBottom: "20px", color: "#1f2933", display: "flex", alignItems: "center", gap: "10px" },
    formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", alignItems: "flex-end" },
    inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
    label: { fontSize: "13px", fontWeight: "600", color: "#666" },
    input: { padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", outline: "none" },
    submitBtn: { background: "#57b894", color: "white", border: "none", padding: "11px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "0.3s" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "10px", textAlign: "left" },
    th: { background: "#f8f9fc", padding: "12px 15px", borderBottom: "2px solid #e3e6f0", color: "#4e73df", fontSize: "13px", textTransform: "uppercase" },
    td: { padding: "12px 15px", borderBottom: "1px solid #eee", fontSize: "14px" },
    badgeIncome: { background: "#e1f5fe", color: "#0288d1", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" },
    badgeExpense: { background: "#ffebee", color: "#d32f2f", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" },
    deleteBtn: { color: "#ff6b6b", border: "none", background: "none", cursor: "pointer", fontSize: "16px" }
  };

  return (
    <div style={styles.container}>
      {/* FORM CARD */}
      <div style={styles.card}>
        <div style={styles.title}><FaPlus /> Submit Daily Report</div>
        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Date</label>
            <input style={styles.input} type="date" value={selectedDate} max={today} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <input style={styles.input} type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Sales, Feeds" />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Type</label>
            <select style={styles.input} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Amount (₱)</label>
            <input style={styles.input} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>

          <button type="submit" style={styles.submitBtn}>
            <FaCheckCircle /> Submit Report
          </button>
        </form>
      </div>

      {/* TABLE CARD */}
      <div style={styles.card}>
        <div style={styles.title}><FaHistory /> Submission History</div>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length > 0 ? (
                submissions.map((item) => (
                  <tr key={item._id}>
                    <td style={styles.td}>{new Date(item.date || item.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>{item.description || "-"}</td>
                    <td style={styles.td}>
                      <span style={item.type === "Expense" ? styles.badgeExpense : styles.badgeIncome}>
                        {item.type || "Income"}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: "bold" }}>₱{item.amount.toLocaleString()}</td>
                    <td style={styles.td}><small style={{color: "#888"}}>{item.role || "employee"}</small></td>
                    <td style={styles.td}>
                      <button onClick={() => deleteRecord(item._id)} style={styles.deleteBtn} title="Delete Record">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: "center", color: "#999", padding: "40px" }}>
                    No reports submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showSuccessDialog && (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", background: "#57b894", color: "white", padding: "15px 25px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "10px", zIndex: 9999 }}>
          <FaCheckCircle /> Record added successfully!
        </div>
      )}
    </div>
  );
};

export default ReportsPage;