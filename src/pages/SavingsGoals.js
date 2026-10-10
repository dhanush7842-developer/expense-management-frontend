import React, { useEffect, useState } from "react";
import {
    addMoney,
    createGoal,
    deleteGoal,
    getAllGoals,
    updateGoal,
} from "../services/savingsGoalService";
import { formatCurrency, getErrorMessage, getTodayDate } from "../utils/helpers";

// One card per goal. It keeps its own "add money" input.
function GoalCard({ goal, onEdit, onDelete, onGoalUpdated }) {
    const [addAmount, setAddAmount] = useState("");
    const [error, setError] = useState("");
    const [adding, setAdding] = useState(false);

    const progress = Number(goal.progressPercentage);

    const handleAddMoney = async (e) => {
        e.preventDefault();
        setError("");

        if (!addAmount || Number(addAmount) <= 0) {
            setError("Enter an amount greater than 0");
            return;
        }

        setAdding(true);
        try {
            const updatedGoal = await addMoney(goal.id, Number(addAmount));
            onGoalUpdated(updatedGoal);
            setAddAmount("");
        } catch (err) {
            setError(getErrorMessage(err, "Failed to add money"));
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="card goal-card">
            <div className="goal-header">
                <h3>{goal.goalName}</h3>
                {goal.completed && <span className="badge-complete">Completed 🎉</span>}
            </div>

            <p className="goal-date">Target date: {goal.targetDate}</p>

            <div className="goal-amounts">
                <div>
                    <span>Target</span>
                    <strong>{formatCurrency(goal.targetAmount)}</strong>
                </div>
                <div>
                    <span>Saved</span>
                    <strong>{formatCurrency(goal.savedAmount)}</strong>
                </div>
                <div>
                    <span>Remaining</span>
                    <strong>{formatCurrency(goal.remainingAmount)}</strong>
                </div>
            </div>

            <div className="progress-bar">
                <div
                    className={goal.completed ? "progress-fill progress-complete" : "progress-fill"}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>
            <p className="goal-progress-text">Progress: {progress.toFixed(2)}%</p>

            {error && <div className="error-message">{error}</div>}

            {!goal.completed && (
                <form className="add-money-row" onSubmit={handleAddMoney}>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Amount to add (₹)"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                    />
                    <button type="submit" className="btn btn-small" disabled={adding}>
                        {adding ? "Adding..." : "Add Money"}
                    </button>
                </form>
            )}

            <div className="actions goal-actions">
                <button className="btn btn-small" onClick={() => onEdit(goal)}>
                    Edit
                </button>
                <button className="btn btn-danger btn-small" onClick={() => onDelete(goal)}>
                    Delete
                </button>
            </div>
        </div>
    );
}

function SavingsGoals() {
    const [goals, setGoals] = useState([]);

    // Form fields
    const [goalName, setGoalName] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [savedAmount, setSavedAmount] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [editingId, setEditingId] = useState(null);   // null = add mode

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadGoals = async () => {
        try {
            setGoals(await getAllGoals());
        } catch (err) {
            setError(getErrorMessage(err, "Failed to load savings goals"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGoals();
    }, []);

    const resetForm = () => {
        setGoalName("");
        setTargetAmount("");
        setSavedAmount("");
        setTargetDate("");
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!goalName.trim()) {
            setError("Goal name is required");
            return;
        }
        if (!targetAmount || Number(targetAmount) <= 0) {
            setError("Target amount must be greater than 0");
            return;
        }
        if (savedAmount !== "" && Number(savedAmount) < 0) {
            setError("Saved amount cannot be negative");
            return;
        }
        if (savedAmount !== "" && Number(savedAmount) > Number(targetAmount)) {
            setError("Saved amount cannot be more than the target amount");
            return;
        }
        if (!targetDate) {
            setError("Target date is required");
            return;
        }

        // Field names must match SavingsGoalRequest.java exactly
        const goalData = {
            goalName: goalName.trim(),
            targetAmount: Number(targetAmount),
            savedAmount: savedAmount === "" ? null : Number(savedAmount),
            targetDate: targetDate,
        };

        setSaving(true);
        try {
            if (editingId) {
                await updateGoal(editingId, goalData);
                setMessage("Savings goal updated successfully");
            } else {
                await createGoal(goalData);
                setMessage("Savings goal created successfully");
            }
            resetForm();
            await loadGoals();
        } catch (err) {
            setError(getErrorMessage(err, "Failed to save savings goal"));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (goal) => {
        setEditingId(goal.id);
        setGoalName(goal.goalName);
        setTargetAmount(goal.targetAmount);
        setSavedAmount(goal.savedAmount);
        setTargetDate(goal.targetDate);
        setError("");
        setMessage("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (goal) => {
        const confirmed = window.confirm(`Delete savings goal "${goal.goalName}"?`);
        if (!confirmed) {
            return;
        }

        setError("");
        setMessage("");
        try {
            await deleteGoal(goal.id);
            setGoals(goals.filter((item) => item.id !== goal.id));
            if (editingId === goal.id) {
                resetForm();
            }
            setMessage("Savings goal deleted successfully");
        } catch (err) {
            setError(getErrorMessage(err, "Failed to delete savings goal"));
        }
    };

    // After "Add Money", replace that one goal in the list with the updated data
    const handleGoalUpdated = (updatedGoal) => {
        setGoals(goals.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal)));
    };

    if (loading) {
        return <p>Loading savings goals...</p>;
    }

    return (
        <div>
            <h2 className="page-title">Savings Goals</h2>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <div className="card form-card">
                <h3>{editingId ? "Edit Savings Goal" : "Add New Savings Goal"}</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Goal Name</label>
                        <input
                            type="text"
                            placeholder="e.g. New Laptop"
                            value={goalName}
                            onChange={(e) => setGoalName(e.target.value)}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Target Amount (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="80000"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>{editingId ? "Saved So Far (₹)" : "Already Saved (₹, optional)"}</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0"
                                value={savedAmount}
                                onChange={(e) => setSavedAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Target Date</label>
                        <input
                            type="date"
                            min={getTodayDate()}
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                        />
                    </div>

                    <div className="actions">
                        <button type="submit" className="btn" disabled={saving}>
                            {saving ? "Saving..." : editingId ? "Update Goal" : "Create Goal"}
                        </button>
                        {editingId && (
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {goals.length === 0 ? (
                <div className="card">
                    <p className="empty-state">No savings goals yet. Create your first goal above.</p>
                </div>
            ) : (
                <div className="goals-grid">
                    {goals.map((goal) => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onGoalUpdated={handleGoalUpdated}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default SavingsGoals;