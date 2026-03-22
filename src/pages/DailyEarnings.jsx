// DailyEarnings.js
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function DailyEarnings({ data = [] }) {
  // Aggregate data by date
  const aggregated = data.reduce((acc, item) => {
    const d = new Date(item.date || item.createdAt); // handle different sources
    const dateKey = d.toLocaleDateString("en-US");

    if (!acc[dateKey]) acc[dateKey] = 0;
    acc[dateKey] += item.total || item.amount;
    return acc;
  }, {});

  const formattedData = Object.entries(aggregated)
    .map(([dateStr, amount]) => {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }),
        amount,
        timestamp: d.getTime()
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid stroke="#eee" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="amount" stroke="#4e73df" strokeWidth={3} dot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default DailyEarnings;