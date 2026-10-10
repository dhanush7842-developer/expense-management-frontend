import React, { useEffect, useState } from "react";
import CategoryPieChart from "../components/CategoryPieChart";
import MonthlyBarChart from "../components/MonthlyBarChart";
import TrendLineChart from "../components/TrendLineChart";
import { getCategoryWise, getMonthly } from "../services/dashboardService";
import { MONTH_NAMES } from "../utils/chartSetup";
import { formatCurrency, getErrorMessage } from "../utils/helpers";

function Reports() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const yearOptions = [0, 1, 2, 3, 4].map((i) => currentYear - i);

  const [year, setYear] = useState(currentYear);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Initial load: fetch category and monthly data together
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      setLoading(true);
      setError("");
      try {
        const [catData, monData] = await Promise.all([
          getCategoryWise(),
          getMonthly(currentYear),
        ]);
        if (isMounted) {
          setCategoryData(Array.isArray(catData) ? catData : []);
          setMonthlyData(Array.isArray(monData) ? monData : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err, "Failed to load reports"));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, [currentYear]);

  // When selected year changes (other than initial load)
  useEffect(() => {
    let isMounted = true;
    const loadYearData = async () => {
      try {
        const monData = await getMonthly(year);
        if (isMounted) {
          setMonthlyData(Array.isArray(monData) ? monData : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err, "Failed to load monthly report"));
        }
      }
    };

    loadYearData();
    return () => {
      isMounted = false;
    };
  }, [year]);

  // ---------- Calculations ----------
  const monthlyAmounts = (monthlyData || []).map((item) => Number(item?.totalAmount || 0));
  const yearTotal = monthlyAmounts.reduce((sum, amount) => sum + amount, 0);

  // For the current year, only count months that have started
  const monthsCounted = (year === currentYear ? currentMonth : 12) || 1;
  const averagePerMonth = yearTotal / monthsCounted;

  const highestAmount = Math.max(0, ...monthlyAmounts);
  const highestIndex = highestAmount > 0 ? monthlyAmounts.indexOf(highestAmount) : -1;
  const highestMonthName =
    highestIndex >= 0 && highestIndex < MONTH_NAMES.length
      ? MONTH_NAMES[highestIndex]
      : "N/A";

  const categoryTotal = (categoryData || []).reduce(
    (sum, item) => sum + Number(item?.totalAmount || 0),
    0
  );

  // % change compared with the previous month (null when it cannot be calculated)
  const getChange = (index) => {
    if (index === 0 || !monthlyAmounts[index - 1]) {
      return null;
    }
    const previous = monthlyAmounts[index - 1];
    const current = monthlyAmounts[index];
    if (previous <= 0) {
      return null;
    }
    return ((current - previous) / previous) * 100;
  };

  const renderChange = (change) => {
    if (change === null || isNaN(change)) {
      return "-";
    }
    if (change > 0) {
      return <span className="trend-up">▲ {change.toFixed(1)}%</span>;
    }
    if (change < 0) {
      return <span className="trend-down">▼ {Math.abs(change).toFixed(1)}%</span>;
    }
    return "0.0%";
  };

  if (loading) {
    return <p>Loading reports...</p>;
  }

  return (
    <div>
      <h2 className="page-title">Reports</h2>

      {error && <div className="error-message">{error}</div>}

      {/* ---------- Category-wise analysis (all time) ---------- */}
      <div className="card">
        <h3>Category-wise Analysis (All Time)</h3>

        {categoryData.length === 0 ? (
          <p className="empty-state">No expense data yet.</p>
        ) : (
          <div className="charts-grid">
            <CategoryPieChart data={categoryData} />

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map((item, index) => (
                    <tr key={item?.categoryName || index}>
                      <td>{item?.categoryName || "Uncategorized"}</td>
                      <td>{formatCurrency(item?.totalAmount)}</td>
                      <td>
                        {categoryTotal > 0
                          ? ((Number(item?.totalAmount || 0) / categoryTotal) * 100).toFixed(1)
                          : "0.0"}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ---------- Monthly summary and trends (by year) ---------- */}
      <div className="card">
        <div className="toolbar">
          <h3>Monthly Summary and Spending Trend</h3>
          <div className="report-filter">
            <label>Year: </label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {yearOptions.map((optionYear) => (
                <option key={optionYear} value={optionYear}>
                  {optionYear}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="stats-grid">
          <div className="card stat-card">
            <h4>Total in {year}</h4>
            <p>{formatCurrency(yearTotal)}</p>
          </div>
          <div className="card stat-card">
            <h4>Average per Month</h4>
            <p>{formatCurrency(averagePerMonth)}</p>
          </div>
          <div className="card stat-card">
            <h4>Highest Month</h4>
            <p>{highestMonthName}</p>
          </div>
        </div>

        {yearTotal === 0 ? (
          <p className="empty-state">No expenses recorded in {year}.</p>
        ) : (
          <>
            <div className="charts-grid">
              <div>
                <h4 className="chart-title">Monthly Expenses</h4>
                <MonthlyBarChart data={monthlyData} />
              </div>
              <div>
                <h4 className="chart-title">Spending Trend</h4>
                <TrendLineChart data={monthlyData} />
              </div>
            </div>

            <div className="table-wrapper report-table">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Total</th>
                    <th>Change vs Previous Month</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((item, index) => (
                    <tr key={item?.month || index}>
                      <td>{MONTH_NAMES[index]} {year}</td>
                      <td>{formatCurrency(item?.totalAmount)}</td>
                      <td>{renderChange(getChange(index))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Reports;