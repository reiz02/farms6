import React, { useState, useEffect } from "react";
import { FaUserCheck, FaTrashAlt, FaUsers, FaIdBadge } from "react-icons/fa";

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/employees");
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to load employees", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    const interval = setInterval(fetchEmployees, 5000);
    return () => clearInterval(interval);
  }, []);

  const approveEmployee = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/employees/approve/${id}`, { method: "PUT" });
      if (res.ok) fetchEmployees();
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("Sigurado ka bang nais mong i-delete ang employee na ito?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/employees/${id}`, { method: "DELETE" });
      if (res.ok) fetchEmployees();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="emp-container">
      <div className="emp-header">
        <div className="header-title">
          <FaUsers className="main-icon" />
          <div>
            <h2>Employee Management</h2>
            <p>Manage and approve employee access to the system</p>
          </div>
        </div>
        <div className="stats-badge">
          Total Employees: <strong>{employees.length}</strong>
        </div>
      </div>

      <div className="emp-card-wrapper">
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Loading records...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <p>No employee records found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th><FaIdBadge /> Name</th>
                  <th>Email Address</th>
                  <th>Assigned Section</th>
                  <th>Current Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td className="emp-name-cell">
                      <div className="avatar">{emp.firstName.charAt(0)}</div>
                      <span>{emp.firstName} {emp.lastName}</span>
                    </td>
                    <td className="emp-email">{emp.email}</td>
                    <td><span className="section-tag">{emp.section}</span></td>
                    <td>
                      <span className={`badge ${emp.status}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {emp.status === "pending" && (
                        <button className="btn-approve" onClick={() => approveEmployee(emp._id)} title="Approve">
                          <FaUserCheck /> Approve
                        </button>
                      )}
                      <button className="btn-delete" onClick={() => deleteEmployee(emp._id)} title="Delete">
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .emp-container {
          padding: 20px;
          animation: fadeIn 0.5s ease-in-out;
        }

        .emp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .main-icon {
          font-size: 2.5rem;
          color: #10b981;
          background: #ecfdf5;
          padding: 10px;
          border-radius: 15px;
        }

        .header-title h2 {
          margin: 0;
          color: #1e293b;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .header-title p {
          margin: 0;
          color: #64748b;
          font-size: 0.9rem;
        }

        .stats-badge {
          background: #ffffff;
          padding: 10px 20px;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          color: #475569;
          font-size: 0.9rem;
          border: 1px solid #e2e8f0;
        }

        .emp-card-wrapper {
          background: #ffffff;
          border-radius: 20px;
          padding: 10px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }

        .modern-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .modern-table th {
          padding: 18px 20px;
          text-align: left;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          border-bottom: 2px solid #f8fafc;
        }

        .modern-table td {
          padding: 15px 20px;
          vertical-align: middle;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
        }

        .emp-name-cell {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
        }

        .avatar {
          width: 35px;
          height: 35px;
          background: #10b981;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-weight: bold;
        }

        .section-tag {
          background: #f1f5f9;
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .badge {
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .badge.approved { background: #dcfce7; color: #166534; }
        .badge.pending { background: #fef9c3; color: #854d0e; }

        .actions-cell {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .btn-approve {
          background: #10b981;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-approve:hover { background: #059669; transform: translateY(-2px); }

        .btn-delete {
          background: #fee2e2;
          color: #ef4444;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-delete:hover { background: #ef4444; color: white; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #10b981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default EmployeePage;