import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllExpenses } from "../services/expenseService";
import { formatCurrency, getErrorMessage } from "../utils/helpers";

const RECENT_COUNT = 5;

function RecentExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadExpenses = async () => {
            try {
                // The API already returns the newest expenses first
                const data = await getAllExpenses();
                setExpenses(data.slice(0, RECENT_COUNT));
            } catch (err) {
                setError(getErrorMessage(err, "Failed to load recent expenses"));
            } finally {
                setLoading(false);
            }
        };

        loadExpenses();
    }, []);

    return (
        <div className="card">
            <div className="toolbar">
                <h3>Recent Expenses</h3>
                <Link to="/expenses" className="btn btn-small btn-link">
                    View All
                </Link>
            </div>

            {loading && <p>Loading recent expenses...</p>}
            {error && <div className="error-message">{error}</div>}

            {!loading && !error && expenses.length === 0 && (
                <p className="empty-state">
                    No expenses yet. <Link to="/expenses/add">Add your first expense</Link>
                </p>
            )}

            {expenses.length > 0 && (
                <ul className="recent-list">
                    {expenses.map((expense) => (
                        <li key={expense.id} className="recent-item">
                            <div>
                                <strong>{expense.title}</strong>
                                <span className="recent-meta">
                                    {expense.categoryName} • {expense.expenseDate}
                                </span>
                            </div>
                            <span className="recent-amount">{formatCurrency(expense.amount)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default RecentExpenses;