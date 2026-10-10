import React from "react";
import { Doughnut } from "react-chartjs-2";
import { CHART_COLORS } from "../utils/chartSetup";
import { formatCurrency } from "../utils/helpers";

function CategoryDoughnutChart({ data = [] }) {
    const chartData = {
        labels: (data || []).map((item) => item.categoryName),
        datasets: [
            {
                data: (data || []).map((item) => Number(item.totalAmount)),
                backgroundColor: CHART_COLORS,
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "55%",
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
            <Doughnut data={chartData} options={options} />
        </div>
    );
}

export default CategoryDoughnutChart;