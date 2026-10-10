import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllGoals } from "../services/savingsGoalService";
import { formatCurrency, getErrorMessage } from "../utils/helpers";

// Show at most this many active goals on the dashboard
const MAX_GOALS_SHOWN = 3;

function SavingsGoalsSummary() {
    const [goals, setGoals] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGoals = async () => {
            try {
                setGoals(await getAllGoals());
            } catch (err) {
                setError(getErrorMessage(err, "Failed to load savings goals"));
            } finally {
                setLoading(false);
            }
        };

        loadGoals();
    }, []);

    // Overall progress across all goals (calculated from the API data)
    const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.targetAmount), 0);
    const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.savedAmount), 0);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    const completedCount = goals.filter((goal) => goal.completed).length;

    // The API returns goals with the nearest target date first
    const activeGoals = goals.filter((goal) => !goal.completed);
    const shownGoals = activeGoals.slice(0, MAX_GOALS_SHOWN);

    return (
        <div className="card">
            <div className="toolbar">
                <h3>Savings Goals</h3>
                <Link to="/savings-goals" className="btn btn-small btn-link">
                    Manage
                </Link>
            </div>

            {loading && <p>Loading savings goals...</p>}
            {error && <div className="error-message">{error}</div>}

            {!loading && !error && goals.length === 0 && (
                <p className="empty-state">
                    No savings goals yet. <Link to="/savings-goals">Create your first goal</Link>
                </p>
            )}

            {!loading && !error && goals.length > 0 && (
                <>
                    {/* Savings progress (all goals together) */}
                    <div className="savings-overview">
                        <h4 className="chart-title">Savings Progress</h4>
                        <div className="summary-line">
                            <span>
                                {formatCurrency(totalSaved)} saved of {formatCurrency(totalTarget)}
                            </span>
                            <strong>{overallProgress.toFixed(1)}%</strong>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${Math.min(overallProgress, 100)}%` }}
                            />
                        </div>
                        <p className="muted">
                            {completedCount} of {goals.length} goals completed
                        </p>
                    </div>

                    {/* Individual goals */}
                    {activeGoals.length === 0 ? (
                        <p className="empty-state">All your goals are completed 🎉</p>
                    ) : (
                        <>
                            {shownGoals.map((goal) => {
                                const progress = Number(goal.progressPercentage);
                                return (
                                    <div key={goal.id} className="savings-goal-item">
                                        <div className="summary-line">
                                            <strong>{goal.goalName}</strong>
                                            <span>{progress.toFixed(2)}%</span>
                                        </div>
                                        <div className="progress-bar progress-bar-small">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                        <p className="muted">
                                            {formatCurrency(goal.savedAmount)} of {formatCurrency(goal.targetAmount)} •{" "}
                                            {formatCurrency(goal.remainingAmount)} remaining • by {goal.targetDate}
                                        </p>
                                    </div>
                                );
                            })}

                            {activeGoals.length > MAX_GOALS_SHOWN && (
                                <p className="muted">
                                    <Link to="/savings-goals">
                                        +{activeGoals.length - MAX_GOALS_SHOWN} more active goals
                                    </Link>
                                </p>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default SavingsGoalsSummary;