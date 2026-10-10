import React, { useState } from "react";
import { saveBudget } from "../services/budgetService";
import { MONTH_NAMES } from "../utils/chartSetup";
import { formatCurrency, getErrorMessage } from "../utils/helpers";

function BudgetCard({ budget, onBudgetSaved }) {
    // Show the form directly if no budget is set yet
    const [editing, setEditing] = useState(!budget.budgetSet);
    const [amount, setAmount] = useState(budget.budgetSet ? budget.budgetAmount : "");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const percentage = Number(budget.percentageUsed);
    const isOverBudget = budget.budgetSet && Number(budget.remainingAmount) < 0;

    // CSS class names like "alert-warning" and "progress-critical" come from the backend alertLevel
    const levelClass = budget.alertLevel ? budget.alertLevel.toLowerCase() : "normal";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!amount || Number(amount) <= 0) {
            setError("Budget must be greater than 0");
            return;
        }

        setSaving(true);
        try {
            // Field names must match BudgetRequest.java exactly
            const saved = await saveBudget({
                amount: Number(amount),
                month: budget.month,
                year: budget.year,
            });
            onBudgetSaved(saved);   // tell the Dashboard to show the new data
            setEditing(false);
        } catch (err) {
            setError(getErrorMessage(err, "Failed to save budget"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="card">
            <div className="toolbar">
                <h3>
                    Monthly Budget ({MONTH_NAMES[budget.month - 1]} {budget.year})
                </h3>
                {budget.budgetSet && !editing && (
                    <button
                        className="btn btn-small"
                        onClick={() => {
                            setAmount(budget.budgetAmount);
                            setEditing(true);
                        }}
                    >
                        Edit Budget
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

            {editing && (
                <form className="budget-form" onSubmit={handleSubmit}>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter monthly budget (₹)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <button type="submit" className="btn" disabled={saving}>
                        {saving ? "Saving..." : budget.budgetSet ? "Update" : "Set Budget"}
                    </button>
                    {budget.budgetSet && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setEditing(false);
                                setError("");
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </form>
            )}

            {!budget.budgetSet && !editing && <p className="empty-state">No budget set for this month.</p>}

            {budget.budgetSet && (
                <>
                    {/* Budget alert (message comes from the backend, calculated from real expenses) */}
                    {budget.alertMessage && (
                        <div className={`budget-alert alert-${levelClass}`}>{budget.alertMessage}</div>
                    )}

                    <div className="stats-grid">
                        <div className="card stat-card">
                            <h4>Monthly Budget</h4>
                            <p>{formatCurrency(budget.budgetAmount)}</p>
                        </div>
                        <div className="card stat-card">
                            <h4>Spent This Month</h4>
                            <p>{formatCurrency(budget.totalSpent)}</p>
                        </div>
                        <div className="card stat-card">
                            <h4>{isOverBudget ? "Over Budget By" : "Remaining Budget"}</h4>
                            <p className={isOverBudget ? "text-danger" : ""}>
                                {formatCurrency(Math.abs(Number(budget.remainingAmount)))}
                            </p>
                        </div>
                        <div className="card stat-card">
                            <h4>Budget Used</h4>
                            <p>{percentage.toFixed(1)}%</p>
                        </div>
                    </div>

                    <div className="progress-bar">
                        <div
                            className={`progress-fill progress-${levelClass}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default BudgetCard;