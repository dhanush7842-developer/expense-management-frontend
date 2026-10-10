import React from "react";
import { Bar } from "react-chartjs-2";
import { MONTH_NAMES } from "../utils/chartSetup";
import { formatCurrency } from "../utils/helpers";

function MonthlyBarChart({ data = [] }) {
    const safeData = Array.isArray(data) ? data : [];
    // Ensure all 12 months align with MONTH_NAMES
    const monthlyValues = MONTH_NAMES.map((_, index) => {
        const found = safeData.find((item) => item?.month === index + 1);
        if (found) return Number(found.totalAmount || 0);
        return safeData[index] ? Number(safeData[index].totalAmount || 0) : 0;
    });

    const chartData = {
        labels: MONTH_NAMES,
        datasets: [
            {
                label: "Expenses",
                data: monthlyValues,
                backgroundColor: "#3b82f6",
                borderRadius: 4,
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
                    label: (context) => formatCurrency(context.parsed.y),
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => "₹" + Number(value).toLocaleString("en-IN"),
                },
            },
        },
    };

    return (
        <div className="chart-box">
            <Bar data={chartData} options={options} />
        </div>
    );
}

export default MonthlyBarChart;