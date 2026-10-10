import React, { useEffect, useState } from "react";
import BudgetCard from "../components/BudgetCard";
import ExpenseAnalytics from "../components/ExpenseAnalytics";
import RecentExpenses from "../components/RecentExpenses";
import SavingsGoalsSummary from "../components/SavingsGoalsSummary";
import SmartInsights from "../components/SmartInsights";
import { getCurrentBudget } from "../services/budgetService";
import { getSummary } from "../services/dashboardService";
import { formatCurrency, getErrorMessage } from "../utils/helpers";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [budget, setBudget] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Call both APIs at the same time (JWT is added by the Axios interceptor)
        const [summaryResult, budgetResult] = await Promise.all([
          getSummary(),
          getCurrentBudget(),
        ]);
        setSummary(summaryResult);
        setBudget(budgetResult);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load dashboard"));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>

      {/* 1. Summary cards (Total Expenses and others) */}
      <div className="stats-grid">
        <div className="card stat-card">
          <h4>Total Expenses</h4>
          <p>{formatCurrency(summary.totalExpenses)}</p>
        </div>
        <div className="card stat-card">
          <h4>This Month</h4>
          <p>{formatCurrency(summary.currentMonthTotal)}</p>
        </div>
        <div className="card stat-card">
          <h4>Number of Expenses</h4>
          <p>{summary.expenseCount}</p>
        </div>
        <div className="card stat-card">
          <h4>Top Category</h4>
          <p>{summary.topCategory}</p>
        </div>
      </div>

      {/* 2-6. Monthly budget, spent, remaining, % used and budget alert */}
      {budget && <BudgetCard budget={budget} onBudgetSaved={setBudget} />}

      {/* 11. Smart insights  |  7-8. Savings goals and progress */}
      <div className="dashboard-grid">
        <SmartInsights refreshTrigger={budget} />
        <SavingsGoalsSummary />
      </div>

      {/* 9-10. Category-wise chart and daily spending chart (with month selector) */}
      <ExpenseAnalytics />

      {/* 12. Recent expenses */}
      <RecentExpenses />
    </div>
  );
}

export default Dashboard;