import React, { useEffect, useState } from "react";

function TotalEarningsCard() {
  const [total, setTotal] = useState(0);

  const fetchTotal = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/reports");
      const data = await res.json();

      const today = new Date();
      const currentMonth = today.getMonth(); // 0-indexed: Jan = 0
      const currentYear = today.getFullYear();

      // Check last stored month
      const lastFetch = JSON.parse(localStorage.getItem("totalEarningsMonth") || "{}");
      if (lastFetch.month !== currentMonth || lastFetch.year !== currentYear) {
        // New month -> reset total
        setTotal(0);
      }

      // Sum totals for current month only
      const totalSum = (data.dailyHistory || [])
        .filter(item => {
          const itemDate = new Date(item.date); // assuming item.date is ISO string
          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        })
        .reduce((sum, item) => sum + item.total, 0);

      setTotal(totalSum);

      // Store current month in localStorage
      localStorage.setItem("totalEarningsMonth", JSON.stringify({ month: currentMonth, year: currentYear }));
    } catch (err) {
      console.error("Total earnings fetch error:", err);
    }
  };

  useEffect(() => {
    fetchTotal();
  }, []);

  return (
    <div style={{ flex: 1, background: "#1cc88a", color: "#fff", padding: "25px", borderRadius: "10px" }}>
      <div style={{ fontSize: "12px", fontWeight: "bold" }}>TOTAL EARNINGS</div>
      <div style={{ fontSize: "28px", fontWeight: "bold" }}>
        ₱{total.toLocaleString()}
      </div>
    </div>
  );
}

export default TotalEarningsCard;