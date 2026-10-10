import React, { useEffect, useState } from "react";
import CategoryDoughnutChart from "./CategoryDoughnutChart";
import DailySpendingChart from "./DailySpendingChart";
import {
    getAnalyticsSummary,
    getCategorySpending,
    getDailySpending,
} from "../services/analyticsService";
import { MONTH_NAMES } from "../utils/chartSetup";
import { formatCurrency, getErrorMessage } from "../utils/helpers";

function ExpenseAnalytics() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const yearOptions = [0, 1, 2, 3, 4].map((i) => currentYear - i);

    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(currentYear);
    const [summary, setSummary] = useState(null);
    const [categoryData, setCategoryData] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Reload whenever the selected month or year changes
    useEffect(() => {
        let ignore = false;   // ignore old responses if the user changes the month quickly

        const loadAnalytics = async () => {
            setLoading(true);
            setError("");
            try {
                const [summaryResult, categoryResult, dailyResult] = await Promise.all([
                    getAnalyticsSummary(month, year),
                    getCategorySpending(month, year),
                    getDailySpending(month, year),
                ]);
                if (!ignore) {
                    setSummary(summaryResult);
                    setCategoryData(categoryResult);
                    setDailyData(dailyResult);
                }
            } catch (err) {
                if (!ignore) {
                    setSummary(null);
                    setError(getErrorMessage(err, "Failed to load analytics"));
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        loadAnalytics();
        return () => {
            ignore = true;
        };
    }, [month, year]);

    return (
        <div className="card">
            <div className="toolbar">
                <h3>Expense Analytics</h3>
                <div className="analytics-filter">
                    <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                        {MONTH_NAMES.map((name, index) => (
                            <option key={name} value={index + 1}>
                                {name}
                            </option>
                        ))}
                    </select>
                    <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                        {yearOptions.map((optionYear) => (
                            <option key={optionYear} value={optionYear}>
                                {optionYear}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {loading && <p>Loading analytics...</p>}

            {!loading && summary && (
                <>
                    <div className="stats-grid">
                        <div className="card stat-card">
                            <h4>Total Expenses</h4>
                            <p>{formatCurrency(summary.totalAmount)}</p>
                        </div>
                        <div className="card stat-card">
                            <h4>Number of Expenses</h4>
                            <p>{summary.expenseCount}</p>
                        </div>
                        <div className="card stat-card">
                            <h4>Average Expense</h4>
                            <p>{formatCurrency(summary.averageExpense)}</p>
                        </div>
                        <div className="card stat-card">
                            <h4>Highest Expense</h4>
                            <p>{formatCurrency(summary.highestExpense)}</p>
                        </div>
                        <div className="card stat-card">
                            <h4>Lowest Expense</h4>
                            <p>{formatCurrency(summary.lowestExpense)}</p>
                        </div>
                    </div>

                    {summary.expenseCount === 0 ? (
                        <p className="empty-state">
                            No expenses in {MONTH_NAMES[month - 1]} {year}.
                        </p>
                    ) : (
                        <div className="charts-grid">
                            <div>
                                <h4 className="chart-title">
                                    Category-wise Spending ({MONTH_NAMES[month - 1]} {year})
                                </h4>
                                <CategoryDoughnutChart data={categoryData} />

                                <div className="table-wrapper report-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Category</th>
                                                <th>Amount</th>
                                                <th>Share</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categoryData.map((item) => (
                                                <tr key={item.categoryName}>
                                                    <td>{item.categoryName}</td>
                                                    <td>{formatCurrency(item.totalAmount)}</td>
                                                    <td>
                                                        {Number(summary.totalAmount) > 0
                                                            ? ((Number(item.totalAmount) / Number(summary.totalAmount)) * 100).toFixed(1)
                                                            : "0.0"}
                                                        %
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div>
                                <h4 className="chart-title">
                                    Daily Spending ({MONTH_NAMES[month - 1]} {year})
                                </h4>
                                <DailySpendingChart data={dailyData} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ExpenseAnalytics;