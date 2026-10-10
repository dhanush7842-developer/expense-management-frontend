import React from "react";
import { Pie } from "react-chartjs-2";
import { CHART_COLORS } from "../utils/chartSetup";
import { formatCurrency } from "../utils/helpers";

function CategoryPieChart({ data = [] }) {
    const safeData = Array.isArray(data) ? data : [];
    const chartData = {
        labels: safeData.map((item) => item?.categoryName || "Uncategorized"),
        datasets: [
            {
                data: safeData.map((item) => Number(item?.totalAmount || 0)),
                backgroundColor: safeData.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "bottom" },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.label}: ${formatCurrency(context.parsed)}`,
                },
            },
        },
    };

    return (
        <div className="chart-box">
            <Pie data={chartData} options={options} />
        </div>
    );
}

export default CategoryPieChart;