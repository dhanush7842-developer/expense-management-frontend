import React from "react";
import { Bar } from "react-chartjs-2";
import { formatCurrency } from "../utils/helpers";

function DailySpendingChart({ data = [] }) {
    const safeData = data || [];
    const chartData = {
        labels: safeData.map((item) => item.day),
        datasets: [
            {
                label: "Daily spending",
                data: safeData.map((item) => Number(item.totalAmount)),
                backgroundColor: "#10b981",
                borderRadius: 3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    // Tooltip title shows the full date, e.g. 2026-10-03
                    title: (items) => safeData[items[0]?.dataIndex]?.date || "",
                    label: (context) => formatCurrency(context.parsed.y),
                },
            },
        },
        scales: {
            x: { title: { display: true, text: "Day of month" } },
            y: {
                beginAtZero: true,
                ticks: { callback: (value) => "₹" + value },
            },
        },
    };

    return (
        <div className="chart-box">
            <Bar data={chartData} options={options} />
        </div>
    );
}

export default DailySpendingChart;